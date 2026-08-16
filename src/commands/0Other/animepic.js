import fs from 'fs';
import path from 'path';

class RestrictCommand {
  name = "تقييد";
  author = "Shadow Garden Project";
  cooldowns = 60;
  description = "تقييد أو إلغاء تقييد البوت";
  role = "admin"; // Only admins can execute this command
  aliases = ["onlyadmin"];

  async execute({ api, event, args }) {
    try {
      const [action] = args;
      const isAdmin = global.client.config.ADMIN_IDS.includes(event.senderID);

      if (!isAdmin) {
        api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
  
        return api.sendMessage("⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!", event.threadID);
      }

      const currentUserID = await api.getCurrentUserID(); // احصل على معرّف البوت

      if (action === "تعطيل") {
        global.client.setConfig({ botEnabled: true });
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
        await this.updateBotNickname(api, "شادو 》✅《 الحالة ➠ مفعل", event.threadID, currentUserID);
        return api.sendMessage("✅ | تم تعطيل تقييد إستخدام البوت !", event.threadID);
      }

      if (action === "تفعيل") {
        global.client.setConfig({ botEnabled: false });
        
        api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
  
        await this.updateBotNickname(api, "شادو 》❌《 الحالة ➠ مقيد", event.threadID, currentUserID);
        return api.sendMessage("❌ | تم تفعيل تقييد إستخدام البوت !", event.threadID);
      }

      return api.sendMessage("⚠️ | استخدم الأمر بشكل صحيح: تقييد تفعيل | تعطيل", event.threadID);
    } catch (err) {
      console.log(err);
    }
  }

  async updateBotNickname(api, nickname, threadID, userID) {
    try {
      await api.changeNickname(nickname, threadID, userID); // استخدم معرّف البوت
    } catch (err) {
      console.error("Error updating bot nickname:", err);
    }
  }

  // Update the configuration file
  async setConfig(api, newConfig) {
    try {
      const configPath = path.join(process.cwd(), 'config.js');
      const configContent = `export default ${JSON.stringify(newConfig, null, 2)};`;
      fs.writeFileSync(configPath, configContent);
    } catch (err) {
      console.error("Error updating configuration file:", err);
    }
  }
}

export default new RestrictCommand();
