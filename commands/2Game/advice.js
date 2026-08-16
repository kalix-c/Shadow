import axios from 'axios';
import srod from 'srod-v2';

async function executeCommand({ api, event, args, message }) {
    try {
        const adviceResult = await srod.GetAdvice();
        const advice = adviceResult.embed.description;

        let translatedAdvice = await translateAdvice(advice);

        let messageToSend = `❏ النصيحة: ${translatedAdvice}`;

        return api.sendMessage(messageToSend, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
    }
}

async function translateAdvice(advice) {
    try {
        const response = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(advice)}`
        );
        const translations = response.data[0];
        const translatedAdvice = translations.reduce((accumulator, translation) => {
            if (translation[0]) {
                accumulator += translation[0];
            }
            return accumulator;
        }, '');
        return translatedAdvice;
    } catch (error) {
        console.error(error);
        return ' ❌ | حدث خطأ أثناء الترجمة .';
    }
}

export default {
    name: "نصيحة",
    author: "حسين يعقوبي",
    role: "member",
    description: "تعكيك كاغويا نصيحة ",
    execute: executeCommand
};