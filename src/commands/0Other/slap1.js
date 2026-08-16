import fs from "fs";
import request from "request";

export default {
  name: "اصفعي",
  author: "محمد الشاوني",
  role: "member",
  description: "يصفع شخصًا معينًا بصورة مضحكة.",
  execute: async ({ api, event }) => {
    var link = ["https://i.postimg.cc/1tByLBHM/anime-slap.gif"];
    var mention = Object.keys(event.mentions);
    let tag = event.mentions[mention].replace("@", "");
    if (mention.length === 0) return api.sendMessage("🔖 | يرجى عمل منشن للشخص الذي تريد صفعه.", event.threadID, event.messageID);
    var callback = () => api.sendMessage({
      body: `يا لها من صفعة! ${tag} 🤚🏼😂\nآسف، لكن أردت أن أخلصك من ذبابة كانت تقف على وجهك القبيح. 🙂`,
      mentions: [{ tag: tag, id: Object.keys(event.mentions)[0] }],
      attachment: fs.createReadStream(process.cwd() + "/cache/slap.gif")
    }, event.threadID, () => fs.unlinkSync(process.cwd() + "/cache/slap.gif"));
    return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(process.cwd() + "/cache/slap.gif")).on("close", () => callback());
  }
};