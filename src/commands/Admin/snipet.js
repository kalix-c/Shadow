import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

export default {
  name: "كود_مصوّر",
  aliases: ["صورة_كود"],
  author: "محمد الشاوني",
  role: "admin",
  description: "تحويل كود JavaScript إلى صورة منسقة.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const code = args.join(" ");
    if (!code) {
      return api.sendMessage("أرسل الكود بعد الأمر، مثل: .كود_مصوّر const x = 1", threadID, messageID);
    }

    try {
      const { data } = await axios.post("https://www.noobs-api.000.pe/dipto/snippet", {
        code,
        lang: "javascript"
      }, { timeout: 15000 });

      if (!data?.imageUrl) throw new Error("لم يُرجع الخادم رابط الصورة.");
      const cacheDir = path.join(process.cwd(), "cache");
      fs.mkdirSync(cacheDir, { recursive: true });
      const imagePath = path.join(cacheDir, `snippet-${Date.now()}.jpg`);
      const response = await axios.get(data.imageUrl, {
        responseType: "stream",
        timeout: 20000
      });
      await pipeline(response.data, fs.createWriteStream(imagePath));

      return api.sendMessage({
        body: "تم تجهيز صورة الكود داخل الظلال.",
        attachment: fs.createReadStream(imagePath)
      }, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`تعذر إنشاء الصورة: ${error.message}`, threadID, messageID);
    }
  }
};
