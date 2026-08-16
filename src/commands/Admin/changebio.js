export default {
    name: "بايو",
    author: "Kaguya Project",
    role: "owner",
    cooldowns: 10,
    description: "تغيير بايو البوت",
    async execute({ api, args }) {
      try {
        var content = args.join(" ") || "";
        await api.changeBio(content);
        return kaguya.reply(` ✅ |تم تغيير بايو البوت إلى : ${content} بنجاح`)
      } catch (err) {
        console.error(err);
      }
    },
  };
  