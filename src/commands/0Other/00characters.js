import fs from "fs";
import axios from "axios";
import path from "path";

const tempImageFilePath = process.cwd() + "/cache/tempImage.jpg";
const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "شخصيات",
    author: "حسين يعقوبي",
    role: "member",
    description: "احزر اسم شخصية الأنمي من الصورة",
    execute: async function ({ api, event, Economy }) {
        try {
            const characters = [
    
                {
                  name: "نوبي",
                  image: "https://i.imgur.com/P3xPruS.jpeg"
                },
                {
                  name: "كورومي",
                  image: "https://i.imgur.com/yrEx6fs.jpg"
                },
                {
                  name: "إلينا",
                  image: "https://i.imgur.com/cAFukZB.jpg"
                },
                {
                  name: "ليفاي",
                  image: "https://i.imgur.com/xzDQSD2.jpg"
                },
                {
                  name: "مايكي",
                  image: "https://i.pinimg.com/236x/eb/a1/c6/eba1c6ed1611c3332655649ef405490a.jpg"
                },
                {
                  name: "كاكاشي",
                  image: "https://i.pinimg.com/236x/34/81/ba/3481ba915d12d27c1b2a094cb3369b4c.jpg"
                },
                {
                  name: "هانكوك",
                  image: "https://i.pinimg.com/236x/b6/0e/36/b60e36d13d8c11731c85b73e89f63189.jpg"
                },
                {
                  name: "زيرو",
                  image: "https://i.pinimg.com/236x/bd/9d/5a/bd9d5a5040e872d4ec9e9607561e22da.jpg"
                },
                {
                  name: "تودوروكي",
                  image: "https://i.pinimg.com/474x/ab/3f/5e/ab3f5ec03eb6b18d2812f8c13c62bb92.jpg"
                },
                {
                  name: "جوجو",
                  image: "https://i.pinimg.com/236x/26/6e/8d/266e8d8e9ea0a9d474a8316b9ed54207.jpg"
                },
                {
                  name: "سيستا",
                  image: "https://i.pinimg.com/236x/7f/38/6c/7f386c4afed64d0055205452091a313e.jpg"
                },
                {
                  name: "نيزكو",
                  image: "https://i.pinimg.com/236x/96/88/1e/96881ef27cbfce1071ff135b5a7e1fc7.jpg"
                },
                {
                  name: "كيلوا",
                  image: "https://i.pinimg.com/236x/8a/c8/f9/8ac8f98dd946fefdae4e66020073e5ee.jpg"
                },
                {
                  name: "كاكاروتو",
                  image: "https://i.imgur.com/qnZFWSw.jpg"
                },
                {
                  name: "روكيا",
                  image: "https://i.imgur.com/HhJ1v0s.jpg"
                },
                {
                  name: "ايتشيغو",
                  image: "https://i.imgur.com/MP30yUR.jpg"
                },
                {
                  name: "ايس",
                  image: "https://i.imgur.com/Eb3mfy1.jpg"
                },
                {
                  name: "هيناتا",
                  image: "https://i.imgur.com/koAzMr9.jpg"
                },
                {
                  name: "ريم",
                  image: "https://i.imgur.com/1MpxOkq.jpg"
                },
                {
                  name: "ايميليا",
                  image: "https://i.imgur.com/r5LBZq1.jpg"
                },
                {
                  name: "شيكا",
                  image: "https://i.imgur.com/TAdtk1Z.jpg"
                },
                {
                  name: "نيكوروبين",
                  image: "https://i.imgur.com/J0BFr1J.jpg"
                },
                {
                  name: "تانجيرو",
                  image: "https://i.imgur.com/hmnNKJA.jpg"
                },
                {
                  name: "اوسوب",
                  image: "https://i.imgur.com/LSopOn0.jpg"
                },
                {
                  name: "زورو",
                  image: "https://i.imgur.com/0VHWg66.jpg"
                },
                {
                  name: "نامي",
                  image: "https://i.imgur.com/UB010MB.jpg"
                },
                {
                  name: "كيرا",
                  image: "https://i.imgur.com/UGMY3dy.jpg"
                },
                {
                  name: "ايرين",
                  image: "https://i.imgur.com/btjxDoY.jpg"
                },
                {
                  name: "ناروتو",
                  image: "https://i.imgur.com/LZ9h2Cj.jpg"
                },
                {
                  name: "غارا",
                  image: "https://i.imgur.com/RVTfRG9.jpg"
                },
                {
                  name: "هيسوكا",
                  image: "https://i.imgur.com/6Mj5GcO.jpg"
                },
                {
                  name: "ميكاسا",
                  image: "https://i.imgur.com/Tcxjf0z.jpg"
                },
                {
                  name: "ساسوكي",
                  image: "https://i.imgur.com/KQuPNi2.jpg"
                },
                      {
                        name: "سايتاما",
                        image: "https://i.imgur.com/RGZqW26.jpg"
                      },
                      {
                        name: "ايتاشي",
                        image: "https://i.imgur.com/x0cSY3L.jpg"
                      },
                      {
                        name: "ميهوك",
                        image: "https://i.imgur.com/lKCYgxP.jpg"
                      },
                      {
                        name: "دكتور ستون",
                        image: "https://i.imgur.com/Kr2VJGm.jpg"
                      },
                      {
                        name: "جوجو",
                        image: "https://i.imgur.com/3WNomhT.jpg"
                      },
                      {
                        name: "لوفي",
                        image: "https://i.imgur.com/58Px7WU.jpg"
                      },
                      {
                        name: "جون",
                        image: "https://i.imgur.com/1jUoWRm.jpg"
                      },
                      {
                        name: "كانيكي",
                        image: "https://i.imgur.com/TERlJVX.jpg"
                      },
                      {
                        name: "نامي",
                        image: "https://i.imgur.com/VhAmZez.jpg"
                      },
                      {
                        name: "نوي",
                        image: "https://i.imgur.com/fkK7mQL.jpg"
                      },
                      {
                        name: "جان",
                        image: "https://i.imgur.com/44jiG0i.jpg"
                      },
                      {
                        name: "سانجي",
                        image: "https://i.imgur.com/e8Xmt02.jpg"
                      },
                      {
                        name: "زورو",
                        image: "https://i.imgur.com/38gyw6O.jpg"
                      },
                      {
                        name: "لوفي",
                        image: "https://i.imgur.com/g7aVAkk.jpg"
                      },
                      {
                        name: "غوكو",
                        image: "https://i.imgur.com/YE1MhsM.png"
                      },
                      {
                        name: "فايوليت",
                        image: "https://i.imgur.com/1ea164u.jpg"
                      },
                      {
                        name: "يوريو",
                        image: "https://i.imgur.com/PEMgwWQ.jpg"
                      },
                      {
                        name: "اينوي",
                        image: "https://i.imgur.com/zyORTM0.jpg"
                      },
                      {
                        name: "بولما",
                        image: "https://i.imgur.com/zXSVdg4.jpg"
                      },
                      {
                        name: "كيلوا",
                        image: "https://i.imgur.com/h8u7bMz.jpg"
                      },
                      {
                        name: "كورابيكا",
                        image: "https://i.imgur.com/aG99hRH.jpg"
                      },
                      {
                        name: "غون",
                        image: "https://i.imgur.com/7zh5MmX.png"
                      },
                      {
                        name: "هيسوكا",
                        image: "https://i.imgur.com/MLdV9Bm.png"
                      },
                      {
                        name: "ايتشغو",
                        image: "https://i.imgur.com/9jnxnCZ.jpg"
                      },
                      {
                        name: "ميليوداس",
                        image: "https://i.imgur.com/MV89DRK.jpg"
                      },
                      {
                        name: "ناروتو",
                        image: "https://i.imgur.com/AiMmEHw.jpg"
                      },
                      {
                        name: "روكيا",
                        image: "https://i.imgur.com/5I3wCTX.jpg"
                      },
                      {
                        name: "ايرين",
                        image: "https://i.imgur.com/l7L8dLW.jpg"
                      },
                      {
                        name: "غوجو",
                        image: "https://i.imgur.com/XWkWWQR.jpg"
                      },
                      {
                        name: "ساسكي",
                        image: "https://i.imgur.com/U6wmApa.jpg"
                      },
                      {
                        name: "مادارا",
                        image: "https://i.imgur.com/AO1yjIi.jpg"
                      },
                      {
                        name: "مزة",
                        image: "https://i.imgur.com/iKiayhM.jpg"
                      },
                      {
                        name: "مزة",
                        image: "https://i.imgur.com/v6T7uz8.jpg"
                      },
                      {
                        name: "جين",
                        image: "https://i.imgur.com/tCcWxJ2.jpg"
                      },
                      {
                        name: "مليم",
                        image: "https://i.imgur.com/0sMnaAW.jpg"
                      },
                      {
                        name: "هيوكا",
                        image: "https://i.imgur.com/6Yi2zGQ.jpg"
                      },
                      {
                        name: "سوكونا",
                        image: "https://i.imgur.com/rdwuxcU.jpg"
                      },
                      {
                        name: "ميكاسا",
                        image: "https://i.imgur.com/WTj090m.jpg"
                      },
                      {
                        name: "غوهان",
                        image: "https://i.imgur.com/mui3ZOv.jpg"
                      },
                      {
                        name: "مستر روبن سون",
                        image: "https://i.imgur.com/KCBaa9H.jpg"},
                
                {
                  name: "كلارنس",
                  image: "https://i.imgur.com/eoUKUx0.jpg"
                },
                {
                  name: "سومو",
                  image: "https://i.imgur.com/SYef2GQ.jpg"
                },
                {
                  name: "جيف",
                  image: "https://i.imgur.com/Dqkt7e7.jpg"
                },
                {
                  name: "نوبي",
                  image: "https://i.imgur.com/P3xPruS.jpeg"
                },
                {
                  name: "ستيفن البطل",
                  image: "https://i.imgur.com/AatdzEe.png"
                },
                {
                  name: "غامبول",
                  image: "https://i.imgur.com/YuJS6Le.jpg"
                },
                {
                  name: "داروين",
                  image: "https://i.imgur.com/Us17UId.jpg"
                },
                {
                  name: "ارثر",
                  image: "https://i.imgur.com/nqkZL1T.jpg"
                },
                {
                  name: "رونالدو",
                  image: "https://i.imgur.com/eg8GkDh.jpg"
                },
                {
                  name: "كلارنس",
                  image: "https://i.imgur.com/eoUKUx0.jpg"
                },
                {
                  name: "سومو",
                  image: "https://i.imgur.com/SYef2GQ.jpg"
                },
                {
                  name: "جيف",
                  image: "https://i.imgur.com/Dqkt7e7.jpg"
                },
                {
                  name: "نوبي",
                  image: "https://i.imgur.com/P3xPruS.jpeg"
                },
                {
                  name: "ستيفن البطل",
                  image: "https://i.imgur.com/AatdzEe.png"
                },
                {
                  name: "غامبول",
                  image: "https://i.imgur.com/YuJS6Le.jpg"
                },
                {
                  name: "داروين",
                  image: "https://i.imgur.com/Us17UId.jpg"
                },
                {
                  name: "ارثر",
                  image: "https://i.imgur.com/nqkZL1T.jpg"
                },
                {
                  name: "رونالدو",
                  image: "https://i.imgur.com/eg8GkDh.jpg"
                }
                // Add more character-image pairs here
                // Add more character-image pairs here
            ];

            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

            const imageResponse = await axios.get(randomCharacter.image, { responseType: "arraybuffer" });
            fs.writeFileSync(tempImageFilePath, Buffer.from(imageResponse.data, "binary"));

            const attachment = [fs.createReadStream(tempImageFilePath)];
            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t\tما هو اسم هذه الشخصية ؟\n▱▱▱▱▱▱▱▱▱▱▱▱▱`;

            api.sendMessage({ body: message, attachment }, event.threadID, async (error, info) => {
                if (!error) {
                    try {
                        await Economy.getBalance(event.senderID); // Check user's economy info
                        client.handler.reply.set(info.messageID, {
                            author: event.senderID,
                            type: "reply",
                            name: "شخصيات",
                            correctName: randomCharacter.name, // Add the correct name
                            unsend: true
                        });
                    } catch (e) {
                        console.error("Error checking user's economy info:", e);
                    }
                } else {
                    console.error("Error sending message:", error);
                }
            });
        } catch (error) {
            console.error("Error executing the game:", error);
            api.sendMessage(`An error occurred while executing the game. Please try again.`, event.threadID);
        }
    },
    onReply: async function ({ api, event, reply, Economy }) {
        if (reply && reply.type === "reply" && reply.name === "شخصيات") {
            const userGuess = event.body.trim();
            const correctName = reply.correctName;

            if (userGuess === correctName) {
                try {
                    const userInfo = await api.getUserInfo(event.senderID);
                    const userName = userInfo ? userInfo[event.senderID].name : 'الفائز';

                    const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                    const userPoints = pointsData[event.senderID] || { name: userName, points: 0 };
                    userPoints.name = userName; // تأكد من تسجيل الاسم
                    userPoints.points += 50;
                    pointsData[event.senderID] = userPoints;
                    fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                    api.sendMessage(`✅ | تهانينا يا ${userPoints.name}! 🥳لقد قمت بتخمين إسم الشخصية بشكل صحيح. و حصلت بذالك على 50 نقطة.`,
                        event.threadID);

                    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                    api.unsendMessage(reply.messageID);
                } catch (e) {
                    console.error("Error handling winning action:", e);
                }
            } else {
                api.sendMessage(`❌ | آسفة 🥺 يا ${userPoints.name} ، لكنك أخطأت في معرفة إسم الشخصية . حاول مرة أخرى.`, event.threadID);

                api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            }
        }
        fs.unlinkSync(tempImageFilePath);
    }
};
