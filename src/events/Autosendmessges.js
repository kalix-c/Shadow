import fs from "node:fs";
import path from "node:path";
import { downloadToFile } from "../utils/http.js";
import assets from "../config/assets.js";

const shadowImages = [
  assets.imagePaths.banner,
  assets.imagePaths.avatar,
  assets.imagePaths.sticker,
].filter((filePath) => fs.existsSync(filePath));

// تنزيل صورة مؤقتة إلى مجلد التخزين مع مهلة وإعادة محاولة محدودة.
async function fetchAndSaveImage(imageURL, imageName) {
  if (!imageURL) return null;
  const cacheDirectory = path.join(process.cwd(), "cache");
  const imagePath = path.join(cacheDirectory, imageName);
  try {
    await fs.promises.mkdir(cacheDirectory, { recursive: true });
    return await downloadToFile(imageURL, imagePath, { timeout: 15_000, retries: 1 });
  } catch (error) {
    console.error("تعذر تنزيل صورة الرسالة التلقائية:", error.message);
    return null;
  }
}

export default {
  name: "autosendmessages",
  execute: async ({ api, event, Threads }) => {
    try {
      // Retrieve thread data using threadID
      const threadsData = await Threads.find(event.threadID);
      const threads = threadsData?.data?.data || {};

      // If no data found, create new thread
      if (!threads) {
        await Threads.create(event.threadID);
      }

      // If data is empty, stop execution
      if (!Object.keys(threads).length) return;

      // Send scheduled messages with images daily
      setInterval(() => {
        sendScheduledMessages(api, event.threadID);
      }, 86400000); // Repeat every 24 hours

    } catch (error) {
      console.error("Error handling thread update:", error);
    }
  },
};

