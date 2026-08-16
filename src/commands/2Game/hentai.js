import fetch from 'node-fetch';

export default {
  name: "كاغويا",
  author: "Kaguya Project",
  role: "member",
  aliases: ["بوت"],
  description: "يرسل ملصق عشوائياً أو يتفاعل مع الذكاء الاصطناعي.",
  async execute({ api, event, args }) {
    const data = [
      "1015156960280119", "1832681453922352", "772035074841442", "1131886254547738", 
      "463741316429523", "360232843844379", "511160708070561", "415593244815496", 
      "1176396180346210", "918551956701051", "1020001456469983", "463741316429523", 
      "360232843844379", "415593244815496", "511160708070561", "1494932474483177", 
      "1020001456469983", "360232843844379", "918551956701051", "463741316429523", 
      "362102093368653", "1494932474483177", "1020001456469983", "918551956701051", 
      "360232843844379", "362102093368653", "835833541484755", "1020001456469983", 
      "1494932474483177", "1013816043428639", "1256779519064751", "467192466059605", 
      "1210419519971441", "1006729237339750", "493778809973286", "338910962505602", 
      "776875071278369", "2505668392967530", "1045092483992592", "7980573828726622", 
      "1652267542175341", "1434090263966559", "3357489131220771", "1037849737939483", 
      "1009939234181096", "861475199177282", "459048116977656", "351566904650840", 
      "1122859335445571", "842573494102145", "1495567557725620", "1015156960280119"
    ];

    const query = args.join(" ").trim();

    // إذا لم يتم إدخال شيء سوى "كاغويا" أو "بوت"، أرسل ملصق عشوائي
    if (!query) {
      const sticker = data[Math.floor(Math.random() * data.length)];
      const msg = { sticker };
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // إذا كان هناك استعلام مع "كاغويا" أو "بوت"، استخدم الذكاء الاصطناعي
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // استخدم الرابط الجديد مع الاستعلام المرسل
      const response = await fetch(`https://smfahim.xyz/hercai?ask=${query}&uid=${event.senderID}`);
      if (!response.ok) {
        return api.sendMessage("API DOWN", event.threadID, event.messageID);
      }

      const data = await response.json();
      api.sendMessage(`${data.answer}`, event.threadID, event.messageID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // إعداد الرد للاستمرار في المحادثة
      global.client.handler.reply.set(event.messageID, {
        author: event.senderID,
        type: "reply",
        name: "كاغويا",
        unsend: false,
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | حدث خطأ أثناء معالجة استفسارك.", event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, reply }) {
    const { threadID, messageID, body, senderID } = event;

    if (reply.type === "reply" && reply.name === "كاغويا") {
      const query = body.trim();
      if (!query) return;

      try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        // استخدم الرابط الجديد مع الاستعلام في الرد
        const response = await fetch(`https://smfahim.xyz/hercai?ask=${query}&uid=${senderID}`);
        if (!response.ok) {
          return api.sendMessage("API DOWN", threadID, messageID);
        }

        const data = await response.json();
        api.sendMessage(`${data.answer}`, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

      } catch (error) {
        console.error(error);
        api.sendMessage("🚧 | حدث خطأ أثناء معالجة استفسارك.", threadID, messageID);
      }
    }
  }
};
