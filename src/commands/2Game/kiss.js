import fs from "fs-extra";
import jimp from "jimp";

export default {
  name: "قبر",
  author: "حسين يعقوبي",
  role: "member",
  description: "صورة على قبر",

  async execute({ api, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length == 0) {
      api.sendMessage(" 🔖 | يجب أن تقوم بعمل منشن اولا 🐸", event.threadID);
      return;
    }

    let one;
    if (mention.length == 1) {
      one = mention[0];
    } else {
      one = mention[0];
    }

    try {
      const imagePath = await bal(one);
      api.sendMessage({
        body: "كانا انسانا طيبا 🤧",
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);
    } catch (error) {
      console.error("Error while running command:", error);
      api.sendMessage("حدث خطأ", event.threadID);
    }
  }
};

async function bal(one) {
  const avatarone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const image = await jimp.read("https://i.imgur.com/A4quyh3.jpg");

  // تحديد إحداثيات الصورة الشخصية في الصورة النهائية
  const avatarX = 160; // موقع الصورة الشخصية على محور X
  const avatarY = 120; // موقع الصورة الشخصية على محور Y

  image.resize(500, 670).composite(avatarone.resize(173, 173), avatarX, avatarY);
  const imagePath = "rip.jpg";
  await image.writeAsync(imagePath);
  return imagePath;
}