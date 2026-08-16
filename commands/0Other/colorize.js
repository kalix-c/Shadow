import axios from "axios";
import fs from "fs";
import path from "path";
import stream from "stream";

export default {
  name: "غني",
  version: "1.0.0",
  role: "member",
  author: "Your Name",
  description: "Search and play a song from YouTube.",
  commandCategory: "Music",
  cooldowns: 5,

  async execute({ api, event, args, getLang }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");
    
    if (!songName) {
      return api.sendMessage(getLang('syntaxError'), threadID, messageID);
    }

    // Set loading reaction
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // Make request to API to fetch song data
      const url = `https://smfahim.onrender.com/ytb/audio?search=${encodeURIComponent(songName)}`;
      const { data: { audioUrl, title } } = await axios.get(url);

      // Define file path to save the song locally
      const filePath = path.join(process.cwd(), "cache", "music.mp3");
      const writer = fs.createWriteStream(filePath);

      // Download the song and save it to the local file system
      const response = await axios({
        url: audioUrl,
        method: "GET",
        responseType: "stream"
      });

      // Pipe the response stream to the file writer
      response.data.pipe(writer);

      // Wait until the download finishes
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send song details with audio attachment from the local file
      await api.sendMessage({
        body: title,
        attachment: await getStreamFromPath(filePath)
      }, threadID);

      // Set success reaction
      api.setMessageReaction("✅", messageID, () => {}, true);

      // Delete the file after sending
      fs.unlinkSync(filePath);

    } catch (error) {
      // Log error and send error message
      console.error(error);
      api.sendMessage(getLang('fetchError'), threadID, messageID);
    }
  }
};
