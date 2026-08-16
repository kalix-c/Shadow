import fs from "fs-extra";
import jimp from "jimp";

async function bal(id, men) {
  let avone = await jimp.read(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();
  let avtwo = await jimp.read(`https://graph.facebook.com/${men}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();
  let pth = "abcd.png";
  let img = await jimp.read("https://i.imgur.com/ES28alv.png");

  img.resize(500, 670).composite(avone.resize(111, 111), 48, 410);

  await img.writeAsync(pth);
  return pth;
}

export default {
  name: "غموض",
  author: "حسسن يعقوبي",
  role: "member",
  description: "جلب صورة للعضو بناءً على منشن أو الرد على رسالة للعضو",

  async execute({ api, event, args }) {
    // التحقق من عدم وجود أي مدخلات في args
    if (args.length === 0 && !event.messageReply) {
      api.sendMessage({ body: "⚠️ | يرجى استخدام هذا الأمر عن طريق عمل منشن للعضو أو الرد على رسالة للعضو. \n💡 كيفية الاستخدام: استخدم الأمر مع منشن للعضو أو الرد على رسالة تحتوي على العضو المطلوب." , threadID: event.threadID });
      return;
    }

    const mentionedUserID = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : null);

    if (!mentionedUserID) {
      api.sendMessage({ body: "⚠️ | يرجى عمل منشن للعضو أو الرد على رسالة للعضو.", threadID: event.threadID });
      return;
    }

    const user = await api.getUserInfo(mentionedUserID);
    const senderName = user ? user[mentionedUserID].name : "Unknown";
    const imagePath = await bal(mentionedUserID, event.senderID);

    // التحقق من وجود event.threadID قبل إرسال الرسالة
    if (event.threadID) {
      api.sendMessage({ body: `فريد : لقد كان ${senderName} طوال الوقت 😯\n${senderName} : نعم وكنت لأنجو بفعلتي لولا تدخلكم أيها الولاد المتطفلون 🤬`, attachment: fs.createReadStream(imagePath) }, event.threadID);
    } else {
      console.log("ThreadID is undefined");
    }
  }
};
