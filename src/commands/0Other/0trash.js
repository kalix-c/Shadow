import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default {
  name: "قمامة",
  author: "KAGUYA PROJECT",
  role: "member",
  description: "تحويل صورة الملف الشخصي إلى صورة ضبابية.",
  
  execute: async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    let id;

api.setMessageReaction("♻️", event.messageID, (err) => {}, true);
  

    // التحقق من وجود إشارة إلى مستخدم في الرسالة
    if (args.join().indexOf('@') !== -1) {
      id = Object.keys(event.mentions)[0];
    } else {
      id = args[0] || senderID;
    }

    // إذا كانت الرسالة رد على رسالة أخرى، استخدم معرف المرسل الأصلي
    if (event.type === "message_reply") {
      id = event.messageReply.senderID;
    }

    try {
      // استخدام رابط API الجديد
      const apiUrl = `https://deku-rest-api.gleeze.com/canvas/trash?uid=${id}`;
      
      // استدعاء API للحصول على الصورة الضبابية
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      const tempFilePath = path.join(process.cwd(), 'temp.png');
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        const attachment = fs.createReadStream(tempFilePath);
        await api.sendMessage({ body: "", attachment: attachment }, threadID, messageID);

        // حذف الملف المؤقت بعد إرساله
        fs.unlinkSync(tempFilePath);
      });

      writer.on('error', (err) => {
        console.error(err);
        api.sendMessage("حدث خطأ أثناء معالجة الصورة.", threadID, messageID);
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء استدعاء API.", threadID, messageID);
    }
  }
};
