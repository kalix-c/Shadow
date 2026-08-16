import fs from 'fs';
import path from 'path';
import axios from 'axios';

const AntiPath = "./cache/data/anti";
const antiDir = path.join(AntiPath, "anti");

if (!fs.existsSync(antiDir)) fs.mkdirSync(antiDir, { recursive: true });

const antiIMG = path.join(antiDir, "antiIMG.json");

const crFile = (f, i) => {
    if (!fs.existsSync(f)) {
        const data = i !== undefined ? JSON.stringify(i, null, 2) : JSON.stringify([]);
        fs.writeFileSync(f, data);
    }
};

crFile(antiIMG);

class AntiboxImage {
  constructor() {
    this.name = 'حماية_الصورة';
    this.author = 'Kaguya Project';
    this.cooldowns = 60;
    this.description = 'حماية المجموعة من تغيير صورتها!';
    this.role = 'admin';
  }

  /**
   * تنفيذ الأمر للحماية من تغيير صورة المجموعة.
   * @param {object} params - المعلمات التي تحتوي على api وevent وThreads.
   */
  async execute({ api, event, args, Threads }) {
    try {
      const { threadID } = event;
      let antiData = [];
      
      // قراءة البيانات من ملف antiIMG
      if (fs.existsSync(antiIMG)) {
        const read = await fs.promises.readFile(antiIMG, 'utf-8');
        antiData = read ? JSON.parse(read) : [];
      }

      let threadEntry = antiData.find(entry => entry.threadID === threadID);

      if (threadEntry) {
        // إيقاف وضع الحماية
        antiData = antiData.filter(entry => entry.threadID !== threadID);
        await fs.promises.writeFile(antiIMG, JSON.stringify(antiData, null, 4), 'utf-8'); 
        api.sendMessage("✅ تم إيقاف وضع الحماية لصورة المجموعة", threadID);
      } else {
        // تفعيل وضع الحماية
        let url;
        let msg = await api.sendMessage("🔨 جارٍ تفعيل وضع الحماية، يرجى الانتظار", threadID);

        const thread = (await Threads.find(threadID)).data;
        const imageSrc = thread.threadThumbnail;

        try {
          const response = await axios.get(`https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(imageSrc)}`);
          url = response.data.url;

          const Data = { 
            threadID: threadID, 
            url: url,
            report: {} 
          };
          antiData.push(Data);
          await fs.promises.writeFile(antiIMG, JSON.stringify(antiData, null, 4), 'utf-8'); 
          api.unsendMessage(msg.messageID);
          api.sendMessage("✅ تم تفعيل وضع الحماية لصورة المجموعة", threadID);
        } catch (error) {
          api.sendMessage("⚠️ حدث خطأ", threadID);
        }
      }
    } catch (error) {
      console.error('خطأ أثناء تنفيذ الأمر:', error);
      api.sendMessage("❌ | لقد حدث خطأ غير متوقع!", event.threadID);
    }
  }
}

export default new AntiboxImage();
