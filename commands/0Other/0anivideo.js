import fs from 'fs-extra';
import path from 'path';


const userDataFile = path.join(process.cwd(), 'pontsData.json');

export default {
    name: "صرف",
    author: "kaguya project",
    role: "member",
    description: "يتم تحويل النقاط من ملف pontsData.json إلى الرصيد بمعدل 5 دولار لكل نقطة باستخدام Economy.increase.",
    async execute({ api, event, args, Economy }) {
        if (!args[0]) {
            return api.sendMessage(
                "◆━━◆🏛 بنك صرف النقاط 🏛◆━━◆" +
                "\n» الرجاء إدخال اختيارك «" +
                "\nاكتب صرف نقاطك" +
                "\nيمكنك جلب النقاط من لعب الالعاب" +
                "\nنقطة = 5 دولار 💵",
                event.threadID
            );
        }

        if (args[0] == "check") {
            const userData = fs.readJsonSync(userDataFile, { throws: false });
            if (!userData[event.senderID]) {
                return api.sendMessage("ليس لديك نقاط كافية للتحويل.", event.threadID);
            }
            return api.sendMessage(`${event.senderID} لديك ${userData[event.senderID].points} نقطة`, event.threadID, event.messageID);
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return api.sendMessage("الرجاء إدخال كمية صحيحة من النقاط للتحويل.", event.threadID);
        }

        const userData = fs.readJsonSync(userDataFile, { throws: false });
        if (!userData[event.senderID] || userData[event.senderID].points < amount) {
            return api.sendMessage("ليس لديك نقاط كافية للتحويل.", event.threadID);
        }

        const convertedAmount = amount * 5; // تحويل كل نقطة إلى 10 دولار
        await Economy.increase(convertedAmount, event.senderID);

        userData[event.senderID].points -= amount;
        fs.writeJsonSync(userDataFile, userData);

        const date = new Date().toLocaleString();
        const message = `💸 تم التحويل بنجاح!\nالتفاصيل:\n- الوقت: ${date}\n- تم تحويل ${amount} نقطة إلى ${convertedAmount} دولار 💵 بنجاح`;
        return api.sendMessage(message, event.threadID);
    }
};
