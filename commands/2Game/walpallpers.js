import axios from "axios";
import fs from "fs";
import path from "path";

const animeImageLinks = [];

export default {
  name: "خلفيات",
  author: "Kaguya Project",
  role: "member",
  description: "يقوم بعرض صورة عشوائية لخلفيات ذات جودة عالية",
  async execute({ api, event }) {
    try {
      // جلب صورة عشوائية من البحث
      const searchQueries = ["Luxury wallpapers", "Anime wallpapers", "High quality wallpapers"];
      const randomQueryIndex = Math.floor(Math.random() * searchQueries.length);
      const searchQuery = searchQueries[randomQueryIndex];
      const apiUrl = `https://pin-two.vercel.app/pin?search=${encodeURIComponent(searchQuery)}`;

      const response = await axios.get(apiUrl);
      const imageLinks = response.data.result;

      if (imageLinks.length > 0) {
        const randomImageIndex = Math.floor(Math.random() * imageLinks.length);
        const imageUrl = imageLinks[randomImageIndex];

        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imagePath = path.join(process.cwd(), 'cache', `wallpapers.jpg`);
        await fs.promises.writeFile(imagePath, imageResponse.data);

        const imageStream = fs.createReadStream(imagePath);

        api.setMessageReaction("🌟", event.messageID, () => {}, true);

        const message = {
          body: "࿇ ══━━━✥◈✥━━━══ ࿇\n👑 | تفضل إليك صورة الخلفية \n࿇ ══━━━✥◈✥━━━══ ࿇",
          attachment: imageStream,
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(imagePath); // حذف الملف المؤقت للصورة بعد إرسال الرسالة
        });
      } else {
        console.log("No images found for the given query.");
        api.sendMessage("❌ | لم يتم العثور على صور خلفيات.", event.threadID);
      }
    } catch (error) {
      console.error("حدث خطأ: ", error);
      api.sendMessage("❌ | حدث خطأ أثناء جلب صورة أنمي.", event.threadID);
    }
  },
};
