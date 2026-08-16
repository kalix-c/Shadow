import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Help {
  constructor() {
    this.name = "اوامر";
    this.author = "Kaguya Project";
    this.cooldowns = 60;
    this.description = "عرض قائمة الأوامر مع كيفية استعمال كل واحد!";
    this.role = "member";
    this.aliases = ["أوامر", "الاوامر"];
    this.commands = global.client.commands;
    this.cache = {}; // Cache to store image paths
    this.tempFolder = path.join(process.cwd(), 'temp');
    
    // مصفوفة الصور العشوائية للعرض الأولي
    this.randomImageUrls = [
            "https://i.imgur.com/mCpWvaI.jpeg",
      "https://i.imgur.com/Q8Ljscl.jpeg",
      "https://i.imgur.com/ZGfBNLX.jpeg",
      "https://i.imgur.com/UV1zAwh.jpeg",
      "https://i.imgur.com/MKoNjNT.jpeg",
      "https://i.imgur.com/ICzZ9l6.jpeg",
      "https://i.imgur.com/wdWjH1D.jpeg",
      "https://i.imgur.com/H2rhsH5.jpeg",
      "https://i.imgur.com/GE7w5nt.jpeg",
      "https://i.imgur.com/UEg87Rw.png",
      "https://i.imgur.com/q9myIow.jpeg",
      "https://i.imgur.com/k1Bhji6.jpeg",
      "https://i.imgur.com/6DT6OrG.jpeg",
      "https://i.imgur.com/dRMPS2V.jpeg"
    ];

    // مصفوفة الصور المخصصة للرد عند جلب معلومات أمر معين
    this.detailedImageUrls = [
    "https://i.postimg.cc/jj25dynJ/thumb-350-1080006.webp",
    "https://i.postimg.cc/d32QSBpg/thumb-350-1239849.webp",
    "https://i.imgur.com/VZKKBHv.jpeg",
    "https://i.imgur.com/fX5iiTb.png" // قم بتعديل الرابط حسب الحاجة
    ];
  }

  async execute({ api, event, args }) {
    api.setMessageReaction("📝", event.messageID, (err) => {}, true);

    const [pageStr] = args;
    const page = parseInt(pageStr) || 1;
    const commandsPerPage = 10; // تعديل عدد الأوامر في كل صفحة
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = page * commandsPerPage;

    const commandList = Array.from(this.commands.values());
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const totalCommands = commandList.length;

    if (pageStr && typeof pageStr === 'string' && pageStr.toLowerCase() === 'الكل') {
      let allCommandsMsg = "╭───────────────◊\n•——[قِـٰٚـِْ✮ِـٰٚـِْآئمِـٰٚـِْ✮ِـٰٚـِْة جِـٰٚـِْ✮ِـٰٚـِْمِـٰٚـِْ✮ِـٰٚـِْيِـٰٚـِْ✮ِـٰٚـِْعِـٰٚـِْ✮ِـٰٚـِْ آلِـٰٚـِْ✮ِـٰٚـِْأﯛ̲୭آمِـٰٚـِْ✮ِـٰٚـِْر║]——•\n";
      
      
      
      commandList.forEach((command, index) => {
        const commandName = command.name.toLowerCase();
        allCommandsMsg += `❏ الإسم : 『${commandName}』\n`;
      });
      allCommandsMsg +=`إجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n╰───────────────◊`;
      await api.sendMessage(allCommandsMsg, event.threadID);
    } else if (!isNaN(page) && page > 0 && page <= totalPages) {
      let msg = `\n•—[قٰཻــ͒͜ـًائمـٰة أوُامـٰࢪ ڪاغــِْــٰوُيا ]—•\n`;

      const commandsToDisplay = commandList.slice(startIndex, endIndex);
      commandsToDisplay.forEach((command, index) => {
        const commandNumber = startIndex + index + 1;
        msg += `[${commandNumber}] ⟻『${command.name}』\n`;
      });

      msg +=`✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎\nاٰلـٰ̲ـہصـٰ̲ـہفـٰ̲ـہحـٰ̲ـة : ${page}/${totalPages}:\nإجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n🔖 | قم بكتابة أوامر 'رقم الصفحة' من أجل رؤية باقي الصفحات \n 🧿 | أو قم بكتابة اوامر الكل من أجل رؤية جميع الأوامر\n 📜 | رد بـ رقم الأمر من أجل مزيد من التفاصيل`;


      const randomImageUrl = this.randomImageUrls[Math.floor(Math.random() * this.randomImageUrls.length)];
      const tempImagePath = path.join(this.tempFolder, `random_image_${Date.now()}.jpeg`);

      try {
        const imageResponse = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));
        const attachment = fs.createReadStream(tempImagePath);
        
        const info = await api.sendMessage({ body: msg, attachment }, event.threadID);
        
        // Add onReply handler
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "اوامر",
          unsend: false,
        });
      } catch (error) {
        console.error("حدث خطأ: ", error);
        await api.sendMessage("❌ | حدث خطأ أثناء جلب الصورة.", event.threadID);
      }
    } else {
      await api.sendMessage("❌ | الصفحة غير موجودة.", event.threadID);
    }
  }

  async onReply({ api, event, reply }) {
    if (reply.type === "pick" && reply.name === "اوامر" && reply.author === event.senderID) {
      const commandNumber = parseInt(event.body.trim());

      if (isNaN(commandNumber) || commandNumber < 1 || commandNumber > this.commands.size) {
        return api.sendMessage("❌ | رقم الأمر غير صحيح.", event.threadID);
      }
      

      const commandList = Array.from(this.commands.values());
      const selectedCommand = commandList[commandNumber - 1];

      const roleText = this.getRoleText(selectedCommand.role);
      
        api.setMessageReaction("🎯", event.messageID, (err) => {}, true);
  
      const message = `\n\n\n⎔━〚〘${selectedCommand.name}〙〛━⎔\n
👤 | ➭ المؤلف:『${selectedCommand.author}』
🔑 | ➭ الدور:『${roleText}』
📋 | ➭ الوصف:『${selectedCommand.description}』
📝 | ➭ اسماء بديلة:『${selectedCommand.aliases?.join(", ") || "غير متوفرة"}』\n⎔━〚〘${selectedCommand.name}〙〛━⎔`;
      const detailedImageUrl = this.detailedImageUrls[Math.floor(Math.random() * this.detailedImageUrls.length)];
      const tempImagePath = path.join(this.tempFolder, `detailed_image_${Date.now()}.jpeg`);

      try {
        const imageResponse = await axios.get(detailedImageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));
        const attachment = fs.createReadStream(tempImagePath);
        await api.sendMessage({ body: message, attachment }, event.threadID);
      } catch (error) {
        console.error("حدث خطأ: ", error);
        await api.sendMessage("❌ | حدث خطأ أثناء جلب الصورة.", event.threadID);
      }
    }
  }

  getRoleText(role) {
    switch (role) {
      case "admin":
        return "المشرفين";
      case "owner":
        return "المالك";
      default:
        return "الجميع";
    }
  }
}

export default new Help();
