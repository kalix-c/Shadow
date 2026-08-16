class Kick {
  name = "طرد";
  author = "Shadow Garden Project";
  cooldowns = 60;
  description = "قم بطرد الأعضاء المحددين من المجموعة";
  role = "admin";
  aliases = ["إبلع"];

  async execute({ api, event, Threads }) {
    try {
      const mentions = Object.keys(event.mentions);
      const targetUserID = event?.messageReply?.senderID || (mentions.length > 0 ? mentions[0] : null);

      if (!targetUserID) {
        return api.sendMessage(" ⚠️ | المرجو الرد على رسالة الشخص الذي تريد طرده أو عمل منشن له.", event.threadID);
      }

      const threadData = (await Threads.find(event.threadID))?.data?.data;
      if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
        return api.sendMessage(" ⚠️ | يحتاج البوت أن يكون آدمن لإستخدام هذه الميزة", event.threadID);
      }

      await api.removeUserFromGroup(targetUserID, event.threadID);
      api.sendMessage("✅ | طلباتك أوامر !\n ناقص واحد ناقص مشكلة 😌", event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage(" ⚠️ | لقد حدث خطأ غير متوقع!", event.threadID);
    }
  }
}

export default new Kick();
