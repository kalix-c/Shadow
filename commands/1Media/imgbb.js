import axios from 'axios';

class ImageUploader {
  name = "رابط3";
  author = "Kaguya Project";
  role = "member"; // يمكن تعديل الدور حسب الحاجة
  description = "يستخدم لرفع الصور من المرفقات";
  aliases = [];

  async execute({ api, event }) {
    try {
      let imageUrl;

      // تحديد مصدر الصورة
      if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (event.attachments.length > 0) {
        imageUrl = event.attachments[0].url;
      } else {
        return api.sendMessage('لم يتم الكشف عن مرفقات. يرجى الرد على صورة.', event.threadID, event.messageID);
      }

      // تحديد عنوان URL لرفع الصورة
      const uploadUrl = 'https://www.samirxpikachu.run.place/upload';
      const data = { file: imageUrl };

      // رفع الصورة إلى الخادم
      const response = await axios.post(uploadUrl, data, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;

      // التحقق من النتيجة
      if (result && result.image && result.image.url) {
        const cleanImageUrl = result.image.url.split('-')[0];
        api.sendMessage({ body: `${cleanImageUrl}.jpg` }, event.threadID);
      } else {
        api.sendMessage("فشل في رفع الصورة إلى الخادم.", event.threadID);
      }
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage(`خطأ: ${error.message}`, event.threadID);
    }
  }
}

export default new ImageUploader();
