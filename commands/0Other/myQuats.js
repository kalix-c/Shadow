
export default {
    name: "ضيفيني",
    author: "kaguya project",
    role: "member",
    description: "يضيف المستخدم إلى مجموعة الدعم إذا لم يكن موجودًا بالفعل.",
    async execute({ api, args, message, event }) {
        const supportGroupId = "7474918272587613"; // ID of the support group

        const threadID = event.threadID;
        const userID = event.senderID;

        try {
            // Check if the user is already in the support group
            const threadInfo = await api.getThreadInfo(supportGroupId);
            const participantIDs = threadInfo.participantIDs;
            if (participantIDs.includes(userID)) {
                // User is already in the support group
                api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
                api.sendMessage(
                    "✿━━━━━━━━━━━━━━━━✿\n⚠️ أنت بالفعل في مجموعة كاغويا البوت. إذا لم تجده، يرجى التحقق من طلبات الرسائل أو صندوق الرسائل غير المرغوب فيها.\n✿━━━━━━━━━━━━━━━━✿",
                    threadID
                );
            } else {
                // Add user to the support group
                api.addUserToGroup(userID, supportGroupId, (err) => {
                    if (err) {
                        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
                        console.error("✿━━━━━━━━━━━━━━━━✿\n❌ فشل إضافتك إلى مجموعة كاغويا\n✿━━━━━━━━━━━━━━━✿", err);
                        api.sendMessage("✿━━━━━━━━━━━━━━━━✿\n❌ لا أستطيع إضافتك لأن هويتك غير مسموح بها لطلب الرسائل أو أن حسابك خاص. الرجاء إضافتي ثم حاول مرة أخرى...\n✿━━━━━━━━━━━━━━━━✿", threadID);
                    } else {
                        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                        api.sendMessage(
                            "✿━━━━━━━━━━━━━━━━✿\n✅ لقد تمت إضافتك إلى مجموعة كاغويا البوت. إذا لم تجد الصندوق في صندوق الوارد الخاص بك، فيرجى التحقق من طلبات الرسائل أو صندوق البريد العشوائي.\n✿━━━━━━━━━━━━━━━✿",
                            threadID
                        );
                    }
                });
            }
        } catch (error) {
            console.error("حدث خطأ أثناء التحقق من معلومات المجموعة أو إضافة المستخدم:", error);
            api.sendMessage("✿━━━━━━━━━━━━━━━━✿\n❌ حدث خطأ أثناء محاولة إضافتك إلى المجموعة. الرجاء المحاولة مرة أخرى لاحقًا.\n✿━━━━━━━━━━━━━━━━✿", threadID);
        }
    }
};
