import moment from "moment-timezone";

export default {
  name: "بيانات",
  author: "محمد الشاوني",
  cooldowns: 5,
  description: "عرض حالة شادو ومدى تغلغله في الظلال.",
  role: "member",
  aliases: ["uptime", "نشاط", "مدة_التشغيل"],
  execute: async ({ api, event }) => {
    const currentTime = moment().tz('Africa/Casablanca').format('YYYY-MM-DD hh:mm:ss A');
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const threads = await api.getThreadList(100, null, ['INBOX']);
    let userCount = 0;
    let groupCount = 0;
    threads.forEach(t => t.isGroup ? groupCount++ : userCount++);

    const output = `🌑 **سجلات حديقة الظل (Shadow Status)** 🌑\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📅 الوقت الحالي: ${currentTime}\n` +
      `⏱️ مدة التربص: ${hours}س ${minutes}د ${seconds}ث\n` +
      `👥 أعضاء الحديقة: ${userCount}\n` +
      `🏰 القلاع (المجموعات): ${groupCount}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *The night is our domain.*`;

    api.sendMessage(output, event.threadID);
  }
};
