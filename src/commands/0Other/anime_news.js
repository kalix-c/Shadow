import malScraper from 'mal-scraper';
import axios from 'axios';

export default {
    name: "أخبار_الأنمي",
    author: "kaguya project",
    role: "member",
    description: "يرسل أهم 5 أخبار عن الأنمي باللغة العربية.",

    async execute({ api, event }) {
        const nbNews = 5;

        try {
            const news = await malScraper.getNewsNoDetails(nbNews);
            const translatedTitles = await Promise.all(news.map(news => translateToArabic(news.title)));

            let messageBody = "أهم 5 أخبار عن الأنمي\n";
            translatedTitles.forEach((title, index) => {
                messageBody += `『 ${index + 1} 』${title}\n\n`;
            });

            api.sendMessage(messageBody, event.threadID, event.messageID);
        } catch (error) {
            console.error("حدث خطأ أثناء جلب الأخبار:", error);
            api.sendMessage("❌ |عذرًا، حدث خطأ ما أثناء جلب الأخبار.", event.threadID);
        }
    }
};

async function translateToArabic(query) {
    try {
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(query)}`);
        return translationResponse.data[0][0][0];
    } catch (error) {
        console.error("تعذر الترجمة:", error);
        return query;
    }
}