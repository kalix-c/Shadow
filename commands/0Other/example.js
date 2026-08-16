import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { shorten } from 'tinyurl';

export default {
  name: "نيجي",
  author: "kaguya project",
  role: "member",
  aliases: ["niji"],
  description: "توليد صورة أنمي بناء على النص المعطى.",
  async execute({ message, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    const input = args.join(' ');
    const [prompt, resolution = '1:1'] = input.split('|').map(s => s.trim());

    if (!prompt) {
      return api.sendMessage("❌ | الرجاء إدخال النص.", event.threadID, event.messageID);
    }

    try {
      // ترجمة النص إلى الإنجليزية
      const translatedPrompt = await translateToEnglish(prompt);

      // رابط الأساسي للخدمة مع المعاملات
      const apiUrl = `https://www.samirxpikachu.run.place/niji?prompt=${encodeURIComponent(translatedPrompt)}&resolution=${encodeURIComponent(resolution)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');

      // تحديد المسار لحفظ الصورة مؤقتاً
      const imagePath = path.join(process.cwd(), "cache", `${Date.now()}_generated_image.png`);
      await fs.outputFile(imagePath, imageData);

      // قراءة الصورة المولدة وإرسالها
      const stream = fs.createReadStream(imagePath);

      // تقصير رابط الصورة باستخدام tinyurl
      shorten(apiUrl, async function (shortUrl) {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        await api.sendMessage({
          body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n✅ |تــــم تـــولـــيــد الــصــورة بــنــجــاح\n📎 | رابط الصورة  ${shortUrl} \n◆❯━━━━━▣✦▣━━━━━━❮◆`,
          attachment: stream
        }, event.threadID, event.messageID);
      });
    } catch (error) {
      console.error('خطأ في إرسال الصورة:', error);
      api.sendMessage("❌ | حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    } finally {
      api.setMessageReaction("", event.messageID, (err) => {}, true);
      await fs.remove(imagePath); // حذف الصورة المؤقتة بعد الإرسال
    }
  }
};

async function translateToEnglish(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error("خطأ في ترجمة النص:", error);
    return text; // إرجاع النص كما هو في حالة وجود خطأ في الترجمة
  }
}
