import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const configFilePath = path.join(cwd(), 'setup', 'config.js');

async function restart(event, api) {
  const waitingMessageID = await new Promise((resolve, reject) => {
    api.sendMessage('⚙️ | يتم الآن إعادة التشغيل...', event.threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info.messageID);
    });
  });

  setTimeout(() => {
    api.unsendMessage(waitingMessageID, (err) => {
      if (err) console.error('Failed to unsend message:', err);
    });

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    api.sendMessage('✅ | تم إعادة تشغيل البوت بنجاح.', event.threadID);

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }, 4000);
}

export default {
  name: "رست",
  version: "1.0.0",
  author: "kaguya project",
  description: "إعادة تشغيل البوت",
  role: "admin",
  cooldowns: 5,
  execute: async ({ api, event }) => {
    await restart(event, api);
  }
};
