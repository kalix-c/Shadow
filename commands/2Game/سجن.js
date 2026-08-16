import fs from 'fs-extra';
import jimp from 'jimp';

export default {
  name: "سبيدرمان",
  author: "حسين يعقوبي",
  role: "member",
  description: "ميمز سبيدرمان",

  async execute({ api, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length == 0) {
      api.sendMessage(" 🔖 | يجب أن تقوم بعمل منشن اولا 🐸", event.threadID);
      return;
    }

    let one;
    if (mention.length == 1) {
      one = event.senderID;
    } else {
      one = mention[1];
    }

    try {
      const imagePath = await bal(one, mention[0]);
      api.sendMessage({ body: "مهلا إذا كنت انت سبيدرمان فمن أنا 🤨", attachment: fs.createReadStream(imagePath) }, event.threadID);
    } catch (error) {
      console.error("Error while running command:", error);
      api.sendMessage("حدث خطأ", event.threadID);
    }
  }
};

async function bal(one, two) {
  const avatarOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const avatarTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

  avatarOne.circle();
  avatarTwo.circle();

  const imagePath = "marble.png";
  const image = await jimp.read("https://i.imgur.com/AIizK0f.jpeg");
  image.resize(1440, 1080).composite(avatarOne.resize(170, 170), 325, 110).composite(avatarTwo.resize(170, 170), 1000, 95);
  await image.writeAsync(imagePath);

  return imagePath;
}