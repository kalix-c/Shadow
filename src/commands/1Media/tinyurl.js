import { shorten } from 'tinyurl';

export default {
  name: "رابط4",
  author: "kaguay project",
  role: "member",
  description: "الحصول على روابط صور بشكل صغير",
  execute: async function ({ api, event }) {
    if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage({ body: "❌ | يرجى الرد على مرفق." }, event.threadID, event.messageID);
    }

    const attachment = event.messageReply.attachments[0];

    try {
        const shortUrl = await shorten(attachment.url);
        api.sendMessage({ body: `${shortUrl}` }, event.threadID, event.messageID);
    } catch (error) {
        api.sendMessage({ body: "❌ | حدث خطأ أثناء قص الرابط." }, event.threadID, event.messageID);
        console.error(error);
    }
  }
};
