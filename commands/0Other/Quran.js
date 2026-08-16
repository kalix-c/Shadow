import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function flipCoin({ api, event }) {
    try {
        const isFaceUp = Math.random() > 0.5;
        let link, body;

        if (isFaceUp) {
            const faceUpLinks = [
                "https://i.ibb.co/xSsMRL9/image.png",
                "https://i.ibb.co/4Zf3M07/image.png",
                "https://i.ibb.co/PCKdPg6/image.png"
            ];
            link = faceUpLinks[Math.floor(Math.random() * faceUpLinks.length)];
            body = "وجه!";
        } else {
            link = "https://i.ibb.co/FhMwzL9/image.png";
            body = "رأس!";
        }

        // تحميل الصورة كملف arraybuffer
        const imageResponse = await axios.get(link, { responseType: 'arraybuffer' });

        // تحديد مسار ملف التخزين المؤقت
        const cachePath = path.join(process.cwd(), 'cache');
        const imagePath = path.join(cachePath, 'coin_flip.png');

        // كتابة الصورة إلى الملف
        fs.writeFileSync(imagePath, imageResponse.data);

        const msg = {
            body: body,
            attachment: fs.createReadStream(imagePath)
        };

        // إرسال الرسالة مع الصورة المخزنة
        api.sendMessage(msg, event.threadID);
    } catch (error) {
        console.error('Error flipping coin:', error);
        api.sendMessage('❌ |حدث خطأ أثناء قلب القطعة.', event.threadID);
    }
}

export default {
    name: 'رأس_أو_وجه',
    author: 'OpenAI',
    role: 'member',
    description: 'يقوم بقلب عملة وإرسال النتيجة (وجه أو رأس) مع صورة معبرة.',
    execute: flipCoin
};