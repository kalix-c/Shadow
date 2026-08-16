export default {
    name: "بايو",
    author: "Shadow Garden Project",
    role: "owner",
    cooldowns: 10,
    description: "تغيير بايو البوت",
    async execute({ api, args }) {
      try {
        var content = args.join(" ") || "";
        await api.changeBio(content);
        return global.shadow.reply(` ✅ |تم تغيير بايو البوت إلى : ${content} بنجاح`)
      } catch (err) {
        console.error(err);
      }
    },
  };
  