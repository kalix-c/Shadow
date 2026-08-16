import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "زوجة",
  author: "YourName",
  role: "member",
  description: "أحضر صورة أنمي عشوائية.",

  async execute({ api, event }) {
    try {
      const res = await axios.get(`https://smfahim.onrender.com/waifu`);
      const imgUrl = res.data.url;

      if (imgUrl) {
        const imagePath = path.join(process.cwd(), 'cache', `${Date.now()}.png`);
        const writer = fs.createWriteStream(imagePath);
        const response = await axios({
          url: imgUrl,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("😘", event.messageID, (err) => {}, true);
  
          api.sendMessage({
            body: `࿇ ══━━━✥◈✥━━━══ ࿇\n\t\t\t\t💜☟  ω𝒶ⓘғυ  ☟💜\n࿇ ══━━━✥◈✥━━━══ ࿇`,
            attachment: fs.createReadStream(imagePath)
          }, event.threadID, () => fs.unlinkSync(imagePath));
        });

        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
        });
      } else {
        api.sendMessage('❓ | لم يتم العثور على صورة.', event.threadID, event.messageID);
      }
    } catch (e) {
      console.error('Error fetching image:', e);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
    }
  }
};
