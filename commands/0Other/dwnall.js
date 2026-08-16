import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "فيسبوك",
  author: "Kaguya Project",
  role: "member",
  description: "تنزيل مقطع فيديو من Facebook.",
  execute: async function({ api, event, args }) {

    api.setMessageReaction("⬇️", event.messageID, null, true);

    try {
      const link = args.join(" ");
      if (!link) {
        api.sendMessage(` ⚠️ | يرجى إدخال رابط أولاً لمتابعة تنزيل الفيديو، مثال: *فيسبوك «رابط فيسبوك»`, event.threadID);
        return;
      }

      // إرسال رسالة للإنتظار
      const waitingMessage = await api.sendMessage(`🕥 | جاري تحميل الفيديو. يرجى الانتظار لحظة...`, event.threadID);

      const res = await axios.get(`https://cc-project-apis-jonell-magallanes.onrender.com/api/fbdl?url=${encodeURIComponent(link)}`);
      const videoData = res.data.url.data;
      const highestResolutionVideo = videoData[0]; // Assuming the first one is the highest resolution

      const videoUrl = highestResolutionVideo.url;

      const videoPath = path.join(process.cwd(), "cache", `fbdl.mp4`);

      // إنشاء Stream لحفظ الفيديو
      const writer = fs.createWriteStream(videoPath);
      const videoStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      videoStream.data.pipe(writer);

      writer.on('finish', () => {
        // حذف رسالة الانتظار قبل إرسال المقطع
        api.unsendMessage(waitingMessage.messageID);

        api.setMessageReaction("✅", event.messageID, null, true);
        

        // إرسال المقطع مع عنوانه
        api.sendMessage(
          {
            body: `༈「تـم تـحـمـيـل الـفـيـديـو」 ✅ ༈`,
            attachment: fs.createReadStream(videoPath)
          },
          event.threadID
        );

        // إعادة تعيين رمز التفاعل على الرسالة الأصلية
        api.setMessageReaction("", event.messageID, null, true);
      });

      writer.on('error', (error) => {
        api.sendMessage(`حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة مرة أخرى لاحقًا.`, event.threadID);
        console.error(error);
      });

    } catch (error) {
      api.sendMessage(`حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة مرة أخرى لاحقًا.`, event.threadID);
      console.log(error);
    }
  }
};