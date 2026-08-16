export default {
    name: "stats",
    aliases: ["احصائيات", "احصائياتي"],
    role: "user",
    cooldowns: 5,
    description: "عرض إحصائيات البوت والنشاط العام.",
    execute: async ({ api, event, Stats, Users }) => {
        const { threadID, messageID, senderID } = event;
        const globalStats = Stats.getStats();
        const userData = await Users.find(senderID);
        
        let msg = "🌑 **إحصائيات حديقة الظل** 🌑\n\n";
        msg += `📊 إجمالي الأوامر المنفذة: ${globalStats.totalCommands}\n`;
        msg += `👥 الأعضاء النشطون اليوم: ${globalStats.dailyActiveUsers[new Date().toISOString().split('T')[0]]?.length || 0}\n\n`;
        
        if (userData.status) {
            msg += "👤 **إحصائياتك الشخصية:**\n";
            msg += `⚔️ الأوامر التي استخدمتها: ${userData.data.data.stats.commandsUsed || 0}\n`;
            msg += `💰 رصيدك: ${userData.data.data.money} عملة\n`;
            msg += `📈 المستوى: ${userData.data.data.level}\n`;
        }
        
        msg += "\n--- ⚡ Shadow Bot ⚡ ---";
        return api.sendMessage(msg, threadID, messageID);
    }
};
