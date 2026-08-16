import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "تخيلي2",
  author: "مشروع كاغويا",
  role: "member",
  description: "توليد صورة بناءً على النص المدخل.",

  execute: async function ({ api, event }) {
    const args = event.body.split(" ");
    let prompt = args.join(" ");

    if (!prompt || prompt.trim().length === 0) {
      api.sendMessage("⚠️ | يرجى إدخال نص لتحويله إلى صورة.", event.threadID, event.messageID);
      return;
    }

    try {
      // ترجمة النص من العربية إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      prompt = translationResponse?.data?.[0]?.[0]?.[0];

      const apiUrl = `https://www.samirxpikachu.run.place/sd3-medium?prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (!response.data) {
        api.sendMessage("فشل في استرجاع الصورة.", event.threadID, event.messageID);
        return;
      }

      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);

      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        const messageBody = '࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ | تـم تــولــيــد الــصــورة \n࿇ ══━━━━✥◈✥━━━━══ ࿇';

        api.sendMessage({
          body: messageBody,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      fileStream.on('error', (error) => {
        api.sendMessage("حدث خطأ أثناء تحميل الصورة. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
        console.error("خطأ في تنزيل الصورة:", error);
      });
    } catch (error) {
      api.sendMessage("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
      console.error("خطأ أثناء معالجة الطلب:", error);
    }
  }
};
