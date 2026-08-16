class antiboxname {
  name = "حماية_الإسم";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير إسمها!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads }) {
    try {
      var threads = (await Threads.find(event.threadID))?.data?.data;
      var status = threads?.anti?.nameBox ? false : true;
      await Threads.update(event.threadID, {
        anti: {
          nameBox: status,
        },
      });
      return kaguya.reply(`تم  ${status ? "تشغيل" : "❌ إطفاء ✅"} ميزة الحماية من تغيير إسم المجموعة`);
    } catch (err) {
      console.error(err);
      return kaguya.reply(" ❌ |لقد حدث خطأ غير متوقع!");
    }
  }
}

export default new antiboxname();
