import axios from "axios";
import fs from "fs";
import path from "path";

const animeImageLinks = [
  "https://i.imgur.com/QNtuuaM.jpg",
  "https://i.imgur.com/aXEKttE.jpg",
  "https://i.imgur.com/KXtDqmB.jpg",
  "https://i.imgur.com/6Ctqwug.jpg",
  "https://i.imgur.com/JMmNkZ8.jpg",
  "https://i.imgur.com/BJfb9o6.jpg",
  "https://i.imgur.com/ZRXkNVS.jpg",
  "https://i.imgur.com/wKzKPno.jpg",
  "https://i.imgur.com/CaJfPnb.jpg",
  "https://i.imgur.com/PotX8IC.jpg",
  "https://i.imgur.com/mkb7hml.jpg",
  "https://i.imgur.com/zHaEDHU.jpg",
  "https://i.imgur.com/ChSdLHT.jpg",
  "https://i.imgur.com/Zb3bpc6.jpg",
  "https://i.imgur.com/PzLKQm2.jpg",
  "https://i.imgur.com/qNgbjxB.jpg",
  "https://i.imgur.com/80hPcHs.jpg",
  "https://i.imgur.com/rWlweE8.jpg",
  "https://i.imgur.com/tu6gkkc.jpg",
  "https://i.imgur.com/OweI6iT.jpg",
  "https://i.imgur.com/nv7JbsS.jpg",
  "https://i.imgur.com/4Os0G9C.jpg",
  "https://i.imgur.com/VTtr2pQ.jpg",
  "https://i.imgur.com/YEYFCg8.jpg",
  "https://i.imgur.com/4jMH2ki.jpg",
  "https://i.imgur.com/BawYFx1.jpg",
  "https://i.imgur.com/FT9ajDD.jpg",
  "https://i.imgur.com/sbRlDOh.jpg",
];

export default {
  name: "نيزكو",
  author: "Shadow Garden Project",
  role: "member",
  description: "يقوم بعرض صور عشوائية لشخصية الأنمي نيزكو مقابل 100 دولار",
  async execute({ api, event, Economy }) {
    try {
      // التحقق مما إذا كان لديه الرصيد الكافي
      const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 100;
      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً.`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);

      // اختيار صورة عشوائية
      const randomIndex = Math.floor(Math.random() * animeImageLinks.length);
      const imageUrl = animeImageLinks[randomIndex];

      // جلب الصورة
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

      // حفظ الصورة مؤقتًا
      const tempImagePath = path.join(process.cwd(), `./temp/anime_image_${randomIndex + 1}.jpeg`);
      fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));

      // إرسال الصورة
      api.setMessageReaction("🌺", event.messageID, () => {}, true);
      const message = {
        body: `✿━━━━━━━━━━━━━━━✿\nصور نيزكو 🌺 \n عدد الصور: ${animeImageLinks.length}\nتم الخصم منك 100 دولار\n✿━━━━━━━━━━━━━━━✿`,
        attachment: fs.createReadStream(tempImagePath),
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
