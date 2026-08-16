export default {
    name: "الحديقة",
    aliases: ["garden", "رتبتي", "مهمة"],
    role: "user",
    cooldowns: 10,
    description: "استعراض رتبتك في حديقة الظل وخوض مهمة استخباراتية.",
    execute: async ({ api, event, Users }) => {
        const { senderID, threadID, messageID } = event;
        const userData = await Users.find(senderID);
        
        if (!userData.status) {
            await Users.create(senderID);
        }

        const currentMoney = userData.data?.data?.money || 1000;
        const level = userData.data?.data?.level || 1;
        
        let rank = "متدرب ظل (Shadow Novice)";
        if (level >= 5) rank = "فارس الظل (Shadow Knight)";
        if (level >= 10) rank = "قائد فرقة (Seven Shades Commander)";
        if (level >= 20) rank = "سيد الظل الأسطوري (Eminence in Shadow)";

        const msg = `🌑 **سجلات حديقة الظل: رتبتك الحالية** 🌑\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `👤 العضو: مسجل في الظلال\n` +
                    `🎖️ الرتبة: ${rank}\n` +
                    `📈 المستوى: ${level}\n` +
                    `💰 عملات الظل: ${currentMoney}\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `💡 اكتب \`.مهمة_سرية\` للخروج في عملية استخباراتية جديدة.\n` +
                    `⚡ *The night belongs to Shadow Garden.*`;

        return api.sendMessage(msg, threadID, messageID);
    }
};
