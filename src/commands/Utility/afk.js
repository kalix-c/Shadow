class Afk {
  name = "مشغول";
  author = "Kaguya Project";
  cooldowns = 10;
  description = "قم بضبط وضع مشغول في حالة تم عمل منشن لك البوت سيخبرك";
  role = "member";
  dataUser = {};

  async execute({ api, event, args, Users }) {
    const reason = args.join(" ") || "No reason";
    try {
      const nameUser = (await Users.find(event.senderID))?.data?.data?.name || event.senderID;
      this.dataUser[event.senderID] = { reason, nameUser, tag: [] };
      const message = `قام بتشغيل وضع عدم الإزعاج مع السبب : ${reason}`;
      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (err) {
      console.log(err);
    }
  }

  async events({ event, api }) {
    try {
      if (event.senderID in this.dataUser) {
        const tags = this.dataUser[event.senderID].tag.join(`\n` + '-'.repeat(30) + "\n");
        const message = `مرحبا بعودتك الأشخاص الذين قاموا بعمل منشن لك عندما كنت غائبًا هم كالتالي:\n\n${tags}`;
        return api.sendMessage(message, event.threadID, () => {
          delete this.dataUser[event.senderID];
        }, event.messageID);
      }

      if (!event.mentions) return;

      for (let id of Object.keys(event.mentions)) {
        if (id in this.dataUser) {
          const message = `المستخدم ${this.dataUser[id].nameUser} هو مشغول والسبب : ${this.dataUser[id].reason}`;
          const tagMessage = ` 📎 | المعرف : ${event.senderID}\n نوي نانوغرام: ${event.body}\n📅 | التاريخ : ${new Date().toLocaleString("vi-VN", { timeZone: "Africa/Casablanca" })}`;
          this.dataUser[id].tag.push(tagMessage);
          api.sendMessage(message, event.threadID, event.messageID);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

export default new Afk();
