import fs from "fs";
import path from "path";
import axios from "axios";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "تفكيك",
    author: "kaguya project",
    role: "member",
    description: "تفكيك الكلمات والفوز بالنقاط",
    execute: async function ({ api, event, Economy }) {
        try {
            const questions = [
                  { question: "بيت", answer: "ب ي ت" },
  { question: "رجل", "answer": "ر ج ل" },
  { question: "امرأة", answer: "ا م ر أ ة" },
  { question: "ولد", answer: "و ل د" },
  { question: "فتاة", answer: "ف ت ا ة" },
  { question: "ماء", answer: "م ا ء" },
  { question: "نار", answer: "ن ا ر" },
  { question: "شمس", answer: "ش م س" },
  { question: "قمر", answer: "ق م ر" },
  { question: "ليل", answer: "ل ي ل" },
  { question: "نهار", answer: "ن ه ا ر" },
  { question: "جبل", answer: "ج ب ل" },
  { question: "سهل", answer: "س ه ل" },
  {question: "شجرة", answer: "ش ج ر ة" },
  { question: "زهرة", answer: "ز ه ر ة" },
  { question: "طير", answer: "ط ي ر" },
  { question: "أسد", answer: "أ س د" },
  { question: "ذئب", answer: "ذ ئ ب" },
  { question: "جمل", answer: "ج م ل" },
  { question: "بقر", answer: "ب ق ر" },
  { question: "غنم", answer: "غ ن م" },
  { question: "كتاب", answer: "ك ت ا ب" },
  { question: "قلم", answer: "ق ل م" },
  { question: "ورقة", answer: "و ر ق ة" },
  { question: "منزل", answer: "م ن ز ل" },
  { question: "مدرسة", answer: "م د ر س ة" },
  { question: "مستشفى", answer: "م س ت ش ف ى" },
  { question: "متجر", answer: "م ت ج ر" },
  { question: "مطعم", answer: "م ط ع م" },
  { question: "سيارة", answer: "س ي أ ر ة" },
  { question: "دراجة", answer: "د ر ا ج ة" },
  { question: "طائرة", answer: "ط ا ئ ر ة" },
  { question: "قطار", answer: "ق ط ا ر" },
  { question: "سفينة", answer: "س ف ي ن ة" },
                { question: "كلب", answer: "ك ل ب" },
                { question: "غابة", answer: "غ ا ب ة" },{ question: "عملاق", answer: "ع م ل ا ق" },{ question: "جزيرة", answer: "ج ز ي ر ة" },{ question: "خيال", answer: "خ ي ا ل" },{ question: "فأسقيناكموه", answer: "ف أ س ق ي ن ا ك م و ه" },{ question: "ملاك", answer: "م ل ا ك" },{ question: "علم", answer: "ع ل م" },{ question: "طقس", answer: "ط ق س" },{ question: "بخار", answer: "ب خ ا ر" },{ question: "الحوت الازرق", answer: "ا ل ح و ت ا ل ا ز ر ق" },


                // الأسئلة الأخرى هنا
            ];

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const correctAnswer = randomQuestion.answer;

            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t🌟 | قم بتفكيك الكلمات التالية :\n\t\t\t\t[${randomQuestion.question}]\n▱▱▱▱▱▱▱▱▱▱▱▱▱`;

            api.sendMessage(message, event.threadID, async (error, info) => {
                if (!error) {
                    try {
                        await Economy.getBalance(event.senderID); // التحقق من وجود معلومات الاقتصاد للمستخدم
                        client.handler.reply.set(info.messageID, {
                            author: event.senderID,
                            type: "reply", // تحديد نوع الرد
                            name: "تفكيك",
                            correctAnswer: correctAnswer, // إضافة الإجابة الصحيحة
                            unsend: true
                        });
                    } catch (e) {
                        console.error("خطأ في التحقق من معلومات الاقتصاد للمستخدم:", e);
                    }
                } else {
                    console.error("خطأ في إرسال الرسالة:", error);
                }
            });
        } catch (error) {
            console.error("خطأ في تنفيذ الأمر:", error);
        }
    },
    onReply: async function ({ api, event, reply, Economy }) {
        try {
            if (reply && reply.type === "reply" && reply.name === "تفكيك") {
                const userAnswer = event.body.trim().toLowerCase();
                const correctAnswer = reply.correctAnswer && reply.correctAnswer.toLowerCase();

                if (correctAnswer) {
                    const userInfo = await api.getUserInfo(event.senderID);
                    const userName = userInfo ? userInfo[event.senderID].name : "المستخدم";

                    if (userAnswer === correctAnswer) {
                        const pointsData = JSON.parse(fs.readFileSync(userDataFile, "utf8"));
                        const userPoints = pointsData[event.senderID] || { name: userName, points: 0 };
                        userPoints.points += 50;
                        pointsData[event.senderID] = userPoints;
                        fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                        api.sendMessage(`✅ | تهانينا يا ${userName} 🥳 إجابتك صحيحة، وحصلت بذلك على 50 نقطة`, event.threadID);

                        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                        api.unsendMessage(reply.messageID);
                    } else {
                        api.sendMessage(`❌ | آسفة إجابتك خاطئة`, event.threadID);

api.setMessageReaction("❌", event.messageID, (err) => {}, true);
                        
                    }
                } else {
                    console.error("الإجابة الصحيحة غير معروفة");
                }
            } else {
                console.error("رد غير معروف");
            }
        } catch (error) {
            console.error("حدث خطأ أثناء معالجة الرد:", error);
        }
    }
};