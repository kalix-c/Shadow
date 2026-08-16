
export default {
    name: "الاحترام",
    author: "kaguya project",
    role: "member",
    description: "يضيف المستخدم إلى مجموعة الدعم إذا لم يكن موجودًا بالفعل.",
    async execute({ api, args, event }) {
        try {
            // وضع ردة فعل مبدئية على الرسالة
            api.setMessageReaction("🚫", event.messageID, (err) => {}, true);

            console.log('Sender ID:', event.senderID);

            const permission = ["100076269693499"];
            if (!permission.includes(event.senderID)) {
                return api.sendMessage(
                    "(\/)\ •_•)\/ >🧠 لقد أوقعت هذا يا غبي",
                    event.threadID,
                    event.messageID
                );
            }

            const threadID = event.threadID;
            const adminID = event.senderID;

            // تغيير حالة المستخدم إلى مشرف
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            await api.changeAdminStatus(threadID, adminID, true);

            api.sendMessage(
                `أنا أحترمك يا رئيسي! أنت الآن مشرف في هذه المجموعة.`,
                threadID
            );
        } catch (error) {
            console.error("حدث خطأ أثناء ترقية المستخدم إلى مسؤول:", error);
            api.sendMessage("حدث خطأ أثناء الترقية إلى المشرف.", event.threadID);
        }
    }
};