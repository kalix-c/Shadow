export default {
  name: "الحديقة",
  aliases: ["رتبتي"],
  role: "user",
  cooldowns: 10,
  description: "استعراض رتبتك في حديقة الظل ومستواك وعملاتك.",

  execute: async ({ api, event, Users }) => {
    const { senderID, threadID, messageID } = event;
    let userData = await Users.find(senderID);

    if (!userData.status) {
      await Users.create(senderID);
      userData = await Users.find(senderID);
    }

    if (!userData.status) {
      return api.sendMessage("تعذر تحميل سجل عضو الحديقة.", threadID, messageID);
    }

    const currentMoney = Number(userData.data?.data?.money || 0);
    const level = Number(userData.data?.data?.level || 1);

    let rank = "متدرب الظل";
    if (level >= 5) rank = "فارس الظل";
    if (level >= 10) rank = "قائد إحدى الظلال السبع";
    if (level >= 20) rank = "سيد الظل الأسطوري";

    const msg = `🌑 سجلات حديقة الظل 🌑\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 العضو: ${userData.data?.name || "عضو مجهول"}\n` +
      `🎖️ الرتبة: ${rank}\n` +
      `📈 المستوى: ${level}\n` +
      `💰 عملات الظل: ${currentMoney}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `اكتب .مهمة_سرية لإطلاق مهمة استخباراتية جديدة.`;

    return api.sendMessage(msg, threadID, messageID);
  }
};
