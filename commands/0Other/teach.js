import fs from 'fs';

export default {
  name: "فزورة",
  author: "Hussein Yacoubi",
  role: "member",
  description: "لعبة فزورة تحتوي على أسئلة متعددة الاختيارات.",

  execute: async function ({ api, event }) {
    try {
      // قراءة الأسئلة من ملف JSON
      const questions = JSON.parse(fs.readFileSync('question.json', 'utf8'));

      // اختيار سؤال عشوائي
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      const { question, أ, ب, ت, ث } = randomQuestion;

      // إعداد الخيارات
      const options = {
        أ: أ || "غير متوفر",
        ب: ب || "غير متوفر",
        ت: ت || "غير متوفر",
        ث: ث || "غير متوفر"
      };

      // تعيين الإجابة بشكل صحيح
      const validAnswers = ['أ', 'ب', 'ت', 'ث'];
      const answer = validAnswers.includes(randomQuestion.answer) ? randomQuestion.answer : "غير معروف";

      // إرسال السؤال مع الخيارات
      const message = `✿━━━━━━━━━━━━━━━━✿\n ${question}\n❏أ: ${options.أ}\n❏ب: ${options.ب}\n❏ت: ${options.ت}\n❏ث: ${options.ث}\nقم بالرد على الرسالة اعلاه بالحرف على الجواب الصحيح\n✿━━━━━━━━━━━━━━━━✿`;
      api.sendMessage(message, event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "فزورة",
          answer: answer,
          unsend: true,
        });
      });
    } catch (error) {
      console.error('Error reading questions:', error);
      api.sendMessage("حدث خطأ أثناء قراءة الأسئلة. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
    }
  },

  onReply: async function({ api, event, reply, Economy }) {
    if (reply.type === "pick") {
      const userAnswer = event.body.trim().toUpperCase();
      if (userAnswer === reply.answer) {
        api.sendMessage("✅ | تهانينا إجابتك صحيحة! 🎉 وحصلت بذالك على 500 دولار 💵", event.threadID, event.messageID);
        // زيادة المال للمستخدم في حالة الفوز
        await Economy.increase(500, event.senderID);
        // تعيين ردود الفعل
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } else {
        api.sendMessage(`❌ |إجابة خاطئة. الإجابة الصحيحة كانت : ${reply.answer}`, event.threadID, event.messageID);
        // تعيين ردود الفعل
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      // إزالة الرد المسجل بعد الاستخدام
      global.client.handler.reply.delete(reply.messageID);
    }
  }
};
