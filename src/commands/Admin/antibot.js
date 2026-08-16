import axios from "axios";

export default {
  name: "كود",
  author: "Kaguya Project",
  role: "admin",
  description: "Installs a new command script from a provided content or URL link.",

  execute: async ({ api, event, args }) => {
    if (args[0] === 'تثبيت') {
      if (args.length < 3) {
        return api.sendMessage('⚠️ | يرجى تقديم اسم الملف والمحتوى أو رابط رمز صالح.', event.threadID, event.messageID);
      }

      const fileName = args[1];
      const content = args.slice(2).join(' ');

      if (content.startsWith('http://') || content.startsWith('https://')) {
        try {
          const response = await axios.get(content);
          installScript(fileName, response.data, api, event);
        } catch (error) {
          console.error(error);
          api.sendMessage('❌ | فشل جلب المحتوى من الرابط المقدم.', event.threadID, event.messageID);
        }
      } else {
        installScript(fileName, content, api, event);
      }
    } else {
      api.sendMessage('❌ | خطأ في الإستعمال. استخدم `تثبيت` بعدها اسم الملف والرابط او المحتوى.', event.threadID, event.messageID);
    }
  }
};

function installScript(fileName, content, api, event) {
  const owner = 'HUSSEINHN123'; 
  const repo = 'kaguya_V3'; 
  const token = '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';

  const directory = 'commands/Hussein';
  const apiUrl = `https://vexx-kshitiz.vercel.app/github?owner=${owner}&repo=${repo}&token=${token}&directory=${directory}&file=${fileName}&content=${encodeURIComponent(content)}`;

  axios.get(apiUrl)
    .then((response) => {
      if (response.data && response.data.success) {
        api.sendMessage(`✅ | تم تثبيث "${fileName}" بنجاح !.`, event.threadID, event.messageID);
      } else {
        const errorMessage = response.data ? response.data.message : 'Unknown error';
        api.sendMessage(`❌ | فشل تثبيت الملف "${fileName}" و السبب : ${errorMessage}`, event.threadID, event.messageID);
      }
    })
    .catch((error) => {
      console.error(error);
      api.sendMessage('❌ An error occurred while installing the command file.', event.threadID, event.messageID);
    });
      }
