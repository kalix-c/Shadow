import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "تيك",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "البحث عن مقاطع فيديو TikTok وتنزيلها",
  role: "member",
  aliases: ["tiktok"],

  async execute({ api, event, args }) {
    api.setMessageReaction("🕐", event.messageID, () => {}, true);

    try {
      const query = args.join(" ");
      if (!query) return api.sendMessage("⚠️ | يرجى إدخال استعلام البحث.", event.threadID, event.messageID);

      const apiUrl = `https://c-v1.onrender.com/tiksearch?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      if (response.data.code === 0 && response.data.data.videos.length > 0) {
        const videoData = response.data.data.videos[0];
        const videoUrl = videoData.play;
        const title = videoData.title;
        const views = videoData.play_count; // عدد التشغيلات
        const downloads = videoData.download_count; // عدد التحميلات
        const shares = videoData.share_count; // عدد المشاركات

        const videoFileName = `${videoData.video_id}.mp4`;
        const tempVideoPath = path.join(process.cwd(), 'cache', videoFileName);

        // تحميل الفيديو
        const writer = fs.createWriteStream(tempVideoPath);
        const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });

        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
          api.sendMessage({
            body: `📹 | العنوان: ${title}\n👁️ | عدد التشغيلات: ${views}\n⬇️ | عدد التحميلات: ${downloads}\n🔄 | عدد المشاركات: ${shares}`,
            attachment: fs.createReadStream(tempVideoPath)
          }, event.threadID, () => {
            fs.unlinkSync(tempVideoPath); // تنظيف الملف بعد الإرسال
          }, event.messageID);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        });

        writer.on('error', (err) => {
          console.error("Error while downloading video:", err);
          api.sendMessage("🚧 | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
          api.setMessageReaction("❌", event.messageID, () => {}, true);
        });

      } else {
        api.sendMessage("⚠️ | لم يتم العثور على مقاطع فيديو TikTok للاستعلام المحدد.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | عذرًا، حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
    }
  }
};
