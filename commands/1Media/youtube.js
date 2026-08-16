import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من YouTube",
  role: "عضو",
  aliases: ["يوتيب", "فيديو", "مقطع"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم المقطع.", event.threadID);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن المقطع المطلوب "${videoName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(videoName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎥 | تم العثور على المقاطع الأربعة التالية :\n';
      const selectedResults = searchResults.slice(0, 4); // Get only the first 4 results
      const attachments = [];

      // الرموز التي تم طلبها للأرقام: ⓵, ⓶, ⓷, ⓸
      const numberSymbols = ['⓵', '⓶', '⓷', '⓸'];

      for (let i = 0; i < selectedResults.length; i++) {
        const video = selectedResults[i];
        const videoIndex = numberSymbols[i]; // استخدام الرموز

        msg += `\n${videoIndex}. ❀ العنوان: ${video.title}`;
        
        // تنزيل الصورة وإضافتها إلى المرفقات
        const imagePath = path.join(process.cwd(), 'cache', `video_thumb_${i + 1}.jpg`);
        const imageStream = await axios({
          url: video.thumbnail,
          responseType: 'stream',
        });

        const writer = fs.createWriteStream(imagePath);
        imageStream.data.pipe(writer);
        
        await new Promise((resolve) => {
          writer.on('finish', resolve);
        });

        attachments.push(fs.createReadStream(imagePath));
      }

      msg += '\n\n📥 | الرجاء الرد برقم المقطع الذي تود تنزيله.';

      api.unsendMessage(sentMessage.messageID);

      api.sendMessage({ body: msg, attachment: attachments }, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "يوتيوب",
          searchResults: selectedResults,
          unsend: true
        });

        // حذف الصور المؤقتة بعد إرسال الرسالة
        attachments.forEach((file) => fs.unlinkSync(file.path));
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) {
      return api.sendMessage("⚠️ | هذا ليس لك.", event.threadID);
    }

    const selectedIndex = parseInt(event.body, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= searchResults.length) {
      return api.sendMessage("❌ | الرد غير صالح. يرجى الرد برقم صحيح.", event.threadID);
    }

    const video = searchResults[selectedIndex];
    const videoUrl = video.videoUrl;

    try {
      const downloadUrl = `https://c-v1.onrender.com/downloader?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(downloadUrl);

      const videoFileUrl = downloadResponse.data.media.url;
      if (!videoFileUrl) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل المقطع.", event.threadID);
      }

      api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

      const fileName = `${event.senderID}.mp4`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const videoStream = axios.get(videoFileUrl, { responseType: 'stream' }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
          }

          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          const message = {
            body: `━━━━━━━◈✿◈━━━━━━━\n✅ | تـم تـحـمـيـل الـفـيـديو:\n❀ الـعـنـوان : ${video.title}\n━━━━━━━◈✿◈━━━━━━━`,
            attachment: fs.createReadStream(filePath)
          };

          api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
