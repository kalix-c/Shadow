import jimp from "jimp"
export default {
  name: "الرمز",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "Lấy UID của người dùng",
  role: "member",
  aliases: ["prefix","Prefix","البادئة"],
  execute: async ({ event, Threads, args }) => {
    if (!event.isGroup) {
      return kaguya.reply(" ⚠️ |لا يمكن استخدام هذا الأمر إلا في مجموعات!");
    }

    const getThread = await Threads.find(event.threadID);

    const responses = {
      true: () => {
        if (args[0]) {
          Threads.update(event.threadID, { prefix: args[0] }).then(() => {
            kaguya.reply(" ✅ |تم تغيير بادئة مجموعتك إلى : " + args[0]);
          });
        } else {
          kaguya.reply(` 🧭 | لاتوجد بادئة في الوقت الحالي`);
        }
      },
      false: () => kaguya.reply(" ❌ |لم يتم العثور على معلومات مجموعة الأصدقاء في قاعدة البيانات"),
    };

    responses[getThread?.status || false]();
  },
};
