const normalizeCommandName = (value) => String(value || "")
  .trim()
  .normalize("NFKC")
  .toLocaleLowerCase("ar");

let controllerModulePromise;

const loadControllers = () => {
  if (!controllerModulePromise) controllerModulePromise = import("../database/controllers/index.js");
  return controllerModulePromise;
};

/**
 * محرك أوامر Shadow المستقل.
 *
 * يبقى الناقل مسؤولًا فقط عن تسليم أحداث Messenger. لا يعتمد هذا المحرك
 * على CommandHandler القديم، ولا يكتب نصوص الرسائل أو المعرّفات في السجل.
 */
export class ShadowResponseEngine {
  constructor({ api, client, createContext } = {}) {
    if (!api?.sendMessage) throw new TypeError("ShadowResponseEngine requires an API with sendMessage.");
    if (!client?.commands || !client?.aliases) throw new TypeError("ShadowResponseEngine requires initialized command maps.");

    this.api = api;
    this.client = client;
    this.createContext = createContext || this.createDefaultContext.bind(this);
  }

  get config() {
    return this.client.config || {};
  }

  get prefix() {
    return String(this.config.prefix || ".");
  }

  isAdmin(senderID) {
    const adminIds = Array.isArray(this.config.ADMIN_IDS) ? this.config.ADMIN_IDS : [];
    return adminIds.map(String).includes(String(senderID || ""));
  }

  parse(event) {
    const body = typeof event?.body === "string" ? event.body.trim() : "";
    if (!body || !body.startsWith(this.prefix)) return null;

    const [rawName, ...args] = body.slice(this.prefix.length).trim().split(/\s+/);
    const name = normalizeCommandName(rawName);
    if (!name) return null;

    return { name, args };
  }

  findCommand(name) {
    const normalizedName = normalizeCommandName(name);

    for (const [key, command] of this.client.commands.entries()) {
      if (normalizeCommandName(key) === normalizedName) return command;
    }

    for (const [alias, target] of this.client.aliases.entries()) {
      if (normalizeCommandName(alias) !== normalizedName) continue;
      return this.findCommand(target);
    }

    return null;
  }

  async createDefaultContext({ event, args }) {
    const {
      economyControllers,
      expControllers,
      statsControllers,
      threadsController,
      usersController,
    } = await loadControllers();

    return {
      api: this.api,
      event,
      args,
      client: this.client,
      Users: usersController({ api: this.api }),
      Threads: threadsController({ api: this.api }),
      Economy: economyControllers({ api: this.api, event }),
      Exp: expControllers({ api: this.api, event }),
      Stats: statsControllers(),
    };
  }

  async reply(event, text) {
    if (!event?.threadID) return null;
    return this.api.sendMessage(text, event.threadID, event.messageID);
  }

  applyCooldown(command, event) {
    if (this.isAdmin(event.senderID)) return { allowed: true };

    const cooldownSeconds = Number(command.cooldowns ?? 3);
    if (!Number.isFinite(cooldownSeconds) || cooldownSeconds <= 0) return { allowed: true };

    if (!this.client.cooldowns) this.client.cooldowns = new Map();
    const commandName = String(command.name || "command");
    if (!this.client.cooldowns.has(commandName)) this.client.cooldowns.set(commandName, new Map());

    const stamps = this.client.cooldowns.get(commandName);
    const now = Date.now();
    const expiresAt = stamps.get(String(event.senderID || "")) || 0;
    if (expiresAt > now) return { allowed: false, seconds: (expiresAt - now) / 1000 };

    stamps.set(String(event.senderID || ""), now + cooldownSeconds * 1000);
    return { allowed: true };
  }

  async dispatchReply(event) {
    const replyId = event?.messageReply?.messageID;
    const reply = replyId ? this.client.handler?.reply?.get?.(replyId) : null;
    if (!reply || reply.author !== event.senderID) return false;

    const command = this.findCommand(reply.name);
    if (!command?.onReply) return false;

    if (reply.unsend) await this.api.unsendMessage?.(replyId);
    if (Number.parseInt(reply.expires, 10) > 0) this.client.handler.reply.delete(replyId);

    const context = await this.createContext({ event, args: [], command });
    await command.onReply({ ...context, reply });
    return true;
  }

  async dispatchReaction(event) {
    const reaction = this.client.handler?.reactions?.get?.(event?.messageID);
    if (!reaction) return false;

    const command = this.findCommand(reaction.name);
    if (!command?.onReaction) return false;

    const context = await this.createContext({ event, args: [], command });
    await command.onReaction({ ...context, reaction });
    return true;
  }

  async dispatch(event) {
    if (!event || !["message", "message_reply", "message_reaction"].includes(event.type)) return { handled: false, outcome: "ignored" };

    try {
      if (event.type === "message_reaction") {
        const handled = await this.dispatchReaction(event);
        return { handled, outcome: handled ? "responded" : "ignored" };
      }
      if (event.type === "message_reply") await this.dispatchReply(event);

      const parsed = this.parse(event);
      if (!parsed) return { handled: false, outcome: "ignored" };

      const command = this.findCommand(parsed.name);
      if (!command?.execute) return { handled: false, outcome: "ignored" };
      if (this.config.botEnabled === false && !this.isAdmin(event.senderID)) return { handled: false, outcome: "ignored" };

      const cooldown = this.applyCooldown(command, event);
      if (!cooldown.allowed) {
        await this.reply(event, `[ SHADOW ]: انتظر ${cooldown.seconds.toFixed(1)} ثانية قبل إعادة المحاولة.`);
        return { handled: true, cooldown: true, outcome: "responded" };
      }

      const context = await this.createContext({ event, args: parsed.args, command });
      await command.execute(context);
      return { handled: true, command: command.name, outcome: "responded" };
    } catch {
      try {
        await this.reply(event, "[ SHADOW ]: تعذّر تنفيذ الأمر الآن. أعد المحاولة بعد لحظات.");
      } catch {
        // Preserve the safe outcome even when the fallback response cannot be delivered.
      }
      return { handled: true, failed: true, outcome: "send_failed" };
    }
  }
}
