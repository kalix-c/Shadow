import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { Readable } from 'stream';

const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "شارات",
    author: "حسين يعقوبي",
    role: "member",
    description: "احزر اسماء شارات سبيستون",
    execute: async function ({ api, event, Economy }) {
        try {
            const musics = [
                { music_name: "عهد الأصدقاء", music_url: "https://files.catbox.moe/4oii5p.mp3" },
                { music_name: "حكايات ما احلاها", music_url: "https://files.catbox.moe/bu3wt7.mp3" },
                { music_name: "سابق لاحق", music_url: "https://files.catbox.moe/s4m3yw.mp3" },
                { music_name: "هزيم الرعد", music_url: "https://files.catbox.moe/8e70rm.mp3" },
                { music_name: "السيف القاطع", music_url: "https://files.catbox.moe/pd79s7.mp3" },
                { music_name: "دراغون بول", music_url: "https://files.catbox.moe/nu48kh.mp3" },
                { music_name: "أنا وأخي", music_url: "https://files.catbox.moe/h38byf.mp3" },
                { music_name: "أنا وأختي", music_url: "https://files.catbox.moe/c53bt2.mp3" },
                { music_name: "أنا و أخواتي", music_url: "https://files.catbox.moe/ux9ejs.mp3" },
                { music_name: "الحديقة السرية", music_url: "https://files.catbox.moe/m4aahb.mp3" },
                { music_name: "مغامرات نغم", music_url: "https://files.catbox.moe/vkt1mt.mp3" },
                { music_name: "ايروكا", music_url: "https://files.catbox.moe/arjpzn.mp3" },
                { music_name: "بائعة الكبريت", music_url: "https://files.catbox.moe/sd0osk.mp3" },
                { music_name: "ريمي", music_url: "https://files.catbox.moe/66fzmf.mp3" },
                { music_name: "الطاقة الزرقاء", music_url: "https://files.catbox.moe/z8r91x.mp3" },
                { music_name: "سالي", music_url: "https://files.catbox.moe/78gchs.mp3" },
                { music_name: "سلام دانك", music_url: "https://files.catbox.moe/3dptyb.mp3" },
                { music_name: "بابار الفيل", music_url: "https://files.catbox.moe/xf1a6v.mp3" },
                { music_name: "كونان", music_url: "https://files.catbox.moe/6203xz.mp3" },
                { music_name: "باتمان", music_url: "https://files.catbox.moe/skju49.mp3" },
                { music_name: "الرمية الملتهبة", music_url: "https://files.catbox.moe/psooeg.mp3" },
                { music_name: "داي الشجاع", music_url: "https://files.catbox.moe/29ryzq.mp3" },
                { music_name: "بليزن تينز", music_url: "https://files.catbox.moe/ivz8et.mp3" },
                { music_name: "صانع السلام", music_url: "https://files.catbox.moe/97gryw.mp3" },
                { music_name: "ينبوع الأحلام", music_url: "https://files.catbox.moe/j15tmz.mp3" },
                { music_name: "ونغ فو", music_url: "https://files.catbox.moe/foixwm.mp3" },
                { music_name: "ون بيس", music_url: "https://files.catbox.moe/04au0h.mp3" },
                { music_name: "بي بليد", music_url: "https://files.catbox.moe/m98sn9.mp3" },
                { music_name: "ناروتو", music_url: "https://files.catbox.moe/e4t0ot.mp3" },
                { music_name: "ساكورا", music_url: "https://files.catbox.moe/s82saf.mp3" },
                { music_name: "القناص", music_url: "https://files.catbox.moe/8gcssd.mp3" },
                { music_name: "دورايمون", music_url: "https://files.catbox.moe/zurj27.mp3" },
                { music_name: "السراب", music_url: "https://files.catbox.moe/6ymdq4.mp3" },
                { music_name: "سيف النار", music_url: "https://files.catbox.moe/j3knwp.mp3" },
                { music_name: "غرين لاند", music_url: "https://files.catbox.moe/bxt0su.mp3" }
            ];

            const randomMusic = musics[Math.floor(Math.random() * musics.length)];
            const tempAudioPath = path.join(process.cwd(), "temp", "music.mp3");
            const response = await axios.get(randomMusic.music_url, { responseType: "stream" });
            const writeStream = fs.createWriteStream(tempAudioPath);
            response.data.pipe(writeStream);

            writeStream.on("finish", async () => {
                // Send the message with the attachment as a stream
                const readableStream = fs.createReadStream(tempAudioPath);
                const message = `●❯───────────────❮●\n 🎵   | إستمتع بالإستماع للشارة 🥰\n 🧿 | وإحزر إسم الشارة تعود إلى أي مسلسل ؟\n●❯───────────────❮●`;
                api.sendMessage({ body: message, attachment: readableStream }, event.threadID, async (error, info) => {
                    if (!error) {
                        try {
                            await Economy.getBalance(event.senderID); // Check user's economy info
                            client.handler.reply.set(info.messageID, {
                                author: event.senderID,
                                type: "reply",
                                name: "شارات",
                                correctMusicName: randomMusic.music_name, // Add the correct music name
                                unsend: true
                            });
                        } catch (e) {
                            console.error("Error checking user's economy info:", e);
                        }
                    } else {
                        console.error("Error sending message:", error);
                    }
                });
            });
        } catch (error) {
            console.error("Error executing the game:", error);
            api.sendMessage(`حدث خطأ أثناء تنفيذ اللعبة. حاول مرة أخرى.`, event.threadID);
        }
    },
    onReply: async function ({ api, event, reply, Economy }) {
        if (reply && reply.type === "reply" && reply.name === "شارات") {
            const userGuess = event.body.trim();
            const correctMusicName = reply.correctMusicName;

            if (userGuess === correctMusicName) {
                try {
                    const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                    const userInfo = await api.getUserInfo(event.senderID);
                    const userName = userInfo ? userInfo[event.senderID].name : 'الفائز';

                    if (!pointsData[event.senderID]) {
                        pointsData[event.senderID] = { name: userName, points: 0 };
                    }

                    pointsData[event.senderID].points += 50; // Increase points
                    fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                    api.sendMessage(`✅ | تهانينا يا ${userName}! لقد حزرت اسم الشارة بشكل صحيح وحصلت على 50 نقطة.`, event.threadID);
                    api.unsendMessage(reply.messageID);
                    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                } catch (e) {
                    console.error("Error handling winning action:", e);
                }
            } else {
                api.sendMessage(`❌ | آسف، هذا ليس اسم الشارة الصحيح. حاول مرة أخرى.`, event.threadID);
                api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            }
        }
    }
};
