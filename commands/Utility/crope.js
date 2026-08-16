import axios from "axios";
import fs from "fs";
import path from "path";
import Jimp from "jimp";

const currentDir = process.cwd();

export default {
  name: "اقتصاص",
  author: "حسين يعقوبي",
  role: "member",
  description: "يقوم بتقسيم الصورة المستلمة إلى أربعة أجزاء.",
  cooldown: 60, // cooldown بالثواني

  async execute({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
      api.sendMessage("❕ | المرجو الرد على صورة مع هذا الأمر.", threadID, messageID);
      return;
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      api.sendMessage("❕ | يجب أن تكون الصورة المراد تقسيمها.", threadID, messageID);
      return;
    }

    try {
      const imageUrl = attachment.url;
      const croppedImages = await cropImageIntoFourParts(imageUrl);

      await api.sendMessage({
        body: "╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم تقسيم الصورة إلى أربعة أجزاء\n╼╾─────⊹⊱⊰⊹─────╼╾",
        attachment: croppedImages.map(file => fs.createReadStream(file))
      }, threadID, messageID);

      croppedImages.forEach(file => fs.unlinkSync(file));
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الصورة.", threadID, messageID);
    }
  }
};

async function cropImageIntoFourParts(imageUrl) {
  try {
    const image = await Jimp.read(imageUrl);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const quadrants = [
      { x: 0, y: 0, w: width / 2, h: height / 2, name: 'quadrant_1' },
      { x: width / 2, y: 0, w: width / 2, h: height / 2, name: 'quadrant_2' },
      { x: 0, y: height / 2, w: width / 2, h: height / 2, name: 'quadrant_3' },
      { x: width / 2, y: height / 2, w: width / 2, h: height / 2, name: 'quadrant_4' }
    ];

    const croppedImages = await Promise.all(quadrants.map(async (quad) => {
      const outputPath = path.join(currentDir, 'cache', `${quad.name}.png`);
      await image.clone()
        .crop(quad.x, quad.y, quad.w, quad.h)
        .writeAsync(outputPath);
      return outputPath;
    }));

    return croppedImages;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}
