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
    const img = await jimp.read('https://i.imgur.com/TGq05CR.jpeg');
    
    img.resize(1080, 1320)
       .composite(avOne.resize(170, 170), 200, 320)
       .composite(avTwo.resize(170, 170), 610, 70);
    
    await img.writeAsync(imagePath);
    return imagePath;
};

export default {
    name: "ضرب",
    author: "Kaguya Project",
    role: "member",
    description: "Generates an image based on user mentions or replies.",
    execute: async function ({ api, event, args }) {
        // Determine user ID to interact with
        const repliedUserId = event?.messageReply?.senderID;
        const mentionedUserIds = Object.keys(event.mentions);
        const targetUserId = mentionedUserIds.length > 0 ? mentionedUserIds[0] : (repliedUserId || event.senderID);

        if (!targetUserId) {
            return api.sendMessage("⚠️ | اعمل منشن او رد على رسالة", event.threadID, event.messageID);
        }
        
        const userOneId = event.senderID;
        const userTwoId = targetUserId;
        
        try {
            const imagePath = await generateImage(userOneId, userTwoId);
            
            api.sendMessage({
                body: "😹 | تستحق هذا ايها الحقير ",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
        }
    }
};
