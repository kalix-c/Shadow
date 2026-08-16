import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "عمري",
  author: "سمير البيكاتشو",
  role: "member",
  description: "حساب العمر بناءً على تاريخ الميلاد المدخل.",

  execute: async function ({ api, args, event }) {
    const birthdate = args[0];

    if (!birthdate) {
      api.sendMessage("⚠️ | يرجى إدخال تاريخ ميلاد صحيح بتنسيق YYYY-MM-DD.", event.threadID, event.messageID);
      return;
    }

    try {
      const response = await axios.get(`https://rubish-apihub.onrender.com/rubish/agecalculator?birthdate=${encodeURIComponent(birthdate)}&apikey=rubish69`);
      const data = response.data;

      const formattedResponse = `
╟    𝗔𝗚𝗘 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡    ╢
﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌
📅 تاريخ الميلاد: ${birthdate}

🎂 العمر: ${data.ageData.age.years} سنة ${data.ageData.age.months} شهر ${data.ageData.age.days} يوم

📅 إجمالي العمر:
  - السنوات: ${data.ageData.totalAge.years}
  - الأشهر: ${data.ageData.totalAge.months}
  - الأسابيع: ${data.ageData.totalAge.weeks}
  - الأيام: ${data.ageData.totalAge.days}
  - الساعات: ${data.ageData.totalAge.hours}
  - الدقائق: ${data.ageData.totalAge.minutes}
  - الثواني: ${data.ageData.totalAge.seconds}

🎉 عيد الميلاد القادم: ${data.ageData.nextBirthday.dayName}, ${data.ageData.nextBirthday.remainingMonths} شهر ${data.ageData.nextBirthday.remainingDays} يوم

🖼️ رابط الصورة: ${data.imgbbImageUrl}
`;

      if (typeof data.imgbbImageUrl === 'string' && data.imgbbImageUrl) {
        const imagePath = path.join(process.cwd(), 'cache', 'age_image.jpg');
        const response = await axios({
          url: data.imgbbImageUrl,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(fs.createWriteStream(imagePath));

        response.data.on('end', async () => {
          const attachment = fs.createReadStream(imagePath);
          await api.sendMessage({
            body: formattedResponse,
            attachment
          }, event.threadID);
          fs.unlinkSync(imagePath);
        });

        response.data.on('error', (error) => {
          console.error("Error downloading image:", error);
          api.sendMessage(formattedResponse, event.threadID);
        });
      } else {
        await api.sendMessage({
          body: formattedResponse
        }, event.threadID);
      }
    } catch (error) {
      console.error('Error fetching age data:', error);
      api.sendMessage("حدث خطأ أثناء معالجة الطلب.", event.threadID);
    }
  }
};
