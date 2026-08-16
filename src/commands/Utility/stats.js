export default {
  name: "إحصائيات",
  aliases: ["احصائيات", "احصائياتي"],
  role: "user",
  cooldowns: 5,
  description: "عرض إحصائيات البوت ونشاطك في حديقة الظل.",

  execute: async ({ api, event, Stats, Users }) => {
    const { threadID, messageID, senderID } = event;
    const globalStats = Stats?.getStats?.() || {
      totalCommands: 0,
      commandsMap: {},
      dailyActiveUsers: {}
    };
    const userData = await Users.find(senderID);
    const today = new Date().toISOString().split("T")[0];
    const topCommands = Object.entries(globalStats.commandsMap || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => `${index + 1}. ${name}: ${count}`)
      .join("\n") || "لا توجد أوامر مسجلة بعد.";

    let msg = "🌑 إحصائيات حديقة الظل 🌑\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      `📊 إجمالي الأوامر: ${globalStats.totalCommands || 0}\n` +
      `👥 الأعضاء النشطون اليوم: ${globalStats.dailyActiveUsers?.[today]?.length || 0}\n\n` +
      "🏆 أكثر الأوامر استخدامًا:\n" +
      `${topCommands}\n`;

    if (userData.status) {
      const data = userData.data?.data || {};
      const personalStats = data.stats || {};
      msg += "\n👤 سجلك في الظلال:\n" +
        `⚔️ أوامرك المنفذة: ${personalStats.commandsUsed || 0}\n` +
        `💰 رصيدك: ${data.money || 0} عملة ظل\n` +
        `📈 مستواك: ${data.level || 1}`;
    }

    msg += "\n━━━━━━━━━━━━━━━━━━\n" +
      "تُرصد كل حركة من خلف الكواليس.";
    return api.sendMessage(msg, threadID, messageID);
  }
};
