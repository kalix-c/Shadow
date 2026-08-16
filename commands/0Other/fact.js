import axios from 'axios';

export default {
    name: 'فاكت',
    author: 'kaguya project',
    role: 'member',
    aliases:['كت'],
    description: 'جلب حقيقة وترجمتها إلى العربية.',
    
    execute: async function ({ api, event }) {
        try {
            // جلب الحقيقة من الرابط
            const factResponse = await axios.get('https://smfahim.onrender.com/fact');
            const fact = factResponse.data.fact;

            if (!fact) {
                return api.sendMessage("❓ | عذرًا، لم أتمكن من جلب الحقيقة.", event.threadID, event.messageID);
            }

            // ترجمة الحقيقة إلى العربية
            const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(fact)}`);
            const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

            if (!translatedText) {
                return api.sendMessage("❓ | عذرًا، لم أتمكن من ترجمة الحقيقة.", event.threadID, event.messageID);
            }

            // إرسال الحقيقة المترجمة
            api.sendMessage(`●═══════❍═══════●\n📝 | فاكت : ${fact} \n : ${translatedText}\n●═══════❍═══════●`, event.threadID, event.messageID);
        } catch (error) {
            console.error('خطأ أثناء جلب أو ترجمة الحقيقة:', error.message);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
        }
    }
};
