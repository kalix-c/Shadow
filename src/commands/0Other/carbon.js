export default {
  name: "تحويل",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "يحاول تحويل المال من مستخدم إلى آخر.",
  role: "member",
  aliases: ["trans", "إرسال"],
  execute: async ({ api, event, Users, Threads, Economy }) => {
    // استخراج البيانات من الرسالة
    const args = event.body.split(' ');
    const coins = parseInt(args[1], 10);
    let targetUID = args[2]; // افتراضيًا، نبدأ بالمعرف المقدم

    // التحقق مما إذا كان هناك رد على شخص آخر
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      // التحقق مما إذا تم ذكر شخص آخر في الرسالة
      targetUID = Object.keys(event.mentions)[0];
    }

    // التحقق من صحة المدخلات
    if (isNaN(coins) || coins <= 0 || !targetUID) {
      return api.sendMessage("⚠️ | يرحى ادخالها بالتنسيق التالي \nتحويل كمية المال المعرف مثال : تحويل 1000 1000648477485", event.threadID, event.messageID);
    }

    // التحقق مما إذا كان المرسل يحاول إرسال المال لنفسه
    if (targetUID === event.senderID) {
      const penalty = 1000;
      await Economy.decrease(penalty, event.senderID);
      return api.sendMessage(`⚠️ | لا يمكنك إرسال المال لنفسك! تم خصم ${penalty} دولار كعقوبة.`, event.threadID, event.messageID);
    }

    try {
      // تنفيذ عملية التحويل
      const response = await Economy.pay(coins, targetUID);

      // الحصول على معلومات المستخدمين
      const userinfoSender = await api.getUserInfo(event.senderID);
      const userinfoTarget = await api.getUserInfo(targetUID);

      const senderName = userinfoSender[event.senderID]?.name || "المرسل";
      const targetName = userinfoTarget[targetUID]?.name || "المستلم";

      // إرسال رسالة نجاح
      const successMessage = `✅ | تم بنجاح تحويل مبلغ ${coins} دولار من طرف ${senderName} إلى ${targetName} بنجاح.`;
      return api.sendMessage(successMessage, event.threadID, event.messageID);
    } catch (error) {
      console.log(error);
      return api.sendMessage("حدث خطأ أثناء محاولة تحويل المال.", event.threadID, event.messageID);
    }
  },
  events: async ({ api, event, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للأحداث هنا إذا لزم الأمر
  },
  onReply: async ({ api, event, reply, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للردود هنا إذا لزم الأمر
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للتفاعلات هنا إذا لزم الأمر
  },
};
