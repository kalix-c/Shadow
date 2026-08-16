import fs from "fs-extra";
import jimp from "jimp";

async function bal(one, two) {
  let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();
  let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();
  let pth = "propose.png";
  let img = await jimp.read("https://i.ibb.co/RNBjSJk/image.jpg");

  img.resize(760, 506).composite(avone.resize(90, 90), 210, 65).composite(avtwo.resize(90, 90), 458, 105);

  await img.writeAsync(pth);
  return pth;
}

export default {
  name: "طلب",
  author: "Anonymous",
  role: "member",
  description: "التقدم من اجل خطبة فتاة في جو درامي.",

  async execute({ api, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length == 0) {
      api.sendMessage("🔖 | منشن 😀", event.threadID);
      return;
    } else if (mention.length == 1) {
      const one = event.senderID, two = mention[0];
      bal(one, two).then(ptth => {
        api.sendMessage({
          body: "「 أرجوكي كوني من نصيبي 🤩 」",
          attachment: fs.createReadStream(ptth)
        }, event.threadID);
      });
    } else {
      const one = mention[1], two = mention[0];
      bal(one, two).then(ptth => {
        api.sendMessage({
          body: "",
          attachment: fs.createReadStream(ptth)
        }, event.threadID);
      });
    }
  }
};