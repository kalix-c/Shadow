import axios from 'axios';
import fs from 'fs';
import path from 'path';
import process from 'process';

export default {
  name: "قائمة",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "قائمة الأوامر",
  role: "member",
  aliases: ["menu"],
  execute: async ({ api, event, Users, Threads, Economy }) => {

    api.setMessageReaction("📜", event.messageID, () => {}, true);
    // تحديد روابط الصور والنص
    const imageURLs = [
      "https://tinyurl.com/yd2duczc",
      "https://i.imgur.com/MKbL8VF.jpeg",
      "https://i.imgur.com/QSwWGMQ.jpeg",
      "https://i.imgur.com/XmgDa3K.jpeg",
      "https://i.imgur.com/gFjHTY7.jpeg",
      "https://i.imgur.com/7GWFLkr.jpeg",
      "https://i.imgur.com/9PFF8jn.jpeg"
    ];

    const messageText =`\t\t\t\t\t\t\t༒☾قــــائـــــمـــــة الــــاوامـــــر☽༒ 
  
   ༺✿فـ⭐️ـئةّآلَألَعـ⭐️ـآبـ⭐️ـ✿༻

  ❁تفكيك  ❁رأس_أو_وجه  ❁شارات  ❁حجر_ورقة_مقص  ❁شخصيات ❁ايموجي ❁الاسرع ❁اكس_او ❁حقيقة&جرأة ❁فزورة ❁تخمين 

          ⓵
༺فــــئــــة الاقــــــتـــــصـــاد༻

❂عمل ❂هدية ❂نقاط ❂رصيدي ❂صرف ❂توب ❂كهف
          ⓶
༺فــــئــــة الـــــــخــــدمــــــات༻
  
 ✺إزالة_الخلفية  ✺بيانات ✺ايدي ✺تعالو  
 ✺مزج ✺ارت ✺تلوين ✺ترجمي ✺تطقيم ✺تطقيم2 ✺ذكريني ✺تحميل ✺غني ✺يوتيوب ✺رابط ✺رابط2 ✺رابط3  ✺رابط4 ✺أخبار_الأنمي ✺أوبستايت ✺فيسبوك ✺تحميل 
 ✺الطقس ✺اقتصاص ✺ضيفيني ✺ملصق ✺غني ✺صور ✺جوجل ✺قرآن ✺كنية ✺تيد ✺اوامر ✺عمري ✺ويكيبيديا ✺إيموجي ✺المعرف ✺دمج ✺زخرفة  ✺جودة  ✺تحويل ✺آيدي ✺معلوماتي ✺نصيحة ✺اطرديني ✺انضمام ✺مشغول ✺لوغو
           ⓷
༺✿فــــئــــة الـــــــذكـــــاء✿༻
   
♔تخيلي ♔تخيلي2 ♔ارسمي ♔ارسمي2 ♔شادو ♔ذكاء 
♔نيجي ♔تشابه ♔برومبت
           ⓸
༺✿فــــئــــة الـــــمــــتـــعـــة✿༻
  
❀رقص ❀افلام ❀كراش ❀شاذ ❀سيجما ❀أنمي2 ❀اقتباس ❀شخصيتي ❀مقطع_أنمي ❀إعجاب ❀زوجيني ❀نيزكو ❀اصفعي ❀آيفون ❀علمني ❀حضن ❀اعجاب ❀أزياء ❀قولي ❀ونبيس ❀قبر ❀فتيات ❀مرحاض ❀زواج ❀غموض ❀طلب ❀ماذا_لو ❀خلفيات ❀سبيدرمان ❀شنق ❀مطلوب ❀انميات ❀تحدي ❀شخصيتي_السينمائية ❀زوجة
❀ زوجيني2 ❀زوجيني3 ❀زوجيني4 ❀سيلفي ❀عناق2 ❀حيواني ❀قبلة ❀حيواني ❀ضرب 
༺✿فــــئــــة الـــــمــــطــــــور✿༻
  
♛قبول ♛طلبات ♛غادري ♛المطور ♛موافقة ♛المتجر ♛آدمن ♛رد_الآدمن ♛تجربة ♛ضبط_البادئة ♛كمند ♛بايو ♛المجموعة ♛تصفية ♛إشعار ♛اوبتايم ♛ڤيو ♛شرح ♛المستخدم ♛مشاركة ♛لاست
          ⓹
༺فــــئــــة الــــمــجــمـــوعــة༻
  
❆حماية_الإسم ❆حماية_الصورة ❆ضبط_إيموجي ❆ضبط_الصورة ❆ضبط_الإسم
          ⓺
༺✿أوٌآمــر إضــآفــيــةّ✿༻

 ☠مثير 

\t\t≪┈┈┈┈ ⋞ 〈 ⏣ 〉 ⋟ ┈┈┈┈≫
`;

    // تحديد مسار الصورة المؤقتة
    const imagePath = path.join(process.cwd(), "temp", "image.jpg");

    // اختيار رابط صورة عشوائي من القائمة
    const imageURL = imageURLs[Math.floor(Math.random() * imageURLs.length)];

    // تحميل الصورة
    try {
      const response = await axios({
        url: imageURL,
        responseType: 'stream',
      });

      // حفظ الصورة في المسار المحدد
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      // انتظار انتهاء الكتابة
      writer.on('finish', () => {
        // إرسال الرسالة مع الصورة
        api.sendMessage({
          body: messageText,
          attachment: fs.createReadStream(imagePath),
        }, event.threadID, () => {
          // حذف الصورة بعد إرسالها
          fs.unlinkSync(imagePath);
        }, event.messageID);
      });

      writer.on('error', (err) => {
        console.error("Error writing the image to disk: ", err);
        api.sendMessage("حدث خطأ أثناء حفظ الصورة.", event.threadID, event.messageID);
      });
    } catch (error) {
      console.error("Error downloading the image: ", error);
      api.sendMessage("حدث خطأ أثناء تحميل الصورة.", event.threadID, event.messageID);
    }
  },
}; 
