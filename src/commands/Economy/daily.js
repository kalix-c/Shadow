import axios from "axios";
import fs from "fs";

class CheckTT {
  constructor() {
    this.name = "هدية";
    this.author = "Shadow Garden Project";
    this.role = "member";
    this.description = "الحصول على مال اليومي كل يوم";
    this.aliases = ["هديه"];
    this.cooldowns = 3600; // 3600 ثانية تعني ساعة واحدة
  }

  async execute({ api, event, Economy, Users }) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStamps = this.cooldowns; // ساعة واحدة

    try {
      const lastCheckedTime = await Users.find(event.senderID);
      if (
        lastCheckedTime?.data?.data?.other?.cooldowns &&
        currentTime - parseInt(lastCheckedTime?.data?.data?.other?.cooldowns) < timeStamps
      ) {
        const remainingTime = timeStamps - (currentTime - lastCheckedTime?.data?.data?.other?.cooldowns);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        return api.sendMessage(`⚠️ | لقد حصلت هلى مكافئتك بالفعل\n ⏱️ | قم بالعودة بعد: ${minutes} دقيقة ${seconds} ثانية`, event.threadID);
      }

      // قائمة المكافآت اليومية
      const dailyRewards = ["5000", "1000", "1050", "1600", "1000", "1009", "1200", "1000", "1400", "1581", "1980", "9910", "1697", "6955", "6900", "6990", "4231", "5482", "1158", "1151", "5400"];

      // اختيار مكافأة عشوائية
      const randomIndex = Math.floor(Math.random() * dailyRewards.length);
      const rewardAmount = parseInt(dailyRewards[randomIndex]);

      await Economy.increase(rewardAmount, event.senderID);
      await Users.update(event.senderID, {
        other: {
          cooldowns: currentTime,
        },
      });

      // جلب الصورة المتحركة
      const response = await axios.get("https://i.imgur.com/t5VGSUZ.gif", { responseType: "stream" });

      // حفظ الصورة المتحركة المحملة إلى ملف مؤقت
      const imagePath = "./cache/temp.gif";
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        // إرسال الصورة المتحركة مع رسالة الهدية
        api.sendMessage(
          {
            body: `✅ | 𝔡𝔬𝔫𝔢 𝔰𝔲𝔠𝔠𝔢𝔰𝔰𝔣𝔲𝔩𝔩𝔶 \n مكافئتك هي 🎁: ${rewardAmount} دولار`,
            attachment: fs.createReadStream(imagePath),
          },
          event.threadID
        );
      });
    } catch (error) {
      console.error("❌ | حدث خطأ:", error);
      api.sendMessage("❌ | حدث خطأ أثناء تنفيذ العملية.", event.threadID);
    }
  }
}

export default new CheckTT();
