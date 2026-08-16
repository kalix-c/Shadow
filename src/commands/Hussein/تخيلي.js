import fs from 'fs';
import path from 'path';
import axios from 'axios';
import jimp from 'jimp';

// Function to fetch and save user avatar
const getAvatar = async (userId, avatarPath) => {
    const avatarUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const { data } = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(avatarPath, Buffer.from(data, 'binary'));
};

// Function to generate composite image
const generateImage = async (userOneId, userTwoId) => {
    const avatarDirOne = path.join(process.cwd(), 'cache', 'avatarOne.png');
    const avatarDirTwo = path.join(process.cwd(), 'cache', 'avatarTwo.png');
    const imagePath = path.join(process.cwd(), 'cache', 'output.png');

    await getAvatar(userOneId, avatarDirOne);
    await getAvatar(userTwoId, avatarDirTwo);

    const batgiamImg = await jimp.read('https://i.imgur.com/dsrmtlg.jpg');
    const circleOne = await jimp.read(await createCircleImage(avatarDirOne));
    const circleTwo = await jimp.read(await createCircleImage(avatarDirTwo));

    batgiamImg
        .composite(circleOne.resize(150, 150), 80, 190)
        .composite(circleTwo.resize(150, 150), 260, 80);
    
    await batgiamImg.writeAsync(imagePath);

    fs.unlinkSync(avatarDirOne);
    fs.unlinkSync(avatarDirTwo);

    return imagePath;
};

// Function to create a circular image
const createCircleImage = async (imagePath) => {
    const imageJimp = await jimp.read(imagePath);
    imageJimp.circle();
    return await imageJimp.getBufferAsync('image/png');
};

export default {
    name: "صفع",
    author: "Kaguya Project",
    role: "member",
    description: "Generates an image based on user mentions or replies.",
    execute: async function ({ api, event, args }) {
        const mentions = Object.keys(event.mentions);
        const repliedUserId = event?.messageReply?.senderID;
        const targetUserId = mentions.length > 0 ? mentions[0] : (repliedUserId || event.senderID);

        if (!targetUserId) {
            return api.sendMessage("⚠️ | الرجاء عمل منشن أو الرد على رسالة.", event.threadID, event.messageID);
        }

        const userOneId = event.senderID;
        const userTwoId = targetUserId;

        try {
            const imagePath = await generateImage(userOneId, userTwoId);
            api.sendMessage({
                body: "",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
        }
    }
};
