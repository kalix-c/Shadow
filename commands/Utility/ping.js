import fs from 'fs';
import axios from 'axios';
import jimp from 'jimp';
import { resolve } from 'path';

async function bal(one, two) {
    const avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    const avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();
    const pth = resolve(process.cwd(), 'cache', 'toilet.png');
    const img = await jimp.read("https://i.postimg.cc/brq6rDDB/received-1417994055426496.jpg");
    
    img.resize(700, 800).composite(avone.resize(100, 200), 100, 25005).composite(avtwo.resize(120, 118), 300, 80);
    
    await img.writeAsync(pth);
    return pth;
}

export default {
    name: "شنق",
    author: "أنا",
    description: "يقوم بإنشاء صورة معالجة معينة",
    role: "member",
    execute: async ({ api, event, args }) => {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return api.sendMessage(" ⚠️ |المرجو عمل منشن ", event.threadID, event.messageID);
        else if (mention.length == 1) {
            const one = event.senderID, two = mention[0];
            bal(one, two).then(ptth => { api.sendMessage({ body: " ✅ | لا تنسى اللفظ وإن ضاق بك الرد", attachment: fs.createReadStream(ptth) }, event.threadID); });
        } else {
            const one = mention[1], two = mention[0];
            bal(one, two).then(ptth => { api.sendMessage({ body: " ✅ | لا تنسى اللفظ وإن ضاق بك الرد", attachment: fs.createReadStream(ptth) }, event.threadID); });
        }
    }
};