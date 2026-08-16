import axios from 'axios';

export default {
  name: "تحليل",
  author: "Kaguya Project",
  role: "member",
  description: "التعرف على الموسيقى من وجلب المعلومات",
  execute: async function({ api, event }) {
    try {
      if (event.type !== "message_reply") {
        return api.sendMessage("⚠️ | صيغة غير صحيحة. من فضلك رد على رسالة تحتوي على ملف موسيقى.", event.threadID, event.messageID);
      }

      if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage("⚠️ | لا يوجد مرفقات في الرسالة المحددة.", event.threadID, event.messageID);
      }

      if (event.messageReply.attachments.length > 1) {
        return api.sendMessage("⚠️ | يرجى إرسال ملف واحد فقط.", event.threadID, event.messageID);
      }

      const pro = await api.sendMessage("⌛ | جاري رفع المرفق...", event.threadID, event.messageID);
      const attachmentUrl = event.messageReply.attachments[0].url;
      const apiUrl = `http://130.250.191.69:8222/regco?path=${attachmentUrl}`;
      const config = { headers: { 'User-Agent': 'Mozilla/5.0' } };
      
      const retryLimit = 4;
      let attempt = 0;
      let responseData = null;

      const retryMessages = [
        "🔄 | محاولة إعادة التعرف على الموسيقى...",
        "🔄 | ما زلت أحاول التعرف على الموسيقى...",
        "🔄 | محاولة أخيرة للتعرف على الموسيقى...",
        "🔄 | المحاولة النهائية للتعرف على الموسيقى..."
      ];

      while (attempt < retryLimit) {
        try {
          if (attempt > 0) {
            api.editMessage(retryMessages[attempt - 1], pro.messageID);
          } else {
            api.editMessage("🎵 | جاريٍ التعرف على الموسيقى...", pro.messageID);
          }

          const response = await axios.get(apiUrl, config);
          responseData = response.data;

          const artist = responseData.result?.artist;
          if (artist === "Unknown" || !artist) {
            attempt++;
            if (attempt >= retryLimit) {
              throw new Error('❌ | فشل في التعرف على الموسيقى بعد عدة محاولات.');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          break;
        } catch (error) {
          console.error('Error:', error.message);
          if (attempt >= retryLimit - 1) {
            return api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID, event.messageID);
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const artist = responseData.result?.artist || "غير معروف";
      const title = responseData.result?.title || "غير معروف";
      const album = responseData.result?.album || "غير معروف";
      const release_date = responseData.result?.release_date || "غير معروف";
      const label = responseData.result?.label || "غير معروف";
      const timecode = responseData.result?.timecode || "غير معروف";
      const song_link = responseData.result?.song_link || "غير معروف";

      const message = `
      ┏━━⟪ 🎵 𝗠𝘂𝘀𝗶𝗰 𝗥𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻 𝗥𝗲𝘀𝘂𝗹𝘁 ⟫━⦿
      ┃✗ *•𝙲𝙾𝙽𝚃𝙴𝙽𝚃•* 
      ┃Artist: ${artist}
      ┃Title: ${title}
      ┃Album: ${album}
      ┃Release Date: ${release_date}
      ┃Label: ${label}
      ┃Timecode: ${timecode}
      ┃Song Link: ${song_link}
      ┗━━━━━━━━━━⦿`;

      api.editMessage("✅ | إكتمل التحليل", pro.messageID);
      api.unsendMessage(pro.messageID);
      
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
      api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      console.error('Error:', err);
      api.sendMessage('❌ | حدث خطأ أثناء جلب المعلومات. الرجاء المحاولة مرة أخرى لاحقًا.', event.threadID, event.messageID);
    }
  }
};
