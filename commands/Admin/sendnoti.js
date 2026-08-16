import fs from 'fs';
import path from 'path';
import axios from 'axios';

const evalCommand = {
  name: "إشعار",
  author: "Kaguya Project",
  cooldowns: 5,
  description: "إرسال إشعار إلى جميع المجموعات!",
  role: "admin",
  aliases: ["ارسال"],
  execute: async ({ api, event, args, Threads }) => {
    const noidung = args.join(" ");
    if (!noidung) return api.sendMessage(" ⚠️ |الرجاء إدخال محتوى الرسالة الذي تريد إرساله إلى جميع المجموعات!", event.threadID, event.messageID);

    const imageUrl = 'https://i.imgur.com/qtmNcYW.jpeg'; // رابط الصورة الذي تريد استخدامه
    const cacheDir = path.join(process.cwd(), 'cache');
    const imagePath = path.join(cacheDir, 'notification_image.jpg');

    // إنشاء مجلد cache إذا لم يكن موجودًا
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    try {
      // تحميل الصورة وتخزينها في cache
      const response = await axios({
        url: imageUrl,
        responseType: 'arraybuffer',
      });

      fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

      let count = 0;
      let fail = 0;

      const { data: allThreads } = await Threads.getAll();

      for (const value of allThreads) {
        if (!isNaN(parseInt(value.threadID)) && value.threadID !== event.threadID) {
          const message = `【 إشـٰـُ͢ـُٰـعـ๋͜‏ـۂاࢪ مـٰن اݪمـٰطُوُࢪ 】📫\n┍━━━━━»•» ⌖ «•«━━━━━┑\n\t\t\t${noidung}\n┕━━━━━»•» ⌖ «•«━━━━━┙`;

          const { error } = await sendMessage(api, message, imagePath, value.threadID);
          if (error) {
            fail++;
          } else {
            count++;
          }
        }
      }

      // حذف الصورة بعد الإرسال
      fs.unlinkSync(imagePath);

      return api.sendMessage(`[ إشعار ]\nتم إرسال الإشعار إلى : ${count} مجموعة بنحاح ✅\nفشل إرسال الإشعار إلى : ${fail}`, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage(`❌ | خطأ : ${err.message}`, event.threadID, event.messageID);
    }
  },
};

async function sendMessage(api, message, imagePath, threadID) {
  return new Promise((resolve) => {
    api.sendMessage({
      body: message,
      attachment: fs.createReadStream(imagePath),
    }, threadID, (error) => resolve({ error }));
  });
}

export default evalCommand;
