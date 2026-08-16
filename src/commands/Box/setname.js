export default {
    name: "ضبط_الإسم",
    author: "ChatGPT",
    role: "member",
    description: "تغيير اسم المجموعة.",
    execute: async ({ api, event, args }) => {
        try {
            const name = args.join(" ");
            if (!name) {
                api.sendMessage("❌ لم تقم بإدخال اسم المجموعة التي ترغب في تغييره", event.threadID, event.messageID);
            } else {
                api.setTitle(name, event.threadID, () => {
                    api.sendMessage(`🔨 قام البوت بتغيير اسم المجموعة إلى: ${name}`, event.threadID, event.messageID);
                });
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("حدث خطأ أثناء تغيير اسم المجموعة.", event.threadID);
        }
    }
};