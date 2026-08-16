import jimp from 'jimp';
import fs from 'fs';
import path from 'path';

async function getProfilePicture(userID) {
    const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const img = await jimp.read(url);
    const profilePath = `profile_${userID}.png`;
    await img.writeAsync(profilePath);
    return profilePath;
}

async function getMessageCount(api, threadId, userID) {
  try {
    const messages = await api.getThreadHistory(threadId, 1000);
    if (!messages || !Array.isArray(messages)) {
        throw new Error('Failed to fetch thread history.');
    }

    let userMessageCount = 0;
    messages.forEach(message => {
      // التحقق من أن الرسالة موجودة وأنها تحتوي على senderID
      if (message && message.senderID && message.senderID === userID) {
        userMessageCount++;
      }
    });

    return userMessageCount;
  } catch (err) {
    console.error('Error fetching message count:', err);
    return 0;
  }
}

export default {
  name: "معلوماتي",
  author: "Kaguya Project",
  role: "member",
  aliases: ["ايدي"],
  description: "جلب معلومات العضو.",
  execute: async function({ api, event, args, Economy, Exp }) {
    try {
      const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);
      const userInfo = await api.getUserInfo(parseInt(uid));
      
      if (!userInfo[uid]) {
        api.sendMessage(`⚠️ | قم بعمل منشن للشخص ما.`, event.threadID, event.messageID);
        return;
      }

      const { firstName, name, gender, profileUrl } = userInfo[uid];
      const userIsFriend = userInfo[uid].isFriend ? "✅ نعم" : "❌ لا";
      const isBirthdayToday = userInfo[uid].isBirthdayToday ? "✅ نعم" : "❌ لا";
      const profilePath = await getProfilePicture(uid);

      // استخدام Economy.getBalance لجلب الرصيد
      const balanceResult = await Economy.getBalance(uid);
      const money = balanceResult.data;

      // جلب عدد الرسائل للشخص المحدد في المحادثة
      const userMessageCount = await getMessageCount(api, event.threadID, uid);

      // استخدام Exp.check لجلب نقاط الخبرة
      const userDataFile = path.join(process.cwd(), 'pontsData.json');
      const userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      const userPoints = userData[uid]?.points || 0; // جلب نقاط المستخدم المحدد

      // تصنيف المستخدم باستخدام عدد الرسائل
      const rank = getRank(userMessageCount);

      const message = `
•——[معلومات]——•\n\n✨ مــﻋــڷــﯡمــاٺ ؏ــن : 『${firstName}』\n❏👤 إسـمـك: 『${name}』\n❏♋ جـنـسـيـتـك : 『${gender === 1 ? "أنثى" : "ذكر"}』\n❏💰 رصـيـدك :『${money}』 دولار\n❏🎖️نـقـاطـك : 『${userPoints}』 نقطة\n❏📩 رسـائـلـك : 『${userMessageCount}』\n❏🧿 تـصـنـيـفـك : 『${rank}』
`;

      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(profilePath)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error('Error:', err);
      api.sendMessage('❌ | حدث خطأ أثناء جلب المعلومات. الرجاء معاودة المحاولة في وقت لاحق.', event.threadID, event.messageID);
    }
  }
}

// دالة لتحديد تصنيف المستخدم بناءً على عدد الرسائل
function getRank(messageCount) {
  if (messageCount >= 2000) return 'خارق🥇';
  if (messageCount >= 1000) return '🥈عظيم';
  if (messageCount >= 900) return '👑أسطوري';
  if (messageCount >= 800) return 'نشط🔥 قوي';
  if (messageCount >= 700) return '🌠نشط';
  if (messageCount >= 600) return 'متفاعل🏅 قوي';
  if (messageCount >= 500) return '🎖️متفاعل جيد';
  if (messageCount >= 400) return '🌟متفاعل';
  if (messageCount >= 300) return '✨لا بأس';
  if (messageCount >= 200) return '👾مبتدأ';
  if (messageCount >= 100) return '🗿صنم';
  return 'ميت⚰️';
}
