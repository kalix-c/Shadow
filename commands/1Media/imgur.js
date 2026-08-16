import axios from 'axios';

export default {
  name: "رابط2",
  author: "YourName",
  role: "user", // تحديد الدور المناسب بناءً على متطلبات البوت
  description: "Convert media attachments to a short link.",
  execute: async function ({ api, event }) {
    const url = event.messageReply?.attachments[0]?.url;
    
    if (!url) {
      return api.sendMessage(
        "⚠️ | قم بالرد على , مقطع , صوت , صورة متحركة , صورة .",
        event.threadID,
        event.messageID
      );
    }

    try {
      const baseApiUrl = 'https://g-v1.onrender.com';

      const uploadResponse = await axios.post(`${baseApiUrl}/v1/upload`, null, {
        params: { url: url },
      });

      if (uploadResponse.status !== 200 || !uploadResponse.data.link) {
        throw new Error('Failed to upload media.');
      }

      const shortLink = uploadResponse.data.link;

      return api.sendMessage(shortLink, event.threadID, event.messageID);

    } catch (error) {
      console.error("Error during media conversion:", error);
      return api.sendMessage(
        "❌ | Failed to convert media into a link.",
        event.threadID,
        event.messageID
      );
    }
  }
};
