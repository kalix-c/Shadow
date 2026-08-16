import axios from 'axios';

async function gpt4(prompt, customId) {
  try {
    const apiUrl = `https://smfahim.onrender.com/hercai?ask=${encodeURIComponent(prompt)}`;
    const res = await axios.get(apiUrl);
    return res.data.answer;
  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  name: "ذكاء",
  author: "Kaguya Project",
  role: "member",
  description: "يتفاعل مع الذكاء الاصطناعي ويواصل المحادثة",

  execute: async function({ api, event, args, messageReply }) {
    try {
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
      const { threadID, senderID } = event;
      const prompt = args.join(" ") || "hello";
      const response = await gpt4(prompt, senderID);
      
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);
  
      // إرسال الرسالة مع تحقق من وجود response
      const sentMessage = await api.sendMessage(response, threadID);
      global.client.handler.reply.set(sentMessage.messageID, {
        author: senderID,
        type: "reply",
        name: "ذكاء",
        unsend: false,
      });

      // حذف رسالة الانتظار
      api.unsendMessage(event.messageID);

    } catch (error) {
      api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID);
    }
  },

  onReply: async function({ api, event, reply }) {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        // التعامل مع الردود وإرسالها
        const response = await gpt4(event.body, event.senderID);
        const sentMessage = await api.sendMessage(response, event.threadID);

        // تحديث الرد ليكون استمرارية
        global.client.handler.reply.set(sentMessage.messageID, {
          author: event.senderID,
          type: "reply",
          name: "ذكاء",
          unsend: false,
        });

        // إضافة التفاعل ب ⬇️ بعد الرد بـ تم
        if (event.body.trim().toLowerCase() === "تم") {
          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);
        }
      } catch (error) {
        api.sendMessage(`❌ | حدث خطأ أثناء معالجة ردك: ${error.message}`, event.threadID);
      }
    }
  }
};
