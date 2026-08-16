import fs from "fs-extra";
import path from "path";

class CMD {
  constructor() {
    this.name = "كمند";
    this.author = "Kaguya Project";
    this.role = "owner";
    this.description = "تحميل  تحميل كل الأوامر";
    this.cooldown = 10;
    this.aliases = ["cmd", "commands"];
  }

  async execute({ args }) {
    const [type, commandName] = args;

    switch (type) {
      case "تحميل":
        this.loadCommand(commandName);
        break;
      case "تحميل_الكل":
        this.loadAllCommands();
        break;
      default:
        const defaultName = `${global.client.config.prefix}${this.name}`;
        kaguya.reply(`[ كمند ]\n\n=> تحميل <إسم الملف> (تحميل الأمر ${defaultName} تحميل_الكل كمند )\n=> تحميل جميل أوامر البوت`);
        break;
    }
  }

  async loadCommand(commandName) {
    try {
      if (!commandName) {
        return kaguya.reply(" ⚠️ | يرحى إدخال الأمر اللذي تريد إعادة تحميله");
      }

      const pluginPath = this.findCommandPath(commandName);

      if (!pluginPath) {
        return kaguya.reply(" ⚠️ |لم يتم العثور على هذا الأمر!");
      }

      const [oldPlugins, plugins] = await this.loadPlugin(pluginPath);

      if (!plugins?.name || typeof plugins?.execute !== "function") {
        return kaguya.reply(` ⚠️ | هذا الأمر غير مؤهل للتحميل!`);
      }

      if (global.client.commands.has(oldPlugins?.name)) {
        global.client.commands.delete(oldPlugins?.name);
      }

      global.client.commands.set(plugins.name, plugins);

      kaguya.reply(`[ كمند ]\nحالة : جيدة\nالإسم : ${plugins.name}\nالمطور : ${plugins?.author}\nالوصف : ${plugins?.description}`);
    } catch (err) {
      kaguya.reply(" ⚠️ |لا يمكن تحميل هذا الأمر!");
    }
  }

  async loadAllCommands() {
    try {
      const dir = fs.readdirSync("./commands");
      for (const dirName of dir) {
        const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
        for (const fileName of commandsInDir) {
          const commandPath = path.join("commands", dirName, fileName + ``);

          const [oldPlugins, plugins] = await this.loadPlugin(commandPath);

          if (plugins?.name && typeof plugins?.execute === "function") {
            if (global.client.commands.has(oldPlugins?.name)) {
              global.client.commands.delete(oldPlugins?.name);
            }

            global.client.commands.set(plugins.name, plugins);
          }
        }
      }

      kaguya.reply(" ✅ | تم إعادة تحميل جميع الأوامر بنجاح");
    } catch (err) {
      kaguya.reply("⚠️ |غير قادرة على إعادة تحميل الأوامر بأكملها !");
    }
  }

  findCommandPath(commandName) {
    const dir = fs.readdirSync("./commands");
    for (const dirName of dir) {
      const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
      for (const fileName of commandsInDir) {
        if (fileName === `${commandName}.js`) {
          return path.join("commands", dirName, fileName + ``);
        }
      }
    }
    return null;
  }

  async loadPlugin(pluginPath) {
    const [oldPlugins, plugins] = await Promise.all([
      import("../../" + pluginPath),
      import("../../" + pluginPath + `?version=${Math.random()}`)
    ]);
    return [oldPlugins.default, plugins.default];
  }
}

export default new CMD();
