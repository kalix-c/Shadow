import path from 'path';
import axios from 'axios';
import fs from 'fs-extra';
import jimp from 'jimp';

export default {
  name: "زواج",
  version: "1.0.1",
  role: "member",
  author: "Md Rajib",
  description: "يقوم بإقتران عشوائي بين المستخدمين في المجموعة مع نسبة توافق.",
  cooldowns: 5,

  async onLoad() {
    const dirMaterial = `${process.cwd()}/cache/`;
    const imagePath = path.resolve(dirMaterial, 'pairing.png');

    if (!fs.existsSync(dirMaterial)) {
      fs.mkdirSync(dirMaterial, { recursive: true });
    }

    if (!fs.existsSync(imagePath)) {
      try {
        // استخدام axios لتنزيل الصورة وحفظها في المسار المحدد
        const response = await axios({
          url: "https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png",
          responseType: 'arraybuffer'
        });
        fs.writeFileSync(imagePath, response.data);
        console.log("Image downloaded successfully.");
      } catch (error) {
        console.error("Failed to download image:", error);
      }
    } else {
      console.log("Image already exists.");
    }
  },

  async execute({ api, event, Users, Threads, Economy }) {
    const { threadID, messageID, senderID } = event;
    const userMoney = (await Economy.getBalance(event.senderID)).data;

      const cost = 100;
      if (userMoney < cost) {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
  
        return api.sendMessage(`⚠️ | تحتاج أولا أن تعطي المهر اللذي يقدر ب ${cost} دولار جرب هدية ربما يكون يوم حظك 🙂`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);

    const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const matchPercentage = percentages[Math.floor(Math.random() * percentages.length)];

    const senderInfo = await api.getUserInfo(senderID);
    const senderName = senderInfo[senderID].name;

    const threadInfo = await api.getThreadInfo(threadID);
    const randomID = threadInfo.participantIDs[Math.floor(Math.random() * threadInfo.participantIDs.length)];

    const targetInfo = await api.getUserInfo(randomID);
    const targetName = targetInfo[randomID].name;

    const gender = targetInfo[randomID].gender === 2 ? "Male🧑" : targetInfo[randomID].gender === 1 ? "Female👩" : "Tran Duc Bo";

    const one = senderID, two = randomID;
    
    const imagePath = await makeImage({ one, two });
    
    const message = {
      body: `✅ | تـم الإقـتـران بـنـجـاح\n〘💖〙تـم إقـتـران ${senderName} مـع ${targetName} \n〘📎〙الإحـتـمـالات : ${matchPercentage}`,
      mentions: [{ id: senderID, tag: senderName }, { id: randomID, tag: targetName }],
      attachment: fs.createReadStream(imagePath)
    };
     api.setMessageReaction("💌", event.messageID, (err) => {}, true);
  
    api.sendMessage(message, threadID, () => fs.unlinkSync(imagePath), messageID);
  }
};

async function makeImage({ one, two }) {
  const pathImg = path.resolve(process.cwd(), 'cache', `pairing_${one}_${two}.png`);
  const avatarOne = path.resolve(process.cwd(), 'cache', `avt_${one}.png`);
  const avatarTwo = path.resolve(process.cwd(), 'cache', `avt_${two}.png`);
  const pairingImg = await jimp.read(path.resolve(process.cwd(), 'cache', 'pairing.png'));

  const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  const circleOne = await jimp.read(await circle(avatarOne));
  const circleTwo = await jimp.read(await circle(avatarTwo));
  
  pairingImg.composite(circleOne.resize(150, 150), 980, 200)
            .composite(circleTwo.resize(150, 150), 140, 200);

  const raw = await pairingImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(imagePath) {
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}
