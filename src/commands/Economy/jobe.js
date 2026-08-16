import moment from 'moment-timezone';

let lastExecutionDate = {}; // جدول لتخزين تاريخ آخر تنفيذ لكل مستخدم

export default {
  name: "عمل",
  author: "kaguya project",
  cooldowns: 3600, // فترة التبريد تعادل ساعة واحدة بالثواني
  description: "قم بإجراء عمل واحصل على مكافأة!",
  role: "member",
  async execute({ api, event, Economy, args }) {
    try {
      const works = [
        { name: "بيع التذاكر في محطة الحافلات (الكيران)", reward: 100, duration: 7200 }, // 2 ساعة 
        { name: "إصلاح سيارة (ميكانيسيان ديال الطنوبيلات)", reward: 150, duration: 10800 }, // 3 ساعات
        { name: "البرمجة (إما غتنفع الدولة إما غتولي هاكر)", reward: 200, duration: 18000 }, // 5 ساعات
        { name: "هاكر فايسبوك (ياك المرضي)", reward: 250, duration: 7200 }, // 2 ساعة
        { name: "شيف في مطبخ 5 نجوم (تبارك الله)", reward: 300, duration: 10800 }, // 3 ساعات
        { name: "سائق حافلة (شيفور ديال الكار)", reward: 350, duration: 18000 }, // 5 ساعات
        { name: "تستغل كسائق أجرة في شركة indriver", reward: 400, duration: 7200 }, // 2 ساعة
        { name: "تحول جنسي شخص ما (ياك المرضي تقاداو الخدامي حتا تخدم بحال هاد الخدمامي)", reward: 450, duration: 10800 }, // 3 ساعات
        { name: "إصلاح الحنفيات (بلومبي) ( ͡° ͜ʖ ͡°)", reward: 500, duration: 18000 }, // 5 ساعات
        { name: "ستريمر تقدر تݣول ݣيمر", reward: 550, duration: 7200 }, // 2 ساعة
        { name: "تجارة إلكترونية", reward: 600, duration: 10800 }, // 3 ساعات
        { name: "ربت بيت", reward: 650, duration: 18000 }, // 5 ساعات
        { name: "بائعة الزهور", reward: 700, duration: 7200 }, // 2 ساعة
        { name: "ابحث عن كود jav/hentai لـ SpermLord", reward: 750, duration: 10800 }, // 3 ساعات
        { name: "العب كرة القدم واحمل فريقك", reward: 800, duration: 18000 },
        // إضافة المزيد من الأعمال هنا
      ];

      const randomWork = works[Math.floor(Math.random() * works.length)];
      const user = event.senderID;
      const currentTime = moment().unix(); // الحصول على الوقت الحالي بالثواني

      // التحقق من آخر تنفيذ
      if (lastExecutionDate[user]) {
        const lastExecution = moment.unix(lastExecutionDate[user]);
        const nextAllowedExecution = lastExecution.add(1, 'hour'); // إضافة ساعة واحدة

        if (moment().isBefore(nextAllowedExecution)) {
          const timeLeft = moment.duration(nextAllowedExecution.diff(moment())).humanize();
          return api.sendMessage(`⚠️ | لقد قمت بالعمل مؤخراً، يرجى المحاولة مرة أخرى بعد ${timeLeft}.`, event.threadID);
        }
      }

      // إضافة المكافأة إلى الرصيد
      await Economy.increase(randomWork.reward, user);

      // تحديث تاريخ آخر تنفيذ للمستخدم إلى الوقت الحالي
      lastExecutionDate[user] = currentTime;

      // حساب وقت انتهاء العمل
      const endTime = currentTime + randomWork.duration;
      const endTimeFormatted = moment.unix(endTime).format('YYYY-MM-DD HH:mm:ss');

      // إرسال رسالة النجاح
      return api.sendMessage(
        `👨‍🔧 | لقد قمت بـ "${randomWork.name}" وقد كسبت "${randomWork.reward}" دولار!\n⏰ | العمل سينتهي في: ${endTimeFormatted}`,
        event.threadID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | حدث خطأ أثناء تنفيذ العمل.", event.threadID);
    }
  },
};
