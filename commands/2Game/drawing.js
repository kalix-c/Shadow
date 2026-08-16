import axios from 'axios';
import moment from 'moment-timezone';

export default {
  name: "تخيلي",
  author: "HUSSEIN YACOUBI",
  role: "member",
  description: "توليد الصور باستخدام dalle-E",
  aliases: ["تخيل", "dalle"],
  cooldown: 50,

  execute: async ({ api, event, args }) => {
    const senderID = event.senderID;
    let prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
        const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);
    
    if (!prompt) {
      return api.sendMessage("❌|  صيغة خاطئة. ✅ | إستخدم الامر هكذا : 17/18 years old boy/girl watching football match on TV with 'Dipto' and '69' written on the back of their dress, 4", event.threadID, event.messageID);
    }

    try {
      // Translation from Arabic to English if the prompt is in Arabic
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      prompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      // List of cookies
      const cookies = ["1WMSMa5rJ9Jikxsu_KvCxWmb0m4AwilqsJhlkC1whxRDp2StLDR-oJBnLWpoppENES3sBh9_OeFE6BT-Kzzk_46_g_z_NPr7Du63M92maZmXZYR91ymjlxE6askzY9hMCdtX-9LK09sUsoqokbOwi3ldOlm0blR_0VLM3OjdHWcczWjvJ78LSUT7MWrdfdplScZbtHfNyOFlDIGkOKHI7Bg"];
      const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];

      // Inform user the request is being processed
      const wait = api.sendMessage(" ⏱️ | جاري معالجة طلبك يرجى الانتظار....", event.threadID);

      // Make request to generate the image
      const response = await axios.get(`https://www.noobs-api.000.pe/dipto/dalle?prompt=${prompt}&key=dipto008&cookies=${randomCookie}`);
      const imageUrls = response.data.imgUrls || [];

      if (!imageUrls.length) {
        return api.sendMessage("Empty response or no images generated.", event.threadID, event.messageID);
      }

      // Download the images as streams
      const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'stream' }).then(res => res.data)));

      // Unsend the waiting message
      api.unsendMessage(wait.messageID);

      // Get the current time, date, and execution time
      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      // Get user info
      api.getUserInfo(senderID, async (err, userInfo) => {
        if (err) {
          console.error(err);
          return;
        }

        const userName = userInfo[senderID]?.name || "Unknown";

        // Send the final message with the images and details
        await api.sendMessage({
          body: `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`,
          attachment: images
        }, event.threadID, event.messageID);
      });

      // Set the reaction to indicate success
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    } catch (error) {
      console.error("Error: ", error);
      api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
