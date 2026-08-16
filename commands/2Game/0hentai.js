import fs from 'fs-extra';
import request from 'request';

async function fetchGroupImage({ api, event }) {
    try {
        let threadInfo = await api.getThreadInfo(event.threadID);
        let { threadName, participantIDs, imageSrc } = threadInfo;

        if (imageSrc) {
            let callback = async function() {
                api.sendMessage(
                    {
                        body: `معرف المجموعة : ${event.threadID}`,
                        attachment: fs.createReadStream(process.cwd() + '/cache/thread.png')
                    },
                    event.threadID,
                    () => {
                        fs.unlinkSync(process.cwd() + '/cache/thread.png');
                    }
                );
            };

            request(imageSrc)
                .pipe(fs.createWriteStream(process.cwd() + '/cache/thread.png'))
                .on('close', callback);
        } else {
            api.sendMessage(
                ` معرف المجموعة : ${event.threadID}\n ⁉️ | هذه المجموعة لاتمتلك صورة `,
                event.threadID
            );
        }
    } catch (error) {
        console.error("Error fetching group image:", error.message);
        api.sendMessage("❌ | Error fetching group image.", event.threadID);
    }
}

export default {
    name: "تيد",
    author: "Kaguya Project",
    role: "member",
    description: "يقوم بجلب صورة المجموعة إذا كانت موجودة.",
    execute: fetchGroupImage
};