import fs from 'fs';
import path from 'path';

const command = {
  name: "ملف",
  author: "Kaguya Project",
  role: "owner",
  description: "إرسال محتوى ملف الأمر المحدد وملف الجافا سكريبت نفسه إلى المستخدم.",

  findCommandPath(commandName) {
    const dir = fs.readdirSync("./commands");
    for (const dirName of dir) {
      const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
      for (const fileName of commandsInDir) {
        if (fileName === `${commandName}.js`) {
          return path.join("commands", dirName, fileName);
        }
      }
    }
    return null;
  },

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("Usage: /file <command_name>", threadID, messageID);
    }

    const commandName = args[0];
    const filePath = this.findCommandPath(commandName);

    if (!filePath || !fs.existsSync(filePath)) {
      return api.sendMessage(`Command "${commandName}" not found.`, threadID, messageID);
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      await api.sendMessage(fileContent, threadID, messageID);
      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(filePath)
      }, threadID, messageID, {
        filename: `${commandName}.js`,
        contentType: 'text/javascript'
      });
    } catch (error) {
      console.error("Error reading or sending the file:", error);
      return api.sendMessage("An error occurred while processing the file. Please try again later.", threadID, messageID);
    }
  }
};

export default command;