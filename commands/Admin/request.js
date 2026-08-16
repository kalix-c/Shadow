import axios from "axios";

async function fetchWikiInfo({ event, api }) {
  const data = event.body.split(' ');
  if (data.length < 2) {
    api.sendMessage(' ⚠️ | إستخدام غير صالح للأمر !\nكيفية الإستخدام: ويكيبيديا  <كلمة>', event.threadID);
  } else {
    try {
      data.shift();
      let txtWiki = '';
      const res = await getWiki(data.join(' '));
      if (res === undefined || res.title === undefined) {
        throw new Error(`API RETURNED THIS: ${res}`);
      }
      txtWiki += `🔎 أن كنت تبحث عن تعريف للكلمة  '${res.title}' \n\n الطابع الزمني: ${res.timestamp}\n\n الوصف : ${res.description}\n\n معلومات : ${res.extract}\n\nالمصدر : https://ar.wikipedia.org`;
      api.sendMessage(txtWiki, event.threadID, event.messageID);
    } catch (err) {
      api.sendMessage(err.message, event.threadID, event.messageID);
    }
  }
}

async function getWiki(q) {
  try {
    const response = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${q}`);
    return response.data;
  } catch (error) {
    return error;
  }
}

export default {
  name: "ويكيبيديا",
  author: "حسين يعقوبي",
  role: "member",
  description: "قم بجلب معلومات حول أمر ما من موقع ويكيبيديا",
  execute: fetchWikiInfo
};