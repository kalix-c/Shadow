class Threads {
  name = "المجموعة";
  author = "Kaguya Project";
  cooldowns = 0;
  description = "منع المجموعات من استخدام البوت";
  role = "owner";
  aliases = ["ثريدز"];
  async execute({ api, event, Users, args, Threads }) {
    if (!event.isGroup) return kaguya.reply(" ⚠️ |لا يمكن استخدام هذا الأمر إلا في مجموعات");
    var [type, reason = " ⚠️ |لم يتم إعطاء السبب"] = args;
    switch (type) {
      case "قائمة": {
        var { data } = await Threads.getAll();
        var msgArray = data.map((value, index) => {
          return `${index + 1}. المعرف : ${value.threadID} - أعضاء المجموعة : ${value.data.members}\nإسم المجموعة : ${value.data.name}\n`;
        });
        var msg = msgArray.join("\n");
        return kaguya.reply(`${msg}\n⚠️ |قم بالرد على هذه الرسالة حسب رقم المجموعة اللتي ترغب في حظرها !`, (err, info) => {
          client.handler.reply.set(info.messageID, {
            author: event.senderID,
            name: this.name,
            autosend: true,
            type: "ban",
            threadDATA: data,
          });
        });
      }
      case "حظر": {
        var TID = await Threads.ban(event.threadID, { status: true, reason });
        return kaguya.reply(TID.data);
      }
      case "رفع": {
        var TID = await Threads.ban(event.threadID, { status: false, reason: "" });
        console.log(TID)
        return kaguya.reply(` ⚠️ | قم بإدخال معرف المجموعة من أجل رفع الحظر : ${event.threadID}`);
      }
      default: {
        var name = client.config.prefix + this.name;
        return kaguya.reply(`[ المجموعة ]\n${name} حظر <حظر مجموعة معينة>\n${name} رفع <رفع الحظر عن مجموعة معينة>\n${name} قائمة <قائمة المجموعات المراد حظرها>`);
      }
    }
  }
}
export default new Threads();
