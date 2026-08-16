import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "تطقيم",
  author: "Shadow Garden Project 1",
  description: "جلب صورة لزوجين أنمي",
  role: "member",
  execute: async ({ api, event, Economy }) => {
    try {
      const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 500;
      if (userMoney < cost) {
        return api.sendMessage(`🔖 | سيكلفك ذالك ${cost} دولار للتطقيم الواحد`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);

      // قراءة الروابط من ملف JSON
      const jsonPath = path.join(process.cwd(), "anime_pairs.json");
      const pairs = fs.readJSONSync(jsonPath).pairs;

      // اختيار فهرس عشوائي للصور
      const index = Math.floor(Math.random() * pairs.length);

      // اختيار الصور بناءً على الفهرس العشوائي
      const femaleImageUrl = pairs[index].female;
      const maleImageUrl = pairs[index].male;

      // تحميل الصور
      const femaleImageResponse = await axios.get(femaleImageUrl, { responseType: "arraybuffer" });
      const maleImageResponse = await axios.get(maleImageUrl, { responseType: "arraybuffer" });

      // حفظ الصور مؤقتًا
      const path1 = path.join(process.cwd(), "cache", "anime_pair_1.jpg");
      const path2 = path.join(process.cwd(), "cache", "anime_pair_2.jpg");
      fs.writeFileSync(path1, Buffer.from(femaleImageResponse.data, "binary"));
      fs.writeFileSync(path2, Buffer.from(maleImageResponse.data, "binary"));

      // إرسال الصور إلى المستخدم
      await api.sendMessage(
        {
          body: '◆❯━━━━━▣✦▣━━━━━❮◆\n\t「إليك التطقيم الخاص بك ✨」\n◆❯━━━━━▣✦▣━━━━━❮◆',
          attachment: [
            fs.createReadStream(path1),
            fs.createReadStream(path2)
          ],
        },
        event.threadID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء جلب الصور.", event.threadID);
    }
  },
};
