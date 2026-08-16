import fs from "fs-extra";
import jimp from "jimp";

// بقية الكود هنا
export default {
  name: "كراش",
  author: "حسين يعقوبي",
  role: "member",
  description: "صورة للكراش",

  async execute({ api, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length == 0) {
      api.sendMessage(" ✨ | يجب أن تقوم بعمل منشن لحبك الحقيقي", event.threadID);
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
        body: "「 أحبك 💖」",
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
  const image = await jimp.read("https://i.ibb.co/hV4qzCV/image.jpg");
  image.resize(512, 512).composite(avatarone.resize(173, 173), 70, 186);
  const imagePath = "wholesome.png";
  await image.writeAsync(imagePath);
  return imagePath;
}