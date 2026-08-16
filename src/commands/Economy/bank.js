import fs from "fs";
import path from "path";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

export default {
    name: "توب",
    author: "محمد الشاوني",
    role: "member",
    description: "اعلام بأعلى المتصدرين في قائمة النقاط.",
    execute: async function ({ api, event }) {
        try {
            const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
            const topUsers = Object.values(pointsData).sort((a, b) => b.points - a.points).slice(0, 5); // احصل على أعلى 5 مستخدمين
            let topMessage = "🏆أعلى متصدرين في النقاط🏆\n";

            topUsers.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"; // تحديد الوسام حسب المركز
                topMessage += `🎖️ | الترتيب : 『${medal}』\n👥 | الإسم : 『${user.name}』\n🔢 | النقاط : 『${user.points}』 نقطة\n`;
            });

            api.sendMessage(topMessage, event.threadID);
        } catch (error) {
            console.error("حدث خطأ أثناء جلب قائمة أعلى المتصدرين:", error);
            api.sendMessage(`حدث خطأ أثناء جلب قائمة أعلى المتصدرين، يرجى المحاولة مرة أخرى`, event.threadID);
        }
    }
};
