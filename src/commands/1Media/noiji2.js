import fs from "fs";
import path from "path";
import axios from "axios";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "ايموجي",
    author: "kaguya project",
    role: "member",
    description: "تخمين الإيموجي من خلال الوصف",
    execute: async function ({ api, event, Economy }) {
        try {
            const questions = [
                { question: "رجل شرطه", answer: "👮‍♂️" },
                { question: "امره شرطه", answer: "👮‍♀️" },
                { question: "حزين", answer: "😢" }, 
                { question: "الاكرهه شبه مبتسم", answer: "🙂" },
                { question: "يخرج لسانه", answer: "😛" }, 
                { question: "ليس له فم", answer: "😶" },
                { question: "يتثائب", answer: "🥱" },
                { question: "نائم", answer: "😴" },
                { question: "يخرج لسانه ومغمض عين واجده", answer: "😜" }, 
                { question: "يخرج لسانه وعيناه مغمضه", answer: "😝" },
                { question: "واو", answer: "😮" },
                { question: "مغلق فمه", answer: "🤐" },
                { question: "مقلوب راسه", answer: "🙃" }, 
                { question: "ينفجر رئسه", answer: "🤯" },
                { question: "يشعر بل حر", answer: "🥵" }, { question: "بالون", answer: "🎈" },
                { question: "عيون", answer: "👀" }, 
                { question: "ماعز", answer: "🐐" },
                { question: "الساعة الثانيه عشر", answer: "🕛" },
                { question: "كره قدم", answer: "⚽" }, { question: "سله تسوق", answer: "🛒" },
                { question: "دراجه هوائيه", answer: "🚲" },
                { question: "جدي", answer: "🐐" },
                { question: "ضفدع", answer: "🐸" },
                { question: "بوت", answer: "🤖" },
                { question: "قبلة", answer: "💋" },
                { question: "فتى يمسك رأسه بيديه", answer: "🙆" },
                { question: "نجمة براقة", answer: "🌟" },
                { question: "عينين تراقبان بصمت", answer: "👀" },
                { question: "النجدة!", answer: "🆘" },
                { question: "تابوت", answer: "⚰️" },
                { question: "وجه فضائي", answer: "👽" },
                { question: "مقلة ، عين ، زرقاء", answer: "🧿" },
                { question:"حاسوب", answer: "💻" },
                { question: "مشبك الورق", answer: "📎" },
                { question: "سيف الأزرق السحري البراق", answer: "🗡️" },
                { question: "جدار أحمر مبني من الطوب", answer: "🧱" },
                { question: "مغناطيس", answer: "🧲" },
                { question: "زهرة الساكورا", answer: "💮" },
                { question: "شبكة كرة القدم", answer: "🥅" },
                { question: "ماسة", answer: "💎" },
                { question: "أحمر الشفاه", answer: "💄" },
                { question: "ورق الحمام", answer: "🧻" },
                { question: "ميدالية المركز الأول", answer: "🥇" },
                // الأسئلة الأخرى هنا
            ];

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const correctAnswer = randomQuestion.answer;

            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t🌟 | أرسل الإيموجي الصحيح حسب الوصف التالي :\n${randomQuestion.question}`;

            api.sendMessage(message, event.threadID, async (error, info) => {
                if (!error) {
                    try {
                        await Economy.getBalance(event.senderID); // التحقق من وجود معلومات الاقتصاد للمستخدم
                        client.handler.reply.set(info.messageID, {
                            author: event.senderID,
                            type: "reply", // تحديد نوع الرد
                            name: "ايموجي",
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
            if (reply && reply.type === "reply" && reply.name === "ايموجي") {
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