import fs from 'fs';
import path from 'path';
import axios from 'axios';
import jimp from 'jimp';

const getAvatar = async (userId, avatarPath) => {
    const avatarUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const { data } = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(avatarPath, Buffer.from(data, 'binary'));
};

const generateImage = async (userOneId, userTwoId) => {
    const avatarDirOne = path.join(process.cwd(), 'cache', 'avatarOne.png');
    const avatarDirTwo = path.join(process.cwd(), 'cache', 'avatarTwo.png');
    const imagePath = path.join(process.cwd(), 'cache', 'shadow_slap.png');

    if (!fs.existsSync(path.join(process.cwd(), 'cache'))) fs.mkdirSync(path.join(process.cwd(), 'cache'));

    await getAvatar(userOneId, avatarDirOne);
    await getAvatar(userTwoId, avatarDirTwo);

    const baseImg = await jimp.read('https://i.imgur.com/dsrmtlg.jpg'); // Batman slapping Robin template
    const circleOne = await jimp.read(await createCircleImage(avatarDirOne));
    const circleTwo = await jimp.read(await createCircleImage(avatarDirTwo));

    baseImg
        .composite(circleOne.resize(150, 150), 80, 190)
        .composite(circleTwo.resize(150, 150), 260, 80);
    
    await baseImg.writeAsync(imagePath);
    fs.unlinkSync(avatarDirOne);
    fs.unlinkSync(avatarDirTwo);
    return imagePath;
};

const createCircleImage = async (imagePath) => {
    const imageJimp = await jimp.read(imagePath);
    imageJimp.circle();
    return await imageJimp.getBufferAsync('image/png');
};

export default {
    name: "تأديب",
    author: "محمد الشاوني",
    role: "member",
    description: "تأديب أحد الأعضاء في حديقة الظل بصورة ساخرة.",
    aliases: ["صفع", "slap"],
    execute: async function ({ api, event }) {
        const mentions = Object.keys(event.mentions);
        const repliedUserId = event?.messageReply?.senderID;
        const targetUserId = mentions.length > 0 ? mentions[0] : repliedUserId;

        if (!targetUserId) {
            return api.sendMessage("⚠️ | يجب عليك الإشارة (منشن) للعضو الذي تريد تأديبه أو الرد على رسالته.", event.threadID, event.messageID);
        }

        try {
            const imagePath = await generateImage(event.senderID, targetUserId);
            api.sendMessage({
                body: "🌑 **أمر من سيد الظل: التزم بحدودك!** 🌑",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
        } catch (error) {
            api.sendMessage("🚧 | فشل تنفيذ العقوبة في الظلام.", event.threadID, event.messageID);
        }
    }
};
