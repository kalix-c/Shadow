export default {
  name: "مسح",
  author: "Shadow Garden Project",
  cooldowns: 10,
  description: "مسح رسائل ال",
  role: "member",
  aliases: ["gỡ"],
  execute: async ({ api, event }) => {
    if (event?.messageReply?.senderID != api.getCurrentUserID()) {
      return global.shadow.reply(" ⚠️ |لا يمكن مسح رسائل الآخرين!");
    }

    return global.shadow.unsend(event.messageReply.messageID, (err) => {
      if (err) {
        return global.shadow.reply(" ⚠️ |لقد حدث خطأ، رجاء أعد المحاولة لاحقا!");
      }
    });
  },
  events: async ({ api, event }) => {
    var reaction = ["😡"];
    if (event.reaction && event.senderID == api.getCurrentUserID() && reaction.includes(event.reaction)) {
      global.shadow.unsend(event.messageID);
    }
  },
};
