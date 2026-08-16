import axios from "axios";
import path from "path";
import fs from "fs";

export default {
    name: "تطبيقات",
    author: "Hussein Yacoubi",
    role: "member",
    description: "يجلب معلومات حول تطبيق من متجر جوجل بلاي ويترجمها إلى اللغة العربية.",
    async execute({ api, event, args }) {

        api.setMessageReaction("🔍", event.messageID, (err) => {}, true);

        try {
            const searchTerm = args.join(" ");
            if (!searchTerm) {
                return api.sendMessage("يرجى تحديد مصطلح البحث.", event.threadID);
            }

            const apiUrl = `https://smfahim.onrender.com/playstore?q=${encodeURIComponent(searchTerm)}`;
            const response = await axios.get(apiUrl);

            if (response.data && response.data.length > 0) {
                const appInfo = response.data[0];
                const translatedTitle = appInfo.name; // Use the name directly as it's in the desired language

                let message = `━━━━━━◈✿◈━━━━━━\n📝 | اسم التطبيق: ${translatedTitle}\n`;
                message += `🏢 | الشركة المطورة: ${appInfo.developer}\n`;
                message += `⭐ | التقييم: ${appInfo.rate2}\n`;

                if (appInfo.link && appInfo.link !== "undefined") {
                    message += `\n📎 | رابط التطبيق على المتجر: ${appInfo.link}\n━━━━━━◈✿◈━━━━━━`;
                }

                api.sendMessage(message, event.threadID);

                // Download image and send it as attachment
                const imagePath = path.join(process.cwd(), 'cache', 'playstore_app.jpg');
                const imageResponse = await axios.get(appInfo.image, { responseType: 'stream' });
                imageResponse.data.pipe(fs.createWriteStream(imagePath));

                api.setMessageReaction("✅", event.messageID, (err) => {}, true);

                setTimeout(() => {
                    api.sendMessage({
                        attachment: fs.createReadStream(imagePath),
                    }, event.threadID);
                }, 2000);
            } else {
                api.sendMessage("لم يتم العثور على نتائج للبحث.", event.threadID);
            }
        } catch (error) {
            console.error("Error fetching Play Store app info:", error);
            api.sendMessage("حدث خطأ أثناء جلب معلومات التطبيق من متجر جوجل بلاي.", event.threadID);
        }
    }
};
