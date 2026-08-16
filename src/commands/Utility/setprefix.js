export default {
  name: "البادئة",
  aliases: ["الرمز"],
  role: "admin",
  cooldowns: 30,
  description: "عرض بادئة Shadow الثابتة.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    if (args?.[0] && args[0] !== ".") {
      return api.sendMessage("بادئة Shadow موحدة وثابتة: النقطة (.) فقط.", threadID, messageID);
    }
    return api.sendMessage(
      "بادئة Shadow الرسمية هي النقطة (.). مثال: .اوامر أو .إحصائيات",
      threadID,
      messageID
    );
  }
};
