import fs from "fs";

class Admin {
  name = "آدمن";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "إضافة أو إزالة أو تعيين رتبة المسؤول";
  role = "admin";
  aliases = ["اشراف"];

  async onLoad() {
    if (typeof global.client?.setConfig !== "function") {
      global.client.__proto__.setConfig = function (newConfig) {
        try {
          Object.assign(global.client.config, newConfig);
          fs.writeFileSync("./setup/config.js", `export default ${JSON.stringify(global.client.config, null, 2)};`);
        } catch (err) {
          this.emit("system:err", err);
        }
      };
    }
  }

  async execute({ event, args, api }) {
    try {
      var [type, tags] = args;
      tags = event.mentions && Object.keys(event.mentions).length > 0 ? event.mentions : tags && !isNaN(tags) ? { [tags]: "" } : false;

      if (["add", "remove"].includes(type) && !global.client.config.ADMIN_IDS.includes(event.senderID)) {
        return api.sendMessage(" ⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!", event.threadID);
      }

      switch (type) {
        case "إضافة":
          return this.addAdmin(tags, api, event.threadID);

        case "إزالة":
          return this.removeAdmin(tags, api, event.threadID);

        case "قائمة":
        case "-l":
        case "-all":
          return this.listAdmins(api, event.threadID);

        default:
          var commandName = client.config.prefix + this.name;
          return api.sendMessage(`[ آدمن ]\n${commandName} إضافة <@منشن أو الآيدي> قم بإضافة العضو آدمن على البوت \n${commandName} إزالة <@منشن أو الآيدي> قم بإزالة العضو من دور الآدمن على البوت \n${commandName} قائمة إظهار قائمة الآدمنية على البوت`, event.threadID);
      }
    } catch (err) {
      console.log(err);
    }
  }

  addAdmin(tags, api, threadID) {
    if (!tags) {
      return api.sendMessage(" ⚠️ | يرجى عمل منشن أو إدخال آيدي العضو المراد إضافته كآدمن", threadID);
    }

    const addedUids = this.processAdmins(tags, "add");
    const statusMessage = this.getStatusMessage(addedUids, "");

    return api.sendMessage(statusMessage, threadID);
  }

  removeAdmin(tags, api, threadID) {
    if (!tags) {
      return api.sendMessage(" ⚠️ | يرجى عمل منشن أو إدخال آيدي العضو المراد إزالته من قائمة الآدمنية", threadID);
    }

    const removedUids = this.processAdmins(tags, "remove");
    const statusMessage = this.getStatusMessage(removedUids, "Xoá");

    return api.sendMessage(statusMessage, threadID);
  }

  async listAdmins(api, threadID) {
    const adminIds = global.client.config.ADMIN_IDS;

    if (adminIds.length === 0) {
      return api.sendMessage(" ⚠️ | لا يوجد أعضاء في قائمة الآدمنية.", threadID);
    }

    try {
      const userInfo = await api.getUserInfo(adminIds);
      const adminList = adminIds
        .map(id => `${userInfo[id]?.name || "غير معروف"} (${id})`)
        .join("\n");

      return api.sendMessage(` 👑 | قائمة الآدمنية:\n${adminList}`, threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("⚠️ | حدث خطأ أثناء جلب معلومات الآدمنية.", threadID);
    }
  }

  processAdmins(tags, action) {
    const uidsToProcess = Object.keys(tags);
    const processedUids = [[], []];

    for (var uid of uidsToProcess) {
      if ((action === "add" && global.client.config.ADMIN_IDS.includes(uid)) || (action === "remove" && !global.client.config.ADMIN_IDS.includes(uid))) {
        processedUids[0].push(uid);
      } else {
        global.client.setConfig({
          ADMIN_IDS: action === "add" ? [...global.client.config.ADMIN_IDS, uid] : global.client.config.ADMIN_IDS.filter((existingUid) => existingUid !== uid),
        });
        processedUids[1].push(uid);
      }
    }

    return processedUids;
  }

  getStatusMessage(processedUids, action) {
    const [failedUids, successUids] = processedUids;
    const status = successUids.length > 0 ? " ✅ | نجحت" : "❌ | فشلت";

    let message = `${status} عملية التعيين`;

    if (successUids.length > 0) {
      message += `\n\nتمت إضافة العضو صاحب الآيدي ${action.toLowerCase()}\n ${successUids.join(", ")} نجحت بذالك عملية التعيين`;
    }

    if (failedUids.length > 0) {
      message += `\n\n ⚠️ | موجود بالفعل في قائمة الآدمنية: ${failedUids.join(", ")} فشلت بذالك عملية التعيين`;
    }

    return message;
  }
}

export default new Admin();
