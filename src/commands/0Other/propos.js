import jimp from 'jimp';
import fs from 'fs';

async function bal(one, two) {
    let avatarOne = await circle(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    let avatarTwo = await circle(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

    let avone = await jimp.read(await circle(avatarOne));
    let avtwo = await jimp.read(await circle(avatarTwo));

    let img = await jimp.read("https://i.postimg.cc/cLCjPLW4/Picsart-24-05-08-14-32-46-123.jpg");

  img.resize(480, 300).composite(avone.resize(80, 80), 260,
20).composite(avtwo.resize(70, 70), 140, 60);


    const pth = "Propose.jpg";
    await img.writeAsync(pth);
    return pth;
}

async function circle(url) {
    const img = await jimp.read(url);
    img.circle();
    return await img.getBufferAsync(jimp.MIME_PNG);
}

export default {
    name: "إعجاب",
    author: "kaguya project",
    role: "member",
    description: "إرسال صورة للأعجاب بفتاة في جو درامي.",
    execute: async function ({ api, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return api.sendMessage(" ⚠️ | المرجو عمل منشن للفتاة ما", event.threadID);
        else if (mention.length == 1) {
            const one = event.senderID, two = mention[0];
            try {
                const ptth = await bal(one, two);
                return api.sendMessage({ body: "", attachment: fs.createReadStream(ptth) }, event.threadID);
            } catch (error) {
                console.error(error);
                return api.sendMessage("حدث خطأ أثناء إرسال الصورة.", event.threadID);
            }
        } else {
            const one = mention[1], two = mention[0];
            try {
                const ptth = await bal(one, two);
                return api.sendMessage({ body: "", attachment: fs.createReadStream(ptth) }, event.threadID);
            } catch (error) {
                console.error(error);
                return api.sendMessage("حدث خطأ أثناء إرسال الصورة.", event.threadID);
            }
        }
    }
};