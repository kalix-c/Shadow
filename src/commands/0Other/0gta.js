import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function execute({ api, event }) {
  try {
    api.setMessageReaction("🕐", event.messageID, null, true);
    const { type, messageReply } = event;
    const { attachments, threadID } = messageReply || {};

    if (type !== "message_reply" || !attachments || attachments.length === 0) {
      api.sendMessage("الرجاء الرد على صورة.", threadID);
      return;
    }

    const attachment = attachments[0];
    const { url, type: attachmentType } = attachment || {};

    if (attachmentType !== "photo") {
      api.sendMessage("الرجاء الرد على صورة.", threadID);
      return;
    }

    const apiUrl = `https://colo-rize.vercel.app/kshitiz?url=${encodeURIComponent(url)}`;
    const imageResponse = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const imagePath = path.join(cacheDir, "colorized_image.png");
    fs.writeFileSync(imagePath, imageResponse.data);

    api.setMessageReaction("✅", event.messageID, null, true);
    api.sendMessage({
      body: "✅ | تم تلوين الصورة بنجاح",
      attachment: fs.createReadStream(imagePath)
    }, threadID, event.messageID);
  } catch (error) {
    console.error("Error processing image:", error);
    api.setMessageReaction("❌", event.messageID, null, true);
    api.sendMessage("حدث خطأ أثناء معالجة الصورة.", event.threadID);
  }
}

export default {
  name: "تلوين",
  author: "محمد الشاوني",
  description: "يقوم بتلوين الصورة المرسلة بألوان مختلفة.",
  execute,
};