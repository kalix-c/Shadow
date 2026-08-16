import axios from "axios";
import fs from "fs";
import path from "path";
import moment from "moment-timezone";

async function execute({ api, event }) {
  try {
    const choices = [
      "\n1 ≻ فيتنام",
      "\n2 ≻ المغرب",
      "\n3 ≻ اليابان",
      "\n4 ≻ تايلاند",
      "\n5 ≻ الولايات المتحدة الامريكية",
      "\n6 ≻ كمبوديا",
      "\n\n📌رد على الرسالة برقم حتى تشتغل باحدى الدول !"
    ];

    const imageLink = "https://i.imgur.com/Jzv04vv.jpg";

    const message = choices.join("") + `\n\n`;

    // تحميل الصورة وحفظها محليًا
    const imageResponse = await axios.get(imageLink, { responseType: "arraybuffer" });
    const cacheFolderPath = path.join(process.cwd(), "/cache");
    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }
    const imagePath = path.join(cacheFolderPath, "image.jpg");
    fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

    // إرسال الرسالة مع الصورة
    api.sendMessage({
      body: message,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, async (err, info) => {
      if (!err) {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "كهف",
          unsend: true,
        });
      } else {
        console.error("Error sending message:", err);
      }
    });
  } catch (error) {
    console.error("Error executing the game:", error);
    api.sendMessage("An error occurred while executing the game. Please try again.", event.threadID);
  }
}

async function onReply({ api, event, reply, Economy, Users }) {
  // Check if the person replying is the original author
  if (event.senderID !== reply.author) {
    return api.sendMessage("⚠️ | ليس لك.", event.threadID, event.messageID);
  }

  if (reply.type === "pick") {
    const choices = [
      "\nفيتنام",
      "\nالمغرب",
      "\nاليابان",
      "\nتايلاند",
      "\nالولايات المتحدة الامريكية",
      "\nكمبوديا"
    ];

    const rewardAmounts = [5000, 4800, 4700, 4600, 4500, 400, 1000,500,3000,300,200,5000,100,50,7000,3200,2000,3600];
    const choiceIndex = parseInt(event.body);
    const choiceDescription = choices[choiceIndex - 1];

    if (isNaN(choiceIndex) || choiceIndex < 1 || choiceIndex > 6) {
      return api.sendMessage("⚠️ | أرجوك قم بالرد برقم الدولة المتوفرة.", event.threadID);
    }

    const currentTime = moment().unix();
    const cooldownPeriod = 86400; // فترة الانتظار: يوم واحد بالثواني
    const cooldownKey = `cooldowns_kahf_${event.senderID}`;

    try {
      const user = await Users.find(event.senderID);
      const lastCheckedTime = user?.data?.data?.other?.[cooldownKey];

      if (lastCheckedTime && currentTime - lastCheckedTime < cooldownPeriod) {
        const remainingTime = cooldownPeriod - (currentTime - lastCheckedTime);
        const duration = moment.duration(remainingTime, 'seconds');
        return api.sendMessage(`⚠️ | لقد عملت اليوم. لتجنب الإرهاق، يرجى العودة بعد: ${duration.hours()} ساعات ${duration.minutes()} دقائق ${duration.seconds()} ثواني.`, event.threadID);
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const rewardAmount = rewardAmounts[choiceIndex - 1];
      const msg = ` ✅ |لقد اشتغلت بالكهوف بـ دولة ${choiceDescription} وحصلت على ${rewardAmount} دولار 💵`;

      await Economy.increase(rewardAmount, event.senderID);

      await Users.update(event.senderID, {
        other: {
          [cooldownKey]: currentTime,
        },
      });

      api.sendMessage(msg, event.threadID);
    } catch (error) {
      console.error("Error handling reply:", error);
      api.sendMessage("An error occurred while handling your reply. Please try again.", event.threadID);
    }
  }
}

export default {
  name: "كهف",
  author: "Kaguya Project",
  cooldowns: 50,
  description: "لعبة الكهف للعمل في المناجم و كسب المال",
  role: "member",
  execute,
  onReply,
};
