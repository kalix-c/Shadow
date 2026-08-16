import axios from 'axios';

export default {
  name: "لو-خيروك",
  author: "محمد الشاوني",
  role: "member",
  description: "لعبة لو خيروك بأستخدام سؤال عشوائي.",

  async execute({ api, event }) {
    try {
      api.setMessageReaction("🎲", event.messageID, () => {}, true);

      const response = await axios.get('https://api.popcat.xyz/wyr');

      if (response.status !== 200 || !response.data || !response.data.ops1 || !response.data.ops2) {
        throw new Error('Invalid or missing response from the API');
      }

      const message = `لو خيروك بين : \n1️⃣ | ${response.data.ops1}\n2️⃣ | ${response.data.ops2}`;

      // Translate message from English to Arabic
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(message)}`);
      const translatedMessage = translationResponse?.data?.[0]?.[0]?.[0] || message;

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage({ body: translatedMessage }, event.threadID, event.messageID);

    } catch (error) {
      console.error(`Failed to fetch or send "Would You Rather" question: ${error.message}`);
      api.sendMessage('عذراً، حدث خطأ أثناء محاولة جلب السؤال. حاول مرة أخرى لاحقاً.', event.threadID, event.messageID);
    }
  }
};
