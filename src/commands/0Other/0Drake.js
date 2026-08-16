import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function drakeAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;
    const query = args.join(" ").split("|");

    if (query.length !== 2) {
      return api.sendMessage("⚠️ | يرجى إدخال جملتين مفصولتين بعلامة (|).\nمثال: درايك amogus | amongus", threadID, messageID);
    }

    const [text1, text2] = query;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_NETHisPOGI.png`);

    api.setMessageReaction("📱", event.messageID, () => {}, true);
    const response = await axios.get(`https://api.popcat.xyz/drake?text1=${encodeURIComponent(text1.trim())}&text2=${encodeURIComponent(text2.trim())}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));
    api.setMessageReaction("👌", event.messageID, () => {}, true);

    setTimeout(function () {
      api.sendMessage({
        body: "DRAKE MEME",
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        setTimeout(() => {
          fs.unlinkSync(imagePath);
        }, 5 * 1000);
      }, messageID);
    }, 5 * 1000);
  } catch (error) {
    console.error(error);
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
}

export default {
  name: "درايك",
  author: "kaguya project",
  description: "يرسل ميم درايك مع جملتين مفصولتين بعلامة |.\nمثال: درايك amogus | amongus",
  execute: drakeAlert
};
