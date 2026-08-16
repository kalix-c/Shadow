import axios from "axios";
import fs from "fs";
import path from "path";

async function getImage(searchText) {
  try {
    const apiUrl = `https://www.samirxpikachu.run.place/google/imagesearch?q=${encodeURIComponent(searchText)}`;
    const response = await axios.get(apiUrl);
    const imageUrl = response.data.data[0];
    const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imagePath = path.join(process.cwd(), 'cache', 'image.jpg');
    await fs.promises.writeFile(imagePath, imageBuffer.data);
    return imagePath;
  } catch (error) {
    console.error("حدث خطأ أثناء جلب الصورة:", error.message);
    throw error;
  }
}

export default {
  name: "شخصيتي_السينمائية",
  author: "حسين يعقوبي",
  role: "member",
  description: "يقترح شخصية سينمائية عشوائية مع صورتها.",
  execute: async function({ api, event, Economy }) {

const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 500;
      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً من اجل الشخصية الواحدة`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID)
    
    const tl = ["هانابيل ليكتر", "نورمان بيتس", "دارث فيدر", "هاري بوتر", "جيمس بوند", "ريك بلين", "روكي بالوا", "روبن هود", "سوبرمان", "ايرون مان", "باتمان", "بروس وين", "زورو", "أندرو بيكيت", "المحقق ألونسو هاريس", "فيربل كينت", "توني سبرانو", "جون سنو", "الجوكر", "تي باج", "الحاكم", "تايون لانيستر", "والتر وايت", "جاس فرينج", "آريا ستارك", "شارلوك هولمز", "دين وينشستر", "توماس شيلبي", "ثانوس", "هانز جروبر", "فولدمورث", "انت لا تشبه احد، أنت فريد من نوعك!", "مايكل مايرز", "هومر سيمبسون", "غرينتش", "تشارلي براون", "جيقساو", "بيتمان", "انطونيو مونتانا", "فيتو كوروليوني", "مايكل كوروليوني", "روكي بالوا", "رامبو", "جاك سبارو", "تايلر دردن", "ليون", "ماكسيموس", "جانغو الحر", "جون ويك", "هاري بوتر", "لورد فولدمورت", "ثانوس", "ايرون مان", "ثور", "فورست غامب", "نورمان بيتس", "ترمنايتور", "ماكس", "الملك ليونايدس", "سبايدر مان", "ولڤرين", "كابتن اميركا", "بينجامين بوتين", "جاك دوسون", "انطوان شوغر", "ترافيس", "دارث فيدر", "شارلي شابلن", "فينوم"];
    const randomIndex = Math.floor(Math.random() * tl.length);
    const randomCharacter = tl[randomIndex];

    try {
      const imagePath = await getImage(randomCharacter);
      const userInfo = await api.getUserInfo(event.senderID);
      const user = userInfo[event.senderID];
      const name = user ? user.name : "الشخص المذكور"; // استخدام اسم العضو

      api.sendMessage({
        body: `🍒 شخصيتك السينمائية يا ${name} هي: ${randomCharacter}`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);
    } catch (error) {
      console.error("حدث خطأ أثناء تنفيذ الأمر:", error.message);
      api.sendMessage("حدث خطأ أثناء جلب الشخصية السينمائية وصورتها.", event.threadID);
    }
  }
};
