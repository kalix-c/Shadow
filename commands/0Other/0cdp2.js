import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "رقص",
  author: "Kisara",
  role: "member",
  description: "احصل على صورة متحركة للرقص",
  async execute({ api, event }) {
    try {

          api.setMessageReaction("✨", event.messageID, () => {}, true);
      
      const BASE_URL = `https://apiservice1.kisara.app/satou/api/endpoint/dance`;

      const response = await axios.get(BASE_URL);
      const danceURL = response.data.url;

      if (danceURL) {
        const cachePath = path.join(process.cwd(), "cache", "dance.gif");

        const imageResponse = await axios.get(danceURL, { responseType: "stream" });
        const writer = fs.createWriteStream(cachePath);

        imageResponse.data.pipe(writer);

        writer.on("finish", async () => {
          const form = {
            body: "هيا لنرقص 🕺",
            attachment: fs.createReadStream(cachePath)
          };

          await api.sendMessage(form, event.threadID);
        });

        writer.on("error", async (err) => {
          console.error(err);
          await api.sendMessage("❌ | حدث خطأ أثناء حفظ صورة الرقص.", event.threadID);
        });
      } else {
        await api.sendMessage("❌ | حدث خطأ أثناء جلب صورة الرقص.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      await api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};