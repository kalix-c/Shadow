import fs from 'fs';
import axios from 'axios';
import path from 'path';

async function imageSearch({ api, event, args }) {
    let imageUrl;

    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    if (event.messageReply && event.messageReply.attachments.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
    } else if (args.length > 0) {
        imageUrl = args[0];
    } else {
        return api.sendMessage(" ❕ | ارجوك قم بالرد على صورة", event.threadID, event.messageID);
    }

    try {
        const response = await axios.get(`https://samirxpikachuio.onrender.com/glens?url=${encodeURIComponent(imageUrl)}`);
        const results = response.data.slice(0, 6);

        if (results.length > 0) {
            const attachments = await Promise.all(
                results.map(async (result, index) => {
                    const thumbnailResponse = await axios.get(result.thumbnail, { responseType: 'stream' });
                    const filePath = path.join(process.cwd(), 'cache', `thumbnail_${index}.jpg`);
                    const writer = fs.createWriteStream(filePath);
                    thumbnailResponse.data.pipe(writer);

                    return new Promise((resolve, reject) => {
                        writer.on('finish', () => resolve(fs.createReadStream(filePath)));
                        writer.on('error', reject);
                    });
                })
            );

            api.setMessageReaction("✅", event.messageID, (err) => {}, true);

            await api.sendMessage({
                body: "◆❯━━━━━▣✦▣━━━━━━❮◆\n\tإليك صور مشابهة\n◆❯━━━━━▣✦▣━━━━━━❮◆",
                attachment: attachments
            }, event.threadID, event.messageID);

            // Clean up cache files
            attachments.forEach(stream => {
                const filePath = stream.path;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        } else {
            api.sendMessage("No results found for the given image.", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching image search results.", event.threadID, event.messageID);
    }
}

export default {
    name: "تشابه",
    author: "محمد الشاوني",
    description: "يقوم بالبحث عن معلومات حول الصورة المرسلة أو رابط الصورة.",
    role: "member",
    execute: imageSearch
};
