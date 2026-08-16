import axios from "axios";
import fs from "fs";

const emojiJSON = JSON.parse(fs.readFileSync("./cache12/emoji/emoji.json", "utf-8"));

export default {
  name: "دمج",
  author: "Shadow Garden Project",
  role: "member",
  cooldowns: 10,
  description: "دمج إثنان من الإيموجي",
  async execute({ api, args, event }) {
    const [emoji_1, emoji_2] = args;

    if (!emoji_1 || !emoji_2) return kaguya.reply(" ⚠️ | قم بإدخالها على هذه الشاكل \nعلى سبيل المثال : *دمج 😎 😇 ");
    if (!emojiJSON.includes(emoji_1) || !emojiJSON.includes(emoji_2)) return kaguya.reply("⚠️ | الإيموجي اللذي أدخلته غير صالح ");

    try {
      const mix = await axios.get(encodeURI(`https://tenor.googleapis.com/v2/featured?key=AIzaSyACvEq5cnT7AcHpDdj64SE3TJZRhW-iHuo&client_key=emoji_kitchen_funbox&q=${emoji_1}_${emoji_2}&collection=emoji_kitchen_v6&contentfilter=high`));

      if (!mix.data.results.length) return kaguya.reply(" ❌ |لا يمكن دمج هذا االإيمجيان ، يرجى المحاولة مرة أخرى باستخدام إيموجي آخر!");

      const { png_transparent: { url } } = mix.data.results[0].media_formats;
      const getImg = await axios.get(url, { responseType: "stream" });

      return api.sendMessage({
        body : ` ✅ | تم الدمج : هذا ${emoji_1} مع ${emoji_2} :`,
        attachment: getImg.data
      }, event.threadID, event.messageID)
    } catch (error) {
      console.error("حدث خطأ: ", error);
      return kaguya.reply(" ❌ |حدث خطأ أثناء معالجة. الرجاء معاودة المحاولة في وقت لاحق.");
    }
  },
};