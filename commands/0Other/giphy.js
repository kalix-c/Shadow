import fs from 'fs';
import path from 'path';

const currentDir = process.cwd();

const command = {
  name: "تنظيف",
  author: "حسين يعقوبي",
  role: "owner", // نحدد الدور المطلوب لتنفيذ هذا الأمر
  description: "يقوم بحذف جميع الملفات في مجلد cache و temp.",
  cooldown: 60, // فترة التهدئة بين الأوامر بالثواني

  async execute({ api, event }) {
    const { threadID, messageID } = event;

    // دالة لحذف الملفات في مجلد معين
    const deleteFilesInFolder = (folderPath, folderName) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error(err);
          return api.sendMessage(`حدث خطأ أثناء قراءة مجلد ${folderName}.`, threadID, messageID);
        }

        files.forEach(file => {
          const filePath = path.join(folderPath, file);
          fs.unlink(filePath, err => {
            if (err) {
              console.error(err);
              api.sendMessage(`فشل حذف الملف: ${file} في مجلد ${folderName}.`, threadID, messageID);
            }
          });
        });

        api.sendMessage(`تم حذف جميع الملفات في مجلد ${folderName} بنجاح.`, threadID, messageID);
      });
    };

    // مسارات المجلدين
    const cacheFolderPath = path.join(currentDir, 'cache');
    const tempFolderPath = path.join(currentDir, 'temp');

    // حذف الملفات في كلا المجلدين
    deleteFilesInFolder(cacheFolderPath, 'cache');
    deleteFilesInFolder(tempFolderPath, 'temp');
  }
};

export default command;