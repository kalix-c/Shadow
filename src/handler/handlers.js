import { log } from "../logger/index.js";

export class CommandHandler {
  constructor({ api, event, Threads, Users, Economy, Exp, Stats }) {
    this.arguments = {
      api,
      event,
      Users,
      Threads,
      Economy,
      Exp,
      Stats,
    };
    this.client = global.client;
    this.config = this.client?.config || {};
    this.commands = this.client?.commands || new Map();
    this.aliases = this.client?.aliases || new Map();
    this.cooldowns = this.client?.cooldowns || new Map();
    this.handler = this.client?.handler || {};
    this.events = this.client?.events || new Map();
  }

  async handleCommand() {
    try {
      const { Users, Threads, api, event } = this.arguments;
      const { body, threadID, senderID, isGroup, messageID } = event;

      if (!body) return;

      const prefix = this.config.prefix || "!";
      
      // Shadow handles both prefixed and non-prefixed for admins, but enforces prefix for others
      const adminIds = Array.isArray(this.config.ADMIN_IDS) ? this.config.ADMIN_IDS.map(String) : [];
      const isAdmin = adminIds.includes(String(senderID));
      
      let commandBody = body;
      let usedPrefix = "";

      if (body.startsWith(prefix)) {
        usedPrefix = prefix;
        commandBody = body.slice(prefix.length).trim();
      } else if (!isAdmin) {
        // For non-admins, if no prefix, check for specific trigger events or ignore
        return;
      }

      const [cmd, ...args] = commandBody.split(/\s+/);
      if (!cmd) return;

      const commandName = cmd.toLowerCase();
      const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));

      if (!command) return;

      // Check if bot is enabled
      if (!this.config.botEnabled && !isAdmin) return;

      // Check Ban Status
      const [getThread, banUserData] = await Promise.all([
        isGroup ? Threads.find(threadID) : Promise.resolve(null),
        Users.find(senderID)
      ]);

      const banUser = banUserData?.data?.data?.banned;
      if (banUser?.status && !isAdmin) {
        return api.sendMessage(`[ SHADOW ]: You have been banished from the garden. Reason: ${banUser.reason}`, threadID);
      }

      if (isGroup && getThread?.data?.data?.banned?.status && !isAdmin) {
        return; // Silent ignore for banned threads
      }

      // Cooldown Logic
      if (!isAdmin) {
        if (!this.cooldowns.has(command.name)) {
          this.cooldowns.set(command.name, new Map());
        }

        const currentTime = Date.now();
        const timeStamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldowns ?? 3) * 1000;

        if (timeStamps.has(senderID)) {
          const expTime = timeStamps.get(senderID) + cooldownAmount;
          if (currentTime < expTime) {
            const timeLeft = (expTime - currentTime) / 1000;
            return api.sendMessage(`[ SHADOW ]: Patience... The darkness needs ${timeLeft.toFixed(1)}s to gather.`, threadID, messageID);
          }
        }

        timeStamps.set(senderID, currentTime);
        setTimeout(() => timeStamps.delete(senderID), cooldownAmount);
      }

      // Permission Check
      if (command.role && !isAdmin) {
        const threadInfo = isGroup ? await api.getThreadInfo(threadID) : { adminIDs: [] };
        const threadAdminIDs = threadInfo.adminIDs || [];

        if ((command.role === "admin" || command.role === "owner") && !threadAdminIDs.includes(senderID)) {
          api.setMessageReaction("🚫", messageID, (err) => {}, true);
          return api.sendMessage("[ SHADOW ]: You lack the eminence required for this command.", threadID, messageID);
        }
      }

      // Execute command
      log([{ message: "[ SHADOW EXEC ]: ", color: "purple" }, { message: `${command.name} by ${senderID}`, color: "white" }]);
      
      // Update Stats
      const Stats = this.arguments.Stats || (typeof this.arguments.StatsController === "function" ? this.arguments.StatsController() : null);
      if (Stats?.incrementCommand) await Stats.incrementCommand(command.name, senderID);

      const currentUser = await Users.find(senderID);
      if (currentUser?.status) {
        const currentStats = currentUser.data?.data?.stats || {};
        await Users.update(senderID, {
          stats: {
            ...currentStats,
            commandsUsed: Number(currentStats.commandsUsed || 0) + 1
          }
        });
      }

      await command.execute({ ...this.arguments, args });
      
    } catch (error) {
      log([{ message: "[ SHADOW ERROR ]: ", color: "red" }, { message: error.message, color: "white" }]);
    }
  }

  async handleEvent() {
    try {
      for (const cmd of this.commands.values()) {
        if (typeof cmd.events === "function") await cmd.events({ ...this.arguments });
      }
      for (const ev of this.events.values()) {
        if (typeof ev.execute === "function") await ev.execute({ ...this.arguments });
      }
    } catch (err) {
      console.error("Event Handler Error:", err);
    }
  }

  async handleReply() {
    const { messageReply } = this.arguments.event;
    if (!messageReply) return;

    const reply = this.handler.reply.get(messageReply.messageID);
    if (!reply) return;

    if (reply.unsend) this.arguments.api.unsendMessage(messageReply.messageID);

    const command = this.commands.get(reply.name);
    if (!command) return;

    if (parseInt(reply.expires)) {
      setTimeout(() => this.handler.reply.delete(messageReply.messageID), reply.expires * 1000);
    }

    command.onReply && (await command.onReply({ ...this.arguments, reply }));
  }

  async handleReaction() {
    if (this.arguments.event.type !== "message_reaction") return;
    
    const messageID = this.arguments.event.messageID;
    const reaction = this.handler.reactions.get(messageID);
    if (!reaction) return;

    const command = this.commands.get(reaction.name);
    if (!command) return;

    command.onReaction && (await command.onReaction({ ...this.arguments, reaction }));
  }
}
