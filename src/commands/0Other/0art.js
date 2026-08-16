import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "ارت",
  author: "HUSSEIN",
  role: "member",
  description: "Convert image to cartoon style.",

  execute: async ({ api, event }) => {
    
api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
    const imageLink = event.messageReply?.attachments?.[0]?.url;

    if (!imageLink) {
      return api.sendMessage('🛡️ | أرجوك قم بالرد على صورة.', event.threadID, event.messageID);
    }

    const apiURL = `https://www.samirxpikachu.run.place/gta?url=${encodeURIComponent(imageLink)}`;
    const outPath = path.join(process.cwd(), 'generated_image.jpg');

    try {
      const response = await axios.get(apiURL, { responseType: 'arraybuffer' });
      fs.writeFileSync(outPath, response.data);
      console.log(`Image saved to ${outPath}`);
         api.setMessageReaction("🌟", event.messageID, (err) => {}, true);
  
      api.sendMessage({
        body: '❍───────────────❍\n🎨 | 𝐷𝑂𝑁𝐸 𝑆𝑈𝐶𝐶𝐸𝑆𝑆𝐹𝑈𝐿𝐿𝑌 \n❍───────────────❍',
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath)); // Clean up the file after sending

    } catch (error) {
      console.error('Error processing image:', error.message);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.', event.threadID, event.messageID);
    }
  }
};
