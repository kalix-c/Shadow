import axios from "axios";
import fs from "fs";
import path from "path";

const videoLinks = {
    1: { name: "لوفي", links: ["https://i.imgur.com/RBuA0TC.mp4", "https://i.imgur.com/xxhG9xs.mp4",                             "https://i.imgur.com/HEpZ7PF.mp4",
"https://i.imgur.com/1a7aIpe.mp4",                              "https://i.imgur.com/0uI73Dh.mp4",
"https://i.imgur.com/omH37v7.mp4",                              "https://i.imgur.com/MwXNhQX.mp4",                              "https://i.imgur.com/MOGOtB4.mp4",
"https://i.imgur.com/fw9YIaM.mp4",
"https://i.imgur.com/LJ7w3Nc.mp4"
  ] },
    2: { name: "زورو", links: ["https://i.imgur.com/XfJsZVX.mp4", "https://i.imgur.com/ZSseQ6d.mp4",
"https://i.imgur.com/dbDRoNe.mp4",
"https://i.imgur.com/ftYYxed.mp4",                              "https://i.imgur.com/nh8MhRy.mp4",
"https://i.imgur.com/brzpnbE.mp4",
] },
    3: { name: "نامي", links: ["https://i.imgur.com/vbQR4gu.mp4", 
"https://i.imgur.com/Na93qR2.mp4",
"https://i.imgur.com/WNYM8GZ.mp4",                             "",
"https://i.imgur.com/0DQ5QRn.mp4",                              ] },
    4: { name: "اوسوب", links: ["https://i.imgur.com/JXDlujA.mp4", "https://i.imgur.com/sjgd5vn.mp4",                               "https://i.imgur.com/BAdiIch.mp4",
"https://i.imgur.com/z22hodS.mp4",                              "https://i.imgur.com/wc9TfG8.mp4",
] },
    5: { name: "سانجي", links: ["https://i.imgur.com/bSYgTE0.mp4", "https://i.imgur.com/XjYvI0C.mp4",
"https://i.imgur.com/EhO0Vsk.mp4",                              "https://i.imgur.com/wG6DLCR.mp4",
"https://i.imgur.com/WicGB6C.mp4",
"https://i.imgur.com/6GUyW37.mp4",  ] },
    6: { name: "شوبر", links: ["https://i.imgur.com/pj7eV31.mp4", "https://i.imgur.com/J3DOinw.mp4",
"https://i.imgur.com/wJz7oDl.mp4",
"https://i.imgur.com/XIytSrU.mp4",
"https://i.imgur.com/NV7a3O4.mp4",] },
    7: { name: "نيكو_روبين", links: ["https://i.imgur.com/HemRKi3.mp4", "https://i.imgur.com/QANW0BX.mp4",
"https://i.imgur.com/e9zAQ1r.mp4",
"https://i.imgur.com/WCiqGdy.mp4",
"https://i.imgur.com/GGZalUl.mp4",] },
    8: { name: "فرانكي", links: ["https://i.imgur.com/KEvlnra.mp4", "https://example.com/franky2.mp4",
"https://i.imgur.com/piYCToA.mp4",
"https://i.imgur.com/Im1sB3P.mp4",
"https://i.imgur.com/HLIEqos.mp4",] },
    9: { name: "سولكينغ_بروك", links: ["https://i.imgur.com/4dzxExX.mp4", "https://i.imgur.com/2JJLvgA.mp4",
"https://i.imgur.com/7FSNprk.mp4",
"https://i.imgur.com/wC8qeLt.mp4",] },
    10: { name: "جينبي", links: ["https://i.imgur.com/kHaTYx8.mp4", "https://i.imgur.com/xZKnLW3.mp4"] },
    11: { name: "ڤيڤي", links: ["https://i.imgur.com/XIUeR0A.mp4", "https://i.imgur.com/kB4MXSj.mp4"] },
    12: { name: "لاو", links: ["https://i.imgur.com/VYkefpc.mp4", "https://i.imgur.com/wT1PcHV.mp4"] },
  13: { name: "أخرى", links: ["https://i.imgur.com/lzEP3YN.mp4", "https://i.imgur.com/gAoafdy.mp4",  "https://i.imgur.com/IllBG03.mp4",
"",  "https://i.imgur.com/3BsPYWl.mp4",
  "https://i.imgur.com/35LMUHJ.mp4",
"https://i.imgur.com/FGN6wF2.mp4",
"https://i.imgur.com/8ILVqDz.mp4",] }
};

async function sendCharacterList({ api, event, Economy }) {
    
const userMoney = (await Economy.getBalance(event.senderID)).data;
    
      const cost = 1000;
      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار من اجل الحصول على eyecatcher لشخصية لكل واحدة`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);
    
    let message = "✿━━━━━━━━━━━━━━━━✿\nقم بالرد برقم الشخصية من اجل الحصول على eyecatcher الخاصة بها:\n✿━━━━━━━━━━━━━━━━✿";
    for (const [key, value] of Object.entries(videoLinks)) {
        message += `┣${key} ☛ ━━⦿〘${value.name}〙\n`;
    }

    const sentMessage = await api.sendMessage(message, event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "ونبيس",
            unsend: true,
        });
    });
}

async function sendVideoClip({ api, event, reply }) {
    const characterIndex = parseInt(event.body);

    if (!videoLinks[characterIndex]) {
        return api.sendMessage("رقم غير صالح. يرجى المحاولة مرة أخرى ❗", event.threadID);
    }

    const { name, links } = videoLinks[characterIndex];
    const randomIndex = Math.floor(Math.random() * links.length);
    const randomVideo = links[randomIndex];
    const tempVideoPath = path.join(process.cwd(), "temp", `${name}.mp4`);
    const response = await axios.get(randomVideo, { responseType: "stream" });
    const writeStream = fs.createWriteStream(tempVideoPath);
    response.data.pipe(writeStream);

    writeStream.on("finish", async () => {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        await api.sendMessage({
            body: `࿇ ══━━━✥◈✥━━━══ ࿇\nإليك ال eyecatcher الخاصة بشخصية ${name}\n࿇ ══━━━✥◈✥━━━══ ࿇`,
            attachment: fs.createReadStream(tempVideoPath),
        }, event.threadID);

        fs.unlinkSync(tempVideoPath); // Delete the temporary file after sending
    });

    writeStream.on("error", (error) => {
        console.error("Error downloading video:", error);
        api.sendMessage("حدث خطأ أثناء تحميل المقطع الفيديو.", event.threadID);
    });
}

export default {
    name: "ونبيس",
    author: "Kaguya Project",
    role: "member",
    description: "مقطع فيديو صغير لكل شخصية من شخصيات ون بيس",
    execute: sendCharacterList,
    onReply: async ({ api, event, reply }) => {
        if (reply.type === "pick" && reply.name === "ونبيس" && reply.author === event.senderID) {
            await sendVideoClip({ api, event, reply });
        }
    }
};
