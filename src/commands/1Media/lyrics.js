import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "كلمات",
  author: "Shadow Garden Project",
  description: "يجلب كلمات الأغنية مع الفنان",
  role: "member",
  execute: async ({ event, api }) => {
    const input = event.body;
    const title = input.slice(7);

    axios
      .get(`https://sampleapi-mraikero-01.vercel.app/get/lyrics?title=${title}`)
      .then(response => {
        const result = response.data.result;
        if (result && result.s_title) {
          const message = `عنوان الأغنية 📀 "${result.s_title}" من طرف 🧾${result.s_artist}:\n\n${result.s_lyrics}`;

          const imagePath = path.join(process.cwd(), 'temp', 'lyrics.jpg');

          axios({
            method: 'GET',
            url: result.s_image,
            responseType: 'stream'
          }).then(response => {
            response.data.pipe(fs.createWriteStream(imagePath)).on('finish', () => {
              api.sendMessage({
                body: message,
                attachment: fs.createReadStream(imagePath)
              }, event.threadID);
            });
          }).catch(error => {
            console.error(error);
            api.sendMessage(" ❌ |حدث خطأ أثناء جلب الصورة. الرجاء معاودة المحاولة في وقت لاحق.", event.threadID);
          });
        } else {
          api.sendMessage(" ❌ |لم يتم العثور على معلومات الأغنية المطلوبة. الرجاء التحقق من العنوان والمحاولة مرة أخرى.", event.threadID);
        }
      })
      .catch(error => {
        console.error(error);
        api.sendMessage(" ❌ |حدث خطأ أثناء جلب الكلمات والصورة. الرجاء معاودة المحاولة في وقت لاحق.", event.threadID);
      });
  }
};