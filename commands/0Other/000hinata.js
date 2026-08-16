import axios from "axios";
import fs from "fs";
import path from "path";

const animeImageLinks = [
  
    "https://i.imgur.com/g40EBQp.jpg",
    "https://i.imgur.com/g40EBQp.jpg",
"https://i.imgur.com/vCSkkcr.jpg",
"https://i.imgur.com/OdI2iLZ.jpg",
"https://i.imgur.com/GgJ9zpO.jpg",
"https://i.imgur.com/TYssa7f.jpg",
"https://i.imgur.com/DxwzWCL.jpg",
"https://i.imgur.com/6hVN9z1.jpg",
"https://i.imgur.com/aPobU0g.jpg",
"https://i.imgur.com/Dm2CFjB.jpg",
"https://i.imgur.com/izcfZzm.jpg",
"https://i.imgur.com/EvFzFH1.jpg",
"https://i.imgur.com/bVwovnX.jpg",
"https://i.imgur.com/Z3gbeqz.jpg",
"https://i.imgur.com/bVt68o5.jpg",
"https://i.imgur.com/ntRfjtv.jpg",
"https://i.imgur.com/xedGyYX.jpg",
"https://i.imgur.com/HQxmqkk.jpg",
"https://i.imgur.com/koAtr5L.jpg",
"https://i.imgur.com/RyRZGzH.jpg",
"https://i.imgur.com/5Srqb8I.jpg",
"https://i.imgur.com/9ub6Mbi.jpg",
"https://i.imgur.com/nNzKTi9.jpg",
"https://i.imgur.com/vXuSDZa.jpg",
"https://i.imgur.com/FbnlpIw.jpg",
"https://i.imgur.com/qZ8SWQT.jpg",
"https://i.imgur.com/mMkzTqf.jpg",
"https://i.imgur.com/ztnZPsy.jpg",
"https://i.imgur.com/g6eR1eV.jpg",
"https://i.imgur.com/rxTGO0k.jpg",
"https://i.imgur.com/WsH6fxx.jpg",
"https://i.imgur.com/JcUhPr8.jpg",
"https://i.imgur.com/vhOIvHj.jpg",
"https://i.imgur.com/xeiKJN2.jpg",
"https://i.imgur.com/bCiSD8O.jpg",
"https://i.imgur.com/P7WfzJl.jpg",
"https://i.imgur.com/InsGTko.jpg",
"https://i.imgur.com/1hgoAzW.jpg",
"https://i.imgur.com/0lG0JeG.jpg",
"https://i.imgur.com/uTN4ANx.jpg",
"https://i.imgur.com/YmnTKMX.jpg",
"https://i.imgur.com/fA9OjYw.jpg",
];
export default {
  name: "هيناتا",
  author: "Kaguya Project",
  role: "member",
  description: "يقوم بعرض صور عشوائية لشخصية الأنمي هيناتا مقابل 100 دولار",
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
      api.setMessageReaction("💞", event.messageID, () => {}, true);
      const message = {
        body: `✿━━━━━━━━━━━━━━✿\nصور هيناتا 💮 \n عدد الصور: ${animeImageLinks.length}\nتم الخصم منك 100 دولار\n✿━━━━━━━━━━━━━━✿`,
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