// Function to send scheduled messages with images
async function sendScheduledMessages(api, threadID) {
  const messagesWithImages = [

    { delay: 3600000, text: `وليس كل ماصرفه الله عنك شرٌ لك لعلك أنت الخير الذي لا يستحقونه 💙💙.
𝑨𝒏𝒅 𝒏𝒐𝒕 𝒆𝒗𝒆𝒓𝒚𝒕𝒉𝒊𝒏𝒈 𝒕𝒉𝒂𝒕 𝑮𝒐𝒅 𝒔𝒑𝒆𝒏𝒕 𝒇𝒓𝒐𝒎 𝒚𝒐𝒖 𝒊𝒔 𝒆𝒗𝒊𝒍 𝒇𝒐𝒓 𝒚𝒐𝒖, 𝒑𝒆𝒓𝒉𝒂𝒑𝒔 𝒚𝒐𝒖 𝒂𝒓𝒆 𝒕𝒉𝒆 𝒈𝒐𝒐𝒅 𝒕𝒉𝒂𝒕 𝒕𝒉𝒆𝒚 𝒅𝒐 𝒏𝒐𝒕 𝒅𝒆𝒔𝒆𝒓𝒗𝒆.💙💙` ,
 imageURL: null, imageName: "image1.jpg" },
    { delay: 7200000, text: `لا شي يبقـــى للأبد حتى الشمس سـتگسر القانون يوماً وتشرق غرباً لتعلن النهاية🌷✨
𝑵𝑶𝑻𝑯𝑰𝑵𝑮 𝑹𝑬𝑴𝑨𝑰𝑵𝑺 𝑭𝑶𝑹𝑬𝑽𝑬𝑹, 𝑼𝑵𝑻𝑰𝑳 𝑻𝑯𝑬 𝑺𝑼𝑵 𝑾𝑰𝑳𝑳 𝑩𝑹𝑬𝑨𝑲 🌷✨`, imageURL: null, imageName: "image2.jpg" },
    { delay: 10800000, text: `-𝑫𝒐𝒏'𝒕 𝒕𝒓𝒖𝒔𝒕 𝒔𝒐𝒎𝒆𝒐𝒏𝒆 𝒋𝒖𝒔𝒕 𝒃𝒆𝒄𝒂𝒖𝒔𝒆 𝒚𝒐𝒖 𝒍𝒊𝒌𝒆 𝒕𝒂𝒍𝒌𝒊𝒏𝒈𝑾𝒊𝒕𝒉 𝒉𝒊𝒎, 𝒍𝒊𝒇𝒆 𝒉𝒂𝒔 𝒃𝒆𝒄𝒐𝒎𝒆 𝒂𝒔𝒑𝒆𝒄𝒕𝒔 𝒕𝒉𝒂𝒕 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒄𝒐𝒏𝒕𝒆𝒎𝒑𝒍𝒂𝒕𝒆 𝒘𝒆𝒍𝒍. 🦋✨
-لاتثق بشخص لمجرد اعجبك الحديث
معة فالحياة أصبحت مظاهر تاملوها جيدا .🦋✨` , imageURL: null, imageName: "image3.jpg" },
    { delay: 10800000, text: `"‏النظرات قادرة على اختصار حديث 
من سبعين ألف كلمة.🤎
“𝑳𝒐𝒐𝒌𝒔 𝒄𝒂𝒏 𝒔𝒉𝒐𝒓𝒕𝒆𝒏 𝒂 𝒄𝒐𝒏𝒗𝒆𝒓𝒔𝒂𝒕𝒊𝒐𝒏 
𝑺𝒆𝒗𝒆𝒏𝒕𝒚 𝒕𝒉𝒐𝒖𝒔𝒂𝒏𝒅 𝒘𝒐𝒓𝒅𝒔🤎` , imageURL: null, imageName: "image4.jpg" },
    { delay: 14400000, text: `𝑰 𝒈𝒂𝒗𝒆 𝒎𝒚 𝒇𝒆𝒆𝒍𝒊𝒏𝒈𝒔 𝒂𝒏𝒅 𝒆𝒏𝒆𝒓𝒈𝒚 𝒐𝒏𝒄𝒆, 𝒂𝒏𝒅 𝒉𝒆𝒓𝒆 𝑰 𝒇𝒆𝒍𝒍 𝒘𝒊𝒕𝒉 𝒎𝒚 𝒘𝒉𝒐𝒍𝒆 𝒘𝒆𝒊𝒈𝒉𝒕 𝒂𝒏𝒅 𝒄𝒐𝒖𝒍𝒅 𝒏𝒐𝒕 𝒈𝒆𝒕 𝒖𝒑. 🖤
لقد وهبتُ مشاعري و طاقتي مرةً واحدة وها أنا سَقطت بثقلي كله و لم أستطيع النهوض`, imageURL: null, imageName: "image5.jpg" },
    { delay: 18000000, text:  `لا يـهـمـني إن غادرنـي الـجـميـع ، فـمـنذ الـبـدايـة ارسـم مـسـتـقبلا لايـوجـد فيه احد..🤍🪐

𝑱𝒆 𝒎𝒆 𝒇𝒊𝒄𝒉𝒆 𝒒𝒖𝒆 𝒕𝒐𝒖𝒕 𝒍𝒆 𝒎𝒐𝒏𝒅𝒆 𝒎𝒆 𝒕𝒓𝒂𝒉𝒊𝒔𝒔𝒆, 𝒅𝒆𝒑𝒖𝒊𝒔 𝒍𝒆 𝒅é𝒃𝒖𝒕 𝒋𝒆 𝒅𝒆𝒔𝒔𝒊𝒏𝒆 𝒖𝒏 𝒂𝒗𝒆𝒏𝒊𝒓 𝒐ù 𝒊𝒍 𝒏'𝒚 𝒂 𝒑𝒆𝒓𝒔𝒐𝒏𝒏𝒆..🤍🪐💗🍯`, imageURL: null, imageName: "image5.jpg" },
{ delay: 21600000, text: `𝑯𝒐𝒘𝒆𝒗𝒆𝒓 𝒅𝒊𝒇𝒇𝒊𝒄𝒖𝒍𝒕 𝒍𝒊𝒇𝒆 𝒎𝒂𝒚 𝒔𝒆𝒆𝒎, 𝒕𝒉𝒆𝒓𝒆 𝒊𝒔 𝒂𝒍𝒘𝒂𝒚𝒔 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒅𝒐 𝒂𝒏𝒅 𝒔𝒖𝒄𝒄𝒆𝒆𝒅 𝒂𝒕🩵✨
‏مهما بدت الحياة صعبه، يوجد دائمًا شيءٌ يمكنك النجاح فيه.🩵✨`, imageURL: null, imageName: "image5.jpg" },
    { delay: 25200000, text: `𝘾𝙧𝙮𝙞𝙣𝙜 i𝙮s 𝙣𝙤𝙩 𝙖 𝙨𝙞𝙜𝙣 𝙤𝙛 𝙬𝙚𝙖𝙠𝙣𝙚𝙨𝙨. 𝙎𝙤𝙢𝙚𝙩𝙞𝙢𝙚𝙨 𝙖 𝙥𝙚𝙧𝙨𝙤𝙣 𝙘𝙧𝙞𝙚𝙨 𝙗𝙚𝙘𝙖𝙪𝙨𝙚 𝙝𝙚 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙨𝙩𝙧𝙤𝙣𝙜 𝙛𝙤𝙧 𝙖 𝙡𝙤𝙣𝙜 𝙩𝙞𝙢𝙚. 🖤🥀
ليس البكاء دليل على الضعف، أحيانًا يبكي الشخص لأنه كان قوي لفترة طويلة.🖤🥀`, imageURL: null, imageName: "image5.jpg" },
{ delay: 28800000, text:`‏"أعتقد أن بعض الناس قد قضوا الوقت معي لأنهم فقط كانوا وحيدين".🖤🥀
“𝙄 𝙩𝙝𝙞𝙣𝙠 𝙨𝙤𝙢𝙚 𝙥𝙚𝙤𝙥𝙡𝙚 𝙨𝙥𝙚𝙣𝙩 𝙩𝙞𝙢𝙚 𝙬𝙞𝙩𝙝 𝙢𝙚 𝙗𝙚𝙘𝙖𝙪𝙨𝙚 𝙩𝙝𝙚𝙮 𝙬𝙚𝙧𝙚 𝙟𝙪𝙨𝙩 𝙡𝙤𝙣𝙚𝙡𝙮.”🖤🥀`, imageURL: null, imageName: "image5.jpg" },
    { delay: 32400000, text:  `أنا ذلك الشخص الذي يرشد التائهين ولا يعرف كيف يغادر المتاهة.🤎🌪

𝒊 𝒂𝒎 𝒕𝒉𝒆 𝒑𝒆𝒓𝒔𝒐𝒏 𝒘𝒉𝒐 𝒈𝒖𝒊𝒅𝒆𝒔 𝒕𝒉𝒆 𝒘𝒂𝒏𝒅𝒆𝒓𝒊𝒏𝒈 𝒂𝒏𝒅 𝒅𝒐 𝒏𝒐𝒕 𝒌𝒏𝒐𝒘 𝒉𝒐𝒘 𝒕𝒐 𝒍𝒆𝒂𝒗𝒆 𝒕𝒉𝒆 𝒎𝒂𝒛𝒆.🤎🌪` , imageURL: null, imageName: "image5.jpg" },
{ delay: 36000000, text:`أن يَكون لك صَديق يَراك وكأنّك الخير في
هذهِ الأرض، شُعور لا يُمكنك أن تَضعه في
كلماتٍ مُناسِبة.💖"
𝙏𝙤 𝙝𝙖𝙫𝙚 𝙖 𝙛𝙧𝙞𝙚𝙣𝙙 𝙬𝙝𝙤 𝙨𝙚𝙚𝙨 𝙮𝙤𝙪 𝙖𝙨 𝙩𝙝𝙚 𝙗𝙚𝙨𝙩 𝙞𝙣 𝙮𝙤𝙪
𝙏𝙝𝙞𝙨 𝙚𝙖𝙧𝙩𝙝, 𝙖 𝙛𝙚𝙚𝙡𝙞𝙣𝙜 𝙮𝙤𝙪 𝙘𝙖𝙣'𝙩 𝙥𝙪𝙩 𝙞𝙣
𝙎𝙪𝙞𝙩𝙖𝙗𝙡𝙚 𝙬𝙤𝙧𝙙𝙨.💖` , imageURL: null, imageName: "image5.jpg" },
    { delay: 39600000, text: `-الغائبون بلا عذر كالحاضرين بلا فائدة ، كلاهما يشغل حيزاً ﻻ يستحقه.💨
- 𝑇ℎ𝑜𝑠𝑒 𝑤ℎ𝑜 𝑎𝑟𝑒 𝑎𝑏𝑠𝑒𝑛𝑡 𝑤𝑖𝑡ℎ𝑜𝑢𝑡 𝑒𝑥𝑐𝑢𝑠𝑒 𝑎𝑟𝑒 𝑙𝑖𝑘𝑒 𝑡ℎ𝑜𝑠𝑒 𝑤ℎ𝑜 𝑎𝑟𝑒 𝑝𝑟𝑒𝑠𝑒𝑛𝑡 𝑤𝑖𝑡ℎ𝑜𝑢𝑡 𝑏𝑒𝑛𝑒𝑓𝑖𝑡. 𝐵𝑜𝑡ℎ 𝑜𝑓 𝑡ℎ𝑒𝑚 𝑜𝑐𝑐𝑢𝑝𝑦 𝑠𝑝𝑎𝑐𝑒 𝑡ℎ𝑎𝑡 𝑡ℎ𝑒𝑦 𝑑𝑜 𝑛𝑜𝑡 𝑑𝑒𝑠𝑒𝑟𝑣𝑒.💨` , imageURL: null, imageName: "image5.jpg" },
    // Add more messages as necessary with their respective delays and images.
  ];

  for (const [index, message] of messagesWithImages.entries()) {
    setTimeout(async () => {
      const imagePath = shadowImages[index % shadowImages.length]
        || await fetchAndSaveImage(message.imageURL, message.imageName);
      if (imagePath) {
        api.sendMessage(
          {
            body: message.text,
            attachment: fs.createReadStream(imagePath),
          },
          threadID
        );
      }
    }, message.delay);
  }
}
