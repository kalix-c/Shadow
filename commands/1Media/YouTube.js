export default {
  name: "مجهول",
  author: "Kaguya Project",
  role: "owner",
  description: "يرسل رسالة بشكل مجهول إلى صندوق الرسائل المحدد.",

  execute: async function({ api, event, args }) {
    if (args.length < 2) {
      return api.sendMessage(
        "❌ | خطأ في الصيغة، استخدم: مجهول معرف المجموعة [الرسالة]",
        event.threadID,
        event.messageID
      );
    }

    const idBox = args[0];
    const message = args.slice(1).join(" ");

    try {
      // الحصول على معلومات الصندوق
      const threadInfo = await api.getThreadInfo(idBox);
      
      if (!threadInfo) {
        return api.sendMessage(
          "❌ | لم يتم العثور على الصندوق المحدد.",
          event.threadID,
          event.messageID
        );
      }

      // إرسال الرسالة بشكل مجهول
      await api.sendMessage({
        body: message,
        mentions: [{
          tag: "@anon",
          id: event.senderID
        }]
      }, idBox);
      
      api.sendMessage(
        `✅ | تم إرسال الرسالة "${message}" إلى ${threadInfo.name} بشكل مجهول.`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      api.sendMessage(
        `❌ | حدث خطأ أثناء إرسال الرسالة: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
