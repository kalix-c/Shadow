import axios from 'axios';
import fs from 'fs-extra';
import path from 'path'; // استيراد مكتبة path

export default {
  name: "تحويل_تو_اوديو",
  author: "kaguya project",
  role: "member",
  description: "تحويل رسالة فيديو إلى ملف صوتي.",
  execute: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        api.sendMessage("الرجاء الرد على رسالة فيديو لتحويلها إلى ملف صوتي.", event.threadID, event.messageID);
        return;
      }

      const att = event.messageReply.attachments[0];
      if (att.type !== "video") {
        api.sendMessage(" ⚠️ | قم بإلرد على مقطع من أجل تحويله إلى صوت", event.threadID, event.messageID);
        return;
      }

      const { data } = await axios.get(att.url, { responseType: 'arraybuffer' });
      const filepath = path.join(process.cwd(), "temp", "audio34.mp3"); // استخدام path.join لبناء مسار الملف
      fs.writeFileSync(filepath, Buffer.from(data, 'utf-8')); // استخدام filepath بدلاً من filePath

      const audioReadStream = fs.createReadStream(filepath);
      const msg = { body: "", attachment: [audioReadStream] };
      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
      api.sendMessage('حدث خطأ أثناء تحويل الفيديو إلى صوت.', event.threadID, event.messageID);
    }
  },
};
