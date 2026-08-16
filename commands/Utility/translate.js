import axios from 'axios';
import fs from 'fs-extra';
import jimp from 'jimp';

async () => {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const dirMaterial = process.cwd() + `/cache/`;
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
}

async function generateWantedImage(uid) {
    const pathImg = process.cwd() + "/cache/wanted.png";
    const pathAva = process.cwd() + "/cache/avt.png";

    const Avatar = (
        await axios.get(
            `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: "arraybuffer" }
        )
    ).data;

    fs.writeFileSync(pathAva, Buffer.from(Avatar, "utf-8"));

    const getWanted = (
        await axios.get(`https://i.imgur.com/2FarLuj.jpg`, {
            responseType: "arraybuffer",
        })
    ).data;

    fs.writeFileSync(pathImg, Buffer.from(getWanted, "utf-8"));

    const baseImage = await jimp.read(pathImg);
    const baseAva = await jimp.read(pathAva);

    baseImage.resize(600, 800);
    baseImage.composite(baseAva.resize(345, 300), 120, 200);

    await baseImage.writeAsync(pathImg);

    fs.removeSync(pathAva);

    return pathImg;
}

const exampleCommand = {
    name: "مطلوب",
    author: "حسين يعقوبي",
    role: "member",
    description: "صورتك على ملصق المطلوبين",
    execute: async ({ api, event, args }) => {
        const uid = args.length > 0 ? Object.keys(event.mentions)[0] : event.senderID;
        const imagePath = await generateWantedImage(uid);
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID);
    },
    onReply: async ({ api, event, reply }) => {
        const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);
        const imagePath = await generateWantedImage(uid);
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID);
    }
};

export default exampleCommand;