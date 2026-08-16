import jimp from 'jimp';
import fs from 'fs';

async function bal(one, two) {
    let avatarOne = await circle(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    let avatarTwo = await circle(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

    let avone = await jimp.read(await circle(avatarOne));
    let avtwo = await jimp.read(await circle(avatarTwo));

    // استخدام رابط الصورة الجديد
    let img = await jimp.read("https://i.imgur.com/hmKmmam.jpg");

    // تحديث الإحداثيات والمقاسات
    img.resize(1024, 712)
       .composite(avone.resize(200, 200), 527, 141)
       .composite(avtwo.resize(200, 200), 389, 407);

    const pth = "زواج.png";
    await img.writeAsync(pth);
    return pth;
}

async function circle(url) {
    const img = await jimp.read(url);
    img.circle();
    return await img.getBufferAsync(jimp.MIME_PNG);
}

export default {
    name: "سيلفي",
    author: "Anonymous",
    role: "member",
    description: "إرسال صورة زفاف بين عروسين محددين.",
    execute: async function ({ api, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return api.sendMessage("اعمل منشن لفتاة ما 😎", event.threadID);
        else if (mention.length == 1) {
            const one = event.senderID, two = mention[0];
            try {
              api.setMessageReaction("🤳", event.messageID, (err) => {}, true);
  
                const ptth = await bal(one, two);
                return api.sendMessage({ body: "❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜\n سيلفي مع حبيبتي 😎 \n❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜", attachment: fs.createReadStream(ptth) }, event.threadID);
            } catch (error) {
                console.error(error);
                return api.sendMessage("حدث خطأ أثناء إرسال الصورة.", event.threadID);
            }
        } else {
            const one = mention[1], two = mention[0];
            try {
                const ptth = await bal(one, two);
                return api.sendMessage({ body: " ❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜\n سيلفي مع حبيبتي 😎\n❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜", attachment: fs.createReadStream(ptth) }, event.threadID);
            } catch (error) {
                console.error(error);
                return api.sendMessage("حدث خطأ أثناء إرسال الصورة.", event.threadID);
            }
        }
    }
};
