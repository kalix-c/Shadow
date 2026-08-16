import axios from "axios";
import fs from "node:fs";
import path from "node:path";

const الصور = [
  "https://i.postimg.cc/jj25dynJ/thumb-350-1080006.webp",
  "https://i.postimg.cc/d32QSBpg/thumb-350-1239849.webp",
  "https://i.imgur.com/VZKKBHv.jpeg",
  "https://i.imgur.com/fX5iiTb.png"
];

const تأخير_الحذف = (filePath) => {
  setTimeout(() => fs.rm(filePath, { force: true }, () => {}), 30_000);
};

export default {
  name: "اوامر",
  author: "محمد الشاوني",
  cooldowns: 5,
  description: "عرض أوامر حديقة الظل وصفحاتها.",
  role: "member",
  aliases: ["أوامر", "الاوامر", "مساعدة"],

  async execute({ api, event, args }) {
    const commandMap = global.client?.commands;
    const commandList = Array.from(commandMap?.values?.() || [])
      .filter((command) => command?.name)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
    const pageArg = String(args?.[0] || "1").trim();

    if (!commandList.length) {
      return api.sendMessage("لم تُحمّل أوامر الحديقة بعد. أعد المحاولة بعد لحظات.", event.threadID, event.messageID);
    }

    if (pageArg === "الكل") {
      const names = commandList.map((command, index) => `${index + 1}. ${command.name}`).join("\n");
      return api.sendMessage(
        `🌑 قائمة عمليات حديقة الظل\n━━━━━━━━━━━━━━━━━━\n${names}\n━━━━━━━━━━━━━━━━━━\nالإجمالي: ${commandList.length}`,
        event.threadID,
        event.messageID
      );
    }

    const page = Number.parseInt(pageArg, 10) || 1;
    const perPage = 12;
    const totalPages = Math.max(1, Math.ceil(commandList.length / perPage));
    if (page < 1 || page > totalPages) {
      return api.sendMessage(`هذه الصفحة غير موجودة. اختر صفحة بين 1 و${totalPages}.`, event.threadID, event.messageID);
    }

    const start = (page - 1) * perPage;
    const visible = commandList.slice(start, start + perPage);
    let message = "🌑 مخطوطة عمليات شادو\n━━━━━━━━━━━━━━━━━━\n";
    message += visible.map((command, index) => `${start + index + 1}. ${command.name}`).join("\n");
    message += `\n━━━━━━━━━━━━━━━━━━\nالصفحة: ${page}/${totalPages}\nالإجمالي: ${commandList.length}\nأرسل رقم العملية لمعرفة تفاصيلها.`;

    const imageUrl = الصور[Math.floor(Math.random() * الصور.length)];
    const tempFolder = path.join(process.cwd(), "temp");
    const tempPath = path.join(tempFolder, `shadow-help-${Date.now()}.jpg`);

    try {
      fs.mkdirSync(tempFolder, { recursive: true });
      const response = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15_000 });
      fs.writeFileSync(tempPath, response.data);
      const sent = await api.sendMessage({ body: message, attachment: fs.createReadStream(tempPath) }, event.threadID);
      global.client?.handler?.reply?.set?.(sent?.messageID, {
        author: event.senderID,
        type: "pick",
        name: "اوامر",
        unsend: false
      });
      تأخير_الحذف(tempPath);
      return sent;
    } catch {
      return api.sendMessage(message, event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply?.type !== "pick" || reply.name !== "اوامر" || reply.author !== event.senderID) return;
    const commandList = Array.from(global.client?.commands?.values?.() || [])
      .filter((command) => command?.name)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
    const number = Number.parseInt(String(event.body || "").trim(), 10);
    const command = commandList[number - 1];

    if (!command) return api.sendMessage("رقم العملية غير صالح.", event.threadID, event.messageID);
    const aliases = command.aliases?.filter((alias) => /[ء-ي]/.test(alias)).join("، ") || "لا توجد";
    const details = [
      `🌑 تفاصيل العملية: ${command.name}`,
      "━━━━━━━━━━━━━━━━━━",
      `المطور: ${command.author || "محمد الشاوني"}`,
      `الصلاحية: ${this.getRoleText(command.role)}`,
      `الوصف: ${command.description || "لا يوجد وصف"}`,
      `الأسماء العربية البديلة: ${aliases}`,
      "━━━━━━━━━━━━━━━━━━",
      "تعمل الحديقة من خلف الكواليس."
    ].join("\n");
    return api.sendMessage(details, event.threadID, event.messageID);
  },

  getRoleText(role) {
    if (role === "admin") return "كبار أعضاء الحديقة";
    if (role === "owner") return "سيد الظل";
    return "أعضاء الحديقة";
  }
};
