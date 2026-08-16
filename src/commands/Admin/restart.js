import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function getImageAndFact(api, threadID) {
  try {
    const [imageResponse, factResponse] = await Promise.all([
      axios.get('https://api.thecatapi.com/v1/images/search'),
      axios.get('https://catfact.ninja/facts')
    ]);

    if (imageResponse.status !== 200 || !imageResponse.data || !imageResponse.data[0] || !imageResponse.data[0].url) {
      throw new Error('Invalid or missing response from CatAPI');
    }

    if (factResponse.status !== 200 || !factResponse.data || !factResponse.data.data || factResponse.data.data.length === 0) {
      throw new Error('Invalid or missing cat facts');
    }

    const imageURL = imageResponse.data[0].url;
    const facts = factResponse.data.data;

    const randomFactIndex = Math.floor(Math.random() * facts.length);
    const factText = facts[randomFactIndex].fact;

    // ترجمة الحقيقة إلى العربية
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(factText)}`);
    const translatedFact = translationResponse.data[0][0][0];

    // تحديد مسار الصورة المحفوظة
    const imagePath = path.join(process.cwd(), 'cache', 'cat_image.jpg');

    // تحميل الصورة وحفظها محلياً
    const imageStream = await axios.get(imageURL, { responseType: 'stream' });
    const imageWriter = fs.createWriteStream(imagePath);
    imageStream.data.pipe(imageWriter);

    await new Promise((resolve, reject) => {
      imageWriter.on('finish', resolve);
      imageWriter.on('error', reject);
    });

    const messageID = await api.sendMessage({
      body: translatedFact,
      attachment: fs.createReadStream(imagePath)
    }, threadID);

    console.log(`Sent cat image with message ID ${messageID}`);

    // حذف الصورة بعد إرسالها
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error(`Failed to send cat image: ${error.message}`);
    api.sendMessage(' ❌ |عذرًا، حدث خطأ ما أثناء محاولة إرسال صورة قطة. الرجاء معاودة المحاولة في وقت لاحق.', threadID);
  }
}

export default {
  name: 'قطط',
  author: 'حسين يعقوبي',
  role: 'member',
  description: 'يرسل صورة قطة عشوائية مع حقيقة عن القطط.',
  async execute({ api, event }) {
    await getImageAndFact(api, event.threadID);
  }
};