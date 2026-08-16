export default {
    name: "مهمة_سرية",
    aliases: ["mission", "مهمة"],
    role: "user",
    cooldowns: 15,
    description: "إرسال أعضاء الحديقة في مهمة استخباراتية لجمع عملات الظل والخبرة.",
    execute: async ({ api, event, Users }) => {
        const { senderID, threadID, messageID } = event;
        const userData = await Users.find(senderID);
        
        if (!userData.status) await Users.create(senderID);

        const missions = [
            "تسلل إلى قواعد طائفة الديابولوس وسرقة وثائق سرية.",
            "إنقاذ أحد حلفاء الحديقة في شوارع العاصمة الملكية.",
            "مراقبة تحركات اللوردات الثلاثة في الظلام.",
            "القضاء على وحش سحري ظهر فجأة في المتاهة."
        ];

        const randomMission = missions[Math.floor(Math.random() * missions.length)];
        const reward = Math.floor(Math.random() * 800) + 200;
        const expGain = Math.floor(Math.random() * 50) + 10;

        const currentMoney = userData.data?.data?.money || 1000;
        const currentExp = userData.data?.data?.exp || 0;
        const currentLevel = userData.data?.data?.level || 1;

        const newMoney = currentMoney + reward;
        const newExp = currentExp + expGain;
        let newLevel = currentLevel;

        if (newExp >= currentLevel * 100) {
            newLevel += 1;
        }

        await Users.update(senderID, {
            money: newMoney,
            exp: newExp,
            level: newLevel
        });

        const msg = `🌑 **تقرير المهمة الاستخباراتية** 🌑\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `⚔️ العملية: ${randomMission}\n` +
                    `🎯 النتيجة: نجاح باهر في الظلال!\n` +
                    `💰 المكافأة: +${reward} عملة ظل\n` +
                    `📈 الخبرة المكتسبة: +${expGain} XP (المستوى: ${newLevel})\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `⚡ *We are Shadow Garden.*`;

        return api.sendMessage(msg, threadID, messageID);
    }
};
