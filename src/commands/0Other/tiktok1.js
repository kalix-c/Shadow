import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function iphoneAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_NETHisPOGI.png`);

    if (!query) {
      return api.sendMessage(" ⚠️ | أدخل شيئا اولا\nمثال : آيفون أهلا يا صاح", threadID, messageID);
    }

    api.setMessageReaction("📱", event.messageID, () => {}, true);
    const response = await axios.get(`https://api.popcat.xyz/alert?text=${query}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));
    api.setMessageReaction("👌", event.messageID, () => {}, true);

    setTimeout(function() {
      api.sendMessage({
        body: "📱 IPHONE ALERT ⚠️",
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
  name: "آيفون",
  auther:"محمد الشاوني",
  description: "يرسل تنبيه iPhone بالرسالة المقدمة.",
  execute: iphoneAlert
};
