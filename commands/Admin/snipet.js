import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "snipet",
  author: "Your Name",
  role: "admin",
  description: "توليد كودات على موقع سنيبت",
  execute: async ({ api, event, args }) => {
    // دمج الأكواد المدخلة من المستخدم
    const code = args.join(" ");
    if (!code) {
      return api.sendMessage('❎ | المرجو إدحال كود', event.threadID);
    }

    try {
      // طلب توليد الصورة باستخدام API
      const { data } = await axios.post('https://www.noobs-api.000.pe/dipto/snippet', {
        code: code,
        lang: 'javascript'
      });

      // جلب الصورة وحفظها في مجلد 'cache'
      const imagePath = path.join(process.cwd(), 'cache', 'snippet.jpg');
      const response = await axios({
        url: data.imageUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // حفظ الصورة وإرسالها
      writer.on('finish', () => {
        api.sendMessage({
          body: "Here's Your snippet",
          attachment: fs.createReadStream(imagePath)
        }, event.threadID);
      });

      writer.on('error', (err) => {
        console.error('Error while saving image:', err);
        api.sendMessage('An error occurred while processing your request.', event.threadID);
      });

    } catch (error) {
      console.error('Error:', error);
      api.sendMessage('An error occurred while processing your request.', event.threadID);
    }
  }
};
