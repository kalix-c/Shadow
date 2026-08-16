import fs from "fs";
const emojiJSON = JSON.parse(fs.readFileSync("./cache12/emoji/emoji.json", "utf-8"));

class setimg {
  name = "ضبط_إيموجي";
  author = "Kaguya Project";
  cooldowns = 60;
  descriptions = "تغيير إيموجي المجموعة";
  role = "admin";
  aliases = [];

  async execute({ api, event, args }) {
    try {
      var [emoji] = args;
      if (!emojiJSON.includes(emoji)) {
        return kaguya.reply(" ⚠️ |الرجاء إدخال إيموجي صالح !")
      }
      await api.changeThreadEmoji(emoji, event.threadID, event.messagaID);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new setimg();
