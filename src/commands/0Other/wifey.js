import axios from "axios";

export default {
  name: "ملصق",
  author: "محمد الشاوني",
  role: "member",
  description: "الرد على الملصقات من خلال الرد عليها أو إرسال ملصق محدد.",
  execute: async function ({ api, event, args }) {
    try {
      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments[0];

        if (attachment.type === "sticker" || attachment.type === "photo") {
          const attachmentID = attachment.ID;
          return api.sendMessage({ body: attachmentID }, event.threadID);
        } else {
          return api.sendMessage("⚠️ | قم بالرد على ملصق أو صورة رمزية", event.threadID);
        }
      } else if (args[0]) {
        return api.sendMessage({ sticker: args[0] }, event.threadID);
      } else {
        return api.sendMessage("فقط رد على الملصق أو الصورة الرمزية 😒", event.threadID);
      }
    } catch (error) {
      console.error('Error:', error.message);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};
