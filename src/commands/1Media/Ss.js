import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "لقطة",
  author: "محمد الشاوني",
  role: "member",
  description: "التقاط لقطة شاشة من موقع ويب باستخدام URL محدد.",
  execute: async ({ api, event, args }) => {
    const url = args[0];

    if (!url) {
      return api.sendMessage("⚠️ | من فضلك قدم رابطًا لالتقاط لقطة شاشة.", event.threadID, event.messageID);
    }

    api.sendMessage("📸 | جارٍ التقاط لقطة الشاشة، يرجى الانتظار...", event.threadID, event.messageID);

    try {
      const response = await axios.get(`https://nash-rest-api-production.up.railway.app/screenshot?url=${encodeURIComponent(url)}`);
      const data = response.data;

      if (!data.screenshotURL) {
        throw new Error("فشل في استرجاع رابط لقطة الشاشة.");
      }

      const imageUrl = data.screenshotURL;
      const imagePath = path.join(process.cwd(), "cache", "ss.png");

      const imageResponse = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream"
      });

      imageResponse.data.pipe(fs.createWriteStream(imagePath)).on("finish", () => {
        api.sendMessage({
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          fs.unlinkSync(imagePath);
        });
      });
    } catch (error) {
      api.sendMessage(`⚠️ حدث خطأ: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
