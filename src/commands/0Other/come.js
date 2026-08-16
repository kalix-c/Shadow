import fs from 'fs';
import path from 'path';
import jimp from 'jimp';

const generateImage = async (userOneId, userTwoId) => {
    const avOneUrl = `https://graph.facebook.com/${userOneId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avTwoUrl = `https://graph.facebook.com/${userTwoId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const avOne = await jimp.read(avOneUrl);
    avOne.circle();

    const avTwo = await jimp.read(avTwoUrl);
    avTwo.circle();

    const imagePath = path.join(process.cwd(), 'cache', 'ball.png');
    const img = await jimp.read('https://imgur.com/vcG4det.jpg');

    img.resize(700, 440)
       .composite(avOne.resize(50, 50), 287, 97)   // Updated coordinates and size for the first user
       .composite(avTwo.resize(40, 40), 50, 137);  // Updated coordinates and size for the second user

    await img.writeAsync(imagePath);
    return imagePath;
};

export default {
    name: "تعالي",
    author: "Shadow Garden Project",
    role: "member",
    description: "Generates an image based on user mentions or replies.",
    execute: async function ({ api, event, args }) {
        // Determine user ID to interact with
        const repliedUserId = event?.messageReply?.senderID;
        const mentionedUserIds = Object.keys(event.mentions);
        const targetUserId = mentionedUserIds.length > 0 ? mentionedUserIds[0] : (repliedUserId || event.senderID);

        if (!targetUserId) {
            return api.sendMessage("⚠️ | اعمل منشن او رد على رسالة فتاة 😉", event.threadID, event.messageID);
        }

        const userOneId = event.senderID;
        const userTwoId = targetUserId;

        try {
            const imagePath = await generateImage(userOneId, userTwoId);
          
api.setMessageReaction("💖", event.messageID, (err) => {}, true);
  
            api.sendMessage({
                body: "💖 𝔠𝔬𝔪𝔢 𝔥𝔢𝔯𝔢 𝔪𝔶 𝔩𝔬𝔳𝔢 💖",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
        }
    }
};
