import axios from 'axios';

export default {
  name: "ميوكي",
  author: "Chilli Mansi",
  role: "member",
  description: "يحلل صورة مرفقة أو يستجيب لاستفسار نصي باستخدام Gemini AI.",
  aliases:["Ai","ai"],
  async execute({ api, event, args }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    // إذا لم يتم توفير نص أو صورة، أرسل رسالة توضح ذلك
    if (!customPrompt && !attachment) {
      return api.sendMessage('Please provide a prompt or attach a photo for Gemini to analyze.', event.threadID, event.messageID);
    }

    // إعداد رابط API بناءً على ما إذا كان هناك صورة مرفقة أو نص
    let apiUrl = 'https://deku-rest-api-3jvu.onrender.com/gemini?';
    if (attachment && attachment.type === 'photo') {
      const prompt = customPrompt || 'answer this photo';
      const imageUrl = attachment.url;
      apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
      apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    // إرسال رسالة مؤقتة توضح أن الطلب قيد المعالجة
    const initialMessage = await new Promise((resolve, reject) => {
      api.sendMessage({
        body: '🔍 | جاري المعالجة يرجى الانتظار...',
        mentions: [{ tag: event.senderID, id: event.senderID }],
      }, event.threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      }, event.messageID);
    });

    try {
      // استدعاء API للحصول على الرد
      const response = await axios.get(apiUrl);
      const aiResponse = response.data.gemini;

      // تنسيق الرد النهائي
      const formattedResponse = `
✨ 𝙶𝚎𝚖𝚒𝚗𝚒 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
`;

      // حذف الرسالة المؤقتة بعد اكتمال المعالجة
      await api.unsendMessage(initialMessage.messageID);

      // إرسال الرد النهائي
      await api.sendMessage(formattedResponse.trim(), event.threadID, event.messageID);

    } catch (error) {
      console.error('Error:', error);
      // في حال حدوث خطأ، حذف الرسالة المؤقتة وتوضيح أن هناك خطأ
      await api.unsendMessage(initialMessage.messageID);
      await api.sendMessage('An error occurred, please try using the "ai2" command.', event.threadID, event.messageID);
    }
  }
};
