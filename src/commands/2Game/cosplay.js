import axios from "axios";
import fs from "fs";
import path from "path";

const animeImageLinks = [
  "https://i.imgur.com/vqAeakJ.jpg",
  "https://i.imgur.com/06t7gFK.jpg",
  "https://i.imgur.com/ciQ3L9e.jpg",
  "https://i.imgur.com/qiBfUjj.jpg",
  "https://i.imgur.com/GOtV4tu.jpg",
  "https://i.imgur.com/QIndWOA.jpg",
  "https://i.imgur.com/SzXQEv2.jpg",
  "https://i.imgur.com/NIYNKOp.jpg",
  "https://i.imgur.com/ZRIuu9S.jpg",
  "https://i.imgur.com/4J7frsw.jpg",
  "https://i.imgur.com/31ap7SM.jpg",
  "https://i.imgur.com/NKHnVD8.jpg",
  "https://i.imgur.com/nstCRMi.jpg",
  "https://i.imgur.com/IHUKZLz.jpg",
  "https://i.imgur.com/q40Yl6C.jpg",
  "https://i.imgur.com/iWk64pg.jpg",
  "https://i.imgur.com/GsCfKQh.jpg",
  "https://i.imgur.com/XGnZM7k.jpg",
  "https://i.imgur.com/8jI6mfV.jpg",
  "https://i.imgur.com/YqMy5FK.jpg",
  "https://i.imgur.com/wYQgCAO.jpg",
  "https://i.imgur.com/4Sdipb6.jpg",
  "https://i.imgur.com/z3AlT8J.jpg",
  "https://i.imgur.com/nlGSD9A.jpg",
  "https://i.imgur.com/dNKpLqh.jpg",
  "https://i.imgur.com/IJ4rtcy.jpg",
  "https://i.imgur.com/hqotpkx.jpg",
  "https://i.imgur.com/HnhvEgu.jpg",
  "https://i.imgur.com/5CEQoco.jpg",
  "https://i.imgur.com/74G1HDw.jpg", 
];

export default {
  name: "أزياء",
  author: "Shadow Garden Project",
  role: "member",
  aliases:["كوسبلاي"],
  description: "يقوم بعرض صورة عشوائية لشخصية أنمي",
  async execute({ api, event }) {
    try {
      const randomIndex = Math.floor(Math.random() * animeImageLinks.length);
      const imageUrl = animeImageLinks[randomIndex];

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const tempImagePath = path.join(process.cwd(), `./cache/anime_image_${randomIndex + 1}.jpg`);

      fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));

      api.setMessageReaction("💐", event.messageID, () => {}, true);

      const message = {
        body: "◆❯━━━━━▣✦▣━━━━━❮◆\n🌺 | تفضل إليك صورة الأزياء \n◆❯━━━━━▣✦▣━━━━━❮◆",
        attachment: fs.createReadStream(tempImagePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(tempImagePath); // حذف الملف المؤقت للصورة بعد إرسال الرسالة
      });
    } catch (error) {
      console.error("حدث خطأ: ", error);
      api.sendMessage("❌ | حدث خطأ أثناء جلب صورة أنمي.", event.threadID);
    }
  },
};
