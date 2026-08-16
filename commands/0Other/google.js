import path from 'path';
import fs from 'fs';

async function getGreetingImage() {
  // تحديد المسار إلى مجلد 'sista.mp4'
  const imagePath = path.join(process.cwd(), 'cache12', 'sista.mp4'); // تحديث اسم الصورة إذا كان مختلفًا
  return fs.createReadStream(imagePath);
}

export default {
  name: "سيستا",
  author: "البوت",
  role: "member",
   aliases:["siesta","sista"],
  description: "يرسل رسالة ترحيبية مع صورة.",
  execute: async function({ api, event }) {
    try {
      const greetingImageStream = await getGreetingImage();
       
       api.setMessageReaction("💖", event.messageID, (err) => {}, true);
  
      api.sendMessage({
        body: "✧───────────────✧\n\t\t\t\tѕɪᴇѕᴛᴀ ᴡᴀɪғᴜ 💖\n✧───────────────✧",
        attachment: greetingImageStream
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error sending greeting message:', error);
      api.sendMessage('❌ | حدث خطأ أثناء إرسال الرسالة الترحيبية.', event.threadID, event.messageID);
    }
  }
};
