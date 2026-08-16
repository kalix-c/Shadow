import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Help {
  constructor() {
    this.name = "اوامر";
    this.author = "محمد الشاوني";
    this.cooldowns = 5;
    this.description = "عرض قائمة عمليات حديقة الظل (Shadow Garden).";
    this.role = "member";
    this.aliases = ["أوامر", "الاوامر", "مساعدة", "help"];
    this.commands = global.client.commands;
    this.tempFolder = path.join(process.cwd(), 'temp');
    
    // صور حديقة الظل (Shadow Garden)
    this.shadowImages = [
      "https://i.postimg.cc/jj25dynJ/thumb-350-1080006.webp",
      "https://i.postimg.cc/d32QSBpg/thumb-350-1239849.webp",
      "https://i.imgur.com/VZKKBHv.jpeg",
      "https://i.imgur.com/fX5iiTb.png"
    ];
  }

  async execute({ api, event, args }) {
    api.setMessageReaction("🌑", event.messageID, (err) => {}, true);

    const [pageStr] = args;
    const page = parseInt(pageStr) || 1;
    const commandsPerPage = 12;
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = page * commandsPerPage;

    const commandList = Array.from(this.commands.values());
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const totalCommands = commandList.length;

    if (pageStr && typeof pageStr === 'string' && pageStr.toLowerCase() === 'الكل') {
      let allCommandsMsg = "🌑 **عمليات حديقة الظل الكاملة** 🌑\n";
      allCommandsMsg += "━━━━━━━━━━━━━━━━━━\n";
      
      commandList.forEach((command) => {
        allCommandsMsg += `⚔️ 『${command.name}』\n`;
      });
      allCommandsMsg += `━━━━━━━━━━━━━━━━━━\n📊 إجمالي العمليات: ${totalCommands}\n⚡ I am Atomic.`;
      await api.sendMessage(allCommandsMsg, event.threadID);
    } else if (!isNaN(page) && page > 0 && page <= totalPages) {
      let msg = `🌑 **مخطوطة عمليات شادو (Shadow)** 🌑\n`;
      msg += "━━━━━━━━━━━━━━━━━━\n";

      const commandsToDisplay = commandList.slice(startIndex, endIndex);
      commandsToDisplay.forEach((command, index) => {
        const num = startIndex + index + 1;
        msg += `[${num}] ⮕ 『${command.name}』\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `📜 الصفحة: ${page}/${totalPages}\n`;
      msg += `📊 العمليات المكتشفة: ${totalCommands}\n`;
      msg += `💡 رد برقم العملية لكشف تفاصيلها أو اكتب 'اوامر الكل'.\n`;
      msg += `⚡ *I am the one who hunts in the shadows.*`;

      const randomImg = this.shadowImages[Math.floor(Math.random() * this.shadowImages.length)];
      const tempPath = path.join(this.tempFolder, `shadow_help_${Date.now()}.jpg`);

      try {
        if (!fs.existsSync(this.tempFolder)) fs.mkdirSync(this.tempFolder);
        const res = await axios.get(randomImg, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempPath, Buffer.from(res.data));
        const attachment = fs.createReadStream(tempPath);
        
        const info = await api.sendMessage({ body: msg, attachment }, event.threadID);
        
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "اوامر",
          unsend: false,
        });
      } catch (error) {
        await api.sendMessage(msg, event.threadID);
      }
    } else {
      await api.sendMessage("❌ | الصفحة غير موجودة في سجلات الحديقة.", event.threadID);
    }
  }

  async onReply({ api, event, reply }) {
    if (reply.type === "pick" && reply.name === "اوامر" && reply.author === event.senderID) {
      const num = parseInt(event.body.trim());
      const commandList = Array.from(this.commands.values());

      if (isNaN(num) || num < 1 || num > commandList.length) {
        return api.sendMessage("❌ | رقم العملية غير صالح.", event.threadID);
      }

      const cmd = commandList[num - 1];
      const roleText = this.getRoleText(cmd.role);
      
      api.setMessageReaction("⚡", event.messageID, (err) => {}, true);
  
      const message = `🌑 **تفاصيل عملية الظل: ${cmd.name}** 🌑\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `👤 المطور: ${cmd.author || "محمد الشاوني"}\n` +
                      `🔑 الصلاحية: ${roleText}\n` +
                      `📋 الوصف: ${cmd.description || "لا يوجد وصف"}\n` +
                      `📝 الأسماء البديلة: ${cmd.aliases?.join(", ") || "لا يوجد"}\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `⚡ *Shadow Garden Intelligence*`;

      const randomImg = this.shadowImages[Math.floor(Math.random() * this.shadowImages.length)];
      try {
        const res = await axios.get(randomImg, { responseType: 'arraybuffer' });
        const tempPath = path.join(this.tempFolder, `shadow_detail_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, Buffer.from(res.data));
        await api.sendMessage({ body: message, attachment: fs.createReadStream(tempPath) }, event.threadID);
      } catch (error) {
        await api.sendMessage(message, event.threadID);
      }
    }
  }

  getRoleText(role) {
    switch (role) {
      case "admin": return "كبار أعضاء الحديقة";
      case "owner": return "سيد الظل (المالك)";
      default: return "عامة أعضاء الحديقة";
    }
  }
}

export default new Help();
