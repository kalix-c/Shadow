import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import request from 'request';

async function getQuranVerse({ api, event, args }) {
    try {
        const s1 = args[0];
        const s2 = args[1];

        if (!s1 || !s2) {
            return api.sendMessage("تأكد أنك وضعت الأمر بهذا الشكل:\n\n آيات رقم السورة مسافة ثم رقم الآية \n مثال:\n آيات 1 2", event.threadID, event.messageID);
        }

        const url = `https://api.quran.gading.dev/surah/${s1}/${s2}`;
        const response = await fetch(url);
        const data = await response.json();

        const audioLink = data.data.audio.secondary[0];
        const cacheDir = path.join(process.cwd(), 'cache');
        const audioFilePath = path.join(cacheDir, 'quran_aud.mp3');

        request({ url: audioLink, encoding: null }, (error, response, body) => {
            if (error) {
                console.error('Error fetching Quran audio:', error);
                return;
            }

            fs.writeFileSync(audioFilePath, body);
            api.sendMessage({ body: `${data.data.text.arab}`, attachment: fs.createReadStream(audioFilePath) }, event.threadID, () => fs.unlinkSync(audioFilePath), event.messageID);
        });
    } catch (error) {
        console.error('Error getting Quran verse:', error);
        api.sendMessage('❌ |حدث خطأ أثناء جلب الآية القرآنية.', event.threadID);
    }
}

export default {
    name: 'آيات',
    author: 'kaguya project',
    role: 'member',
    description: 'يقوم بجلب الآية القرآنية بناءً على رقم السورة ورقم الآية.',
    execute: getQuranVerse
};