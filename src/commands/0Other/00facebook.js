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
    const img = await jimp.read("https://i.imgur.com/bAsnmmD.jpg");

    img.composite(avone.resize(200, 200), 255, 255).composite(avtwo.resize(200, 200), 30, 20);

    await img.writeAsync(pth);
    return pth;
}

export default {
    name: "تحدي",
    author: "kaguya project",
    description: "تحدى شخصا ما",
    role: "member",
    execute: async ({ api, event, args }) => {
        const senderID = event.messageReply?.senderID || event.senderID;
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) {
            return api.sendMessage("⚠️ | المرجو عمل منشن للشخص الذي تريد أن تتحداه", event.threadID, event.messageID);
        } else if (mention.length == 1) {
            const one = senderID, two = mention[0];
            bal(one, two).then(ptth => {
                api.sendMessage({ body: "", attachment: fs.createReadStream(ptth) }, event.threadID);
            });
        } else {
            const one = mention[1], two = mention[0];
            bal(one, two).then(ptth => {
                api.sendMessage({ body: "", attachment: fs.createReadStream(ptth) }, event.threadID);
            });
        }
    }
};
