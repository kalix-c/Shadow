import fs from 'fs';
import path from 'path';


export default {
  name: "بنك",
  author: "Shadow Garden Project",
  role: "user",
  description: "أوامر البنك المختلفة (رصيدي، إيداع، سحب، تسجيل).",
  
  async execute({ event, args, api, Economy }) {
    const { getBalance, increase, decrease } = Economy;
    const userID = event.senderID;
    const command = args[0];
    const amount = parseInt(args[1], 10);
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Unknown";
    
    // Ensure threadID is present
    if (!event.threadID) {
      return api.sendMessage("حدث خطأ، لا يمكن تحديد المحادثة.", event.threadID);
    }

    // تحديد مسار ملف البنك
    const bankFilePath = path.join(process.cwd(), 'bank.json');

    // التأكد من وجود ملف البنك
    if (!fs.existsSync(bankFilePath)) {
      fs.writeFileSync(bankFilePath, JSON.stringify({}));
    }

    // قراءة بيانات البنك
    const bankData = JSON.parse(fs.readFileSync(bankFilePath, 'utf8'));

    // تسجيل المستخدم إذا لم يكن مسجلاً
    if (!bankData[userID]) {
      bankData[userID] = { bank: 100, lastInterestClaimed: Date.now() };
      fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
      return api.sendMessage(`أهلاً ${userName}! تم تسجيلك في البنك برصيد ابتدائي قدره 100 دولار \n اكتب بنك ثانية لترى اوامر البنك المتاحة`, event.threadID);
    }

    switch (command) {
      case "رصيدي":
        return api.sendMessage(`رصيد حسابك البنكي هو ${bankData[userID].bank} دولار.`, event.threadID);

      case "إيداع":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في إيداعه.", event.threadID);
        }
        await decrease(amount, userID);
        bankData[userID].bank += amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`تم إيداع ${amount} دولار في حسابك البنكي.`, event.threadID);

      case "سحب":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في سحبه.", event.threadID);
        }
        if (bankData[userID].bank < amount) {
          return api.sendMessage("ليس لديك ما يكفي من المال.", event.threadID);
        }
        await increase(amount, userID);
        bankData[userID].bank -= amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`تم سحب ${amount} دولار من حسابك البنكي.`, event.threadID);

      default:
        return api.sendMessage(`❍───────────────❍\n\t\t\t\t🏦𝙱𝙰𝙽𝙺 𝙺𝙰𝙶𝙺𝙰𝚈𝙰🏦\n\nبنك رصيدي : لعرض رصيدك البنك\nبنك إيداع [الكمية]: لإيداع الأموال\nبنك سحب [الكمية]: لسحب الأموال\nسأضيف المزيد من الخيارات قريبا ....\n❍───────────────❍`, event.threadID);
    }
  }
};
