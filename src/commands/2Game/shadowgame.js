export default {
    name: "shadowgame",
    aliases: ["لعبة", "مبارزة", "حرب_الظل"],
    role: "user",
    cooldowns: 10,
    description: "نظام ألعاب وفعاليات حديقة الظل (مبارزة وقوة كامنة).",
    execute: async ({ api, event, Users, args }) => {
        const { threadID, messageID, senderID } = event;
        const action = args[0]?.toLowerCase();

        const userData = await Users.find(senderID);
        if (!userData.status) {
            await Users.create(senderID);
        }

        if (!action || action === "help") {
            let helpMsg = "⚡ **ألعاب حديقة الظل (Shadow Games)** ⚡\n\n";
            helpMsg += "1. `!shadowgame duel` - مبارزة ليلية ضد وحش الظل لربح العملات والخبرة.\n";
            helpMsg += "2. `!shadowgame atomic` - تجربة ضربة الطاقة الكامنة (I am Atomic) بفرصة حظ.\n";
            return api.sendMessage(helpMsg, threadID, messageID);
        }

        if (action === "duel") {
            const reward = Math.floor(Math.random() * 500) + 100;
            const userCurrent = await Users.find(senderID);
            const currentMoney = userCurrent.data.data.money || 0;
            
            await Users.update(senderID, { money: currentMoney + reward });
            
            return api.sendMessage(`⚔️ [ SHADOW DUEL ]\nلقد واجهت أحد وحوش الحديقة وهزمته بمهارة ساحقة!\n💰 ربحت: +${reward} عملة ظل.`, threadID, messageID);
        }

        if (action === "atomic") {
            const success = Math.random() > 0.4;
            if (success) {
                const reward = 1500;
                const userCurrent = await Users.find(senderID);
                const currentMoney = userCurrent.data.data.money || 0;
                await Users.update(senderID, { money: currentMoney + reward });
                return api.sendMessage(`⚡ **I AM ATOMIC!** ⚡\nلقد أطلقت طاقتك الكامنة واهتزت عوالم الظل! ربحت جائزة كبرى قدرها +${reward} عملة!`, threadID, messageID);
            } else {
                return api.sendMessage(`🌑 فشل إطلاق طاقة Atomic... تطلب الأمر تركيزاً أكبر في الظلام. حاول مرة أخرى لاحقاً!`, threadID, messageID);
            }
        }

        return api.sendMessage("❌ أمر غير معروف. اكتب `!shadowgame` لعرض قائمة الألعاب.", threadID, messageID);
    }
};
