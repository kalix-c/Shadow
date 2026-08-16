import fs from 'fs';
import path from 'path';

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
   name: "ترتيب",
   author: "Kaguya Project",
   role: "member",
   description: "تحدي ترتيب الكلمات",
   execute: async function ({ api, event }) {
      try {
         const words = JSON.parse(fs.readFileSync('words.json', 'utf8'));
         const randomWord = words[Math.floor(Math.random() * words.length)];

         const shuffledWord = shuffleWord(randomWord);
         const correctAnswer = randomWord;

         const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t🌟 | رتب هذه الكلمات التالية : \n\t\t\t\t[ ${shuffledWord}]`;

         api.sendMessage(message, event.threadID, (err, info) => {
            if (err) {
               console.error('Error sending message:', err);
               return;
            }
            client.handler.reply.set(info.messageID, {
               author: event.senderID,
               type: "reply",
               name: "ترتيب",
               correctAnswer: correctAnswer,
               unsend: true
            });
         });
      } catch (error) {
         console.error('Error:', error);
         api.sendMessage('❌ | حدث خطأ أثناء إرسال التحدي. الرجاء المحاولة لاحقًا.', event.threadID, event.messageID);
      }
   },

   onReply: async function ({ api, event, reply }) {
      try {
         if (reply && reply.type === "reply" && reply.name === "ترتيب") {
            const userAnswer = event.body.trim().toLowerCase();
            const correctAnswer = reply.correctAnswer.toLowerCase();

            if (formatText(userAnswer) === formatText(correctAnswer)) {
               const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
               const userName = (await api.getUserInfo(event.senderID))[event.senderID].name;
               const userPoints = pointsData[event.senderID] || { name: userName, points: 0 };
               userPoints.points += 50;
               pointsData[event.senderID] = userPoints;
               fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

               api.setMessageReaction("✅", event.messageID, (err) => {}, true);
               api.sendMessage(`✅ | تهانينا يا ${userName} 🥳 تلك كانت ترتيب الكلمة الصحيحة ، وحصلت بذلك على 50 نقطة`, event.threadID, event.messageID);
            } else {
               api.setMessageReaction("❌", event.messageID, (err) => {}, true);
               api.sendMessage("❌ | آسفة ، هذا ليس ترتيب الكلمة الصحيح", event.threadID, event.messageID);
            }
         }
      } catch (error) {
         console.error('Error:', error);
         api.sendMessage('❌ | حدث خطأ أثناء التحقق من الإجابة. الرجاء المحاولة لاحقًا.', event.threadID, event.messageID);
      }
   }
};

function shuffleWord(word) {
   const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
   if (shuffled === word) {
      return shuffleWord(word);
   }
   return shuffled;
}

function formatText(text) {
   return text.normalize("NFD").toLowerCase();
}
