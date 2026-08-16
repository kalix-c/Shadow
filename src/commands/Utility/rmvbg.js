import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import tinyurl from 'tinyurl'; // Assuming tinyurl package is installed

export default {
  name: "إزالة_الخلفية",
  author: "ArYAN",
  role: "member",
  description: "إزالة الخلفية من صورة بناءً على URL أو رد على صورة.",

  async execute({ api, event, args }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
    function isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    }

    let imageUrl;

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return api.sendMessage({ body: `⚠️ | يرجى الرد على صورة صحيحة.` }, event.threadID, event.messageID);
      }
    } else if (args[0] && isValidUrl(args[0]) && args[0].match(/\.(png|jpg|jpeg)$/)) {
      imageUrl = args[0];
    } else {
      return api.sendMessage({ body: `⚠️ | يرجى تقديم عنوان URL صورة صحيح أو الرد على صورة.` }, event.threadID, event.messageID);
    }

    try {
      const startTime = new Date().getTime();
      const shortenedUrl = await tinyurl.shorten(imageUrl);

      // Use the new API URL for background removal
      const apiUrl = `https://samirxpikachuio.onrender.com/rbg?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      if (response && response.data) {
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        const imageStream = response.data;

        const filePath = path.join(process.cwd(), 'cache', `${Date.now()}_removed_bg.png`);
        const writer = fs.createWriteStream(filePath);
        imageStream.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
          api.sendMessage({
            body: `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم إزالة الخلفية بنجاح.\n\n━━━━━━━━━━━━━\n` +
                  `⚙️ | URL: ${shortenedUrl}\n` +
                  `⏰ | الوقت المستغرق: ${timeTaken.toFixed(2)} ثواني\n`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));
        });

        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          api.sendMessage({ body: `🚧 | حدث خطأ أثناء معالجة الصورة.` }, event.threadID, event.messageID);
        });
      } else {
        throw new Error(`فشل في جلب الصورة أو استجابة فارغة.`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      api.sendMessage({ body: `🚧 | حدث خطأ أثناء معالجة الصورة: ${error.message}` }, event.threadID, event.messageID);
    }
  }
}
