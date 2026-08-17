import { CommandHandler } from "../handler/handlers.js";
import { threadsController, usersController, economyControllers, expControllers, statsControllers } from "../database/controllers/index.js";
import { utils } from "../../helper/index.js";

/**
 * Tạo một trình xử lý sự kiện với các đối tượng và đối số cụ thể.
 * @param {object} api - Đối tượng API.
 * @param {object} event - Sự kiện cụ thể.
 * @param {object} User - Đối tượng người dùng.
 * @param {object} Thread - Đối tượng chủ đề.
 * @param {object} Economy - Đối tượng kinh tế.
 * @param {object} Exp - Đối tượng kinh nghiệm.
 * @returns {CommandHandler} - Trình xử lý lệnh.
 */
const createHandler = (api, event, User, Thread, Economy, Exp, Stats) => {
  const args = { api, event, Users: User, Threads: Thread, Economy, Exp, Stats };
  return new CommandHandler(args);
};

/**
 * Xử lý sự kiện chính.
 * @param {object} options - Các tùy chọn xử lý sự kiện.
 */
const listen = async ({ api, event, client = global.client }) => {
  try {
    const { threadID, senderID, type, userID, from, isGroup } = event;
    console.log(`[ MQTT EVENT ]: Received event type=${type || "unknown"}; source=${isGroup ? "group" : "direct"}.`);
    const Thread = threadsController({ api });
    const User = usersController({ api });
    const Economy = economyControllers({ api, event });
    const Exp = expControllers({ api, event });
    const Stats = statsControllers();

    if (["message", "message_reply", "message_reaction", "typ"].includes(type)) {
      try {
        // Facebook currently rejects Kaguya's legacy thread-info GraphQL query
        // for this session. Thread metadata is optional for command routing, so
        // never let that enrichment request block ordinary incoming commands.
        // It can be enabled deliberately for maintenance when the upstream API
        // becomes available again.
        if (isGroup && process.env.SHADOW_ENRICH_THREAD_METADATA === "YES") {
          await Thread.create(threadID);
        }
        await User.create(senderID || userID || from);
      } catch (error) {
        console.warn("[ SHADOW DB ]: Message metadata could not be refreshed; continuing to handle the event.");
      }
    }

    global.shadow = utils({ api, event, client });

    const handler = createHandler(api, event, User, Thread, Economy, Exp, Stats);
    await handler.handleEvent();

    switch (type) {
      case "message":
        console.log(`[ MQTT EVENT ]: Received ${isGroup ? "group" : "direct"} message; forwarding to command handler.`);
        await handler.handleCommand();
        break;
      case "message_reaction":
        await handler.handleReaction();
        break;
      case "message_reply":
        await handler.handleReply();
        console.log(`[ MQTT EVENT ]: Received ${isGroup ? "group" : "direct"} reply; forwarding to command handler.`);
        await handler.handleCommand();
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Error during processing:", error);
  }
};

export { listen };
