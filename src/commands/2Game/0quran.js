import axios from "axios";
import fs from "fs";
import path from "path";

async function sendRandomAudioClip({ api, event }) {
    const sentMessage = await api.sendMessage("⏱️ |يرجى الإنتظار....", event.threadID);

    try {
        const audioLinks = [
            "https://audio.jukehost.co.uk/Rv4gPOzornuPEGv5XIJWNm56CWG3fnSp",
            "https://audio.jukehost.co.uk/e5st7AgyjXleDzPUwBvRt70GNaKpQwNV",
            "https://audio.jukehost.co.uk/ngWtCumV4MTVPBLyk14O9ev2ZxT0sEzr",
            "https://audio.jukehost.co.uk/jnnKiNtQLdsRiorMbHGgm0dLWy64YYx4",
            "https://audio.jukehost.co.uk/eCdZZh7PUHqi6mCI0l3LAoznfKkX4yeb",
            "https://audio.jukehost.co.uk/6t60PWxEa6WaT9QLRFrg0UTwtLYTFHkU",
            "https://audio.jukehost.co.uk/gldIjl98nL1HNgSyztqjEvA5vhaUttb3",
            "https://audio.jukehost.co.uk/Gdrk7gCl7CpDXZ41GaPAxJtguDUElfCU",
            "https://audio.jukehost.co.uk/KWa6s4YLClDCv20tsdQFtMqB3UXMO4tJ",
            "https://audio.jukehost.co.uk/nct5hsU0xjHNTUZDEvDTaoH8QhD0AMFa",
            "https://audio.jukehost.co.uk/QWYnnIcJ3OEz3FcB5sGKesNEtpm3ye61",
            "https://audio.jukehost.co.uk/Rv4gPOzornuPEGv5XIJWNm56CWG3fnSp",
            "https://audio.jukehost.co.uk/BNyXe9xeXm7eXcRkzQkki408Nia0qcGF",
            "https://audio.jukehost.co.uk/wNZcxyQFHUGfh86GpwbY3r6SHvCkdwfO",
            "https://audio.jukehost.co.uk/A38nNEQAeCbTuIYIToBI9poggCVyIv2G",
            "https://audio.jukehost.co.uk/oQ7YX2iWNaCLrPvFIIvWyD3ZvC0gEGIg",
            "https://audio.jukehost.co.uk/bLqmHpnLswF9xKUglJALaeOD8EhNywEe",
            "https://audio.jukehost.co.uk/qvMhsEB4Vc3RIyfdwbgGTn0q5ij6OO8f",
            "https://audio.jukehost.co.uk/hZ8YNEzUMWxQpWuNg5Es68aYlN9bvkYf",
            "https://audio.jukehost.co.uk/qbE2d68bPVWZ48qSJp1ieCBFhSDgauXz",
            "https://audio.jukehost.co.uk/bbhiehfZzMyx7msYQxsVoUznHXUskjNF",
            "https://audio.jukehost.co.uk/M1g2130L7Pe2Tx7eoCzG8MpxqdxT2L78",
            "https://audio.jukehost.co.uk/ucToAA7bEPaHoZIlckOnHmBZmNUTpZCh",
            "https://audio.jukehost.co.uk/KIqlgdinCb9J6uZzOP7hLGsjYlxi7hg8",
            "https://audio.jukehost.co.uk/Pif1PGNAqBWgClf67N2r4zD5Llij2SrV",
        ];

        const randomIndex = Math.floor(Math.random() * audioLinks.length);
        const randomAudio = audioLinks[randomIndex];
      const tempAudioPath = path.join(process.cwd(), "temp", "Quran.mp3");
              const response = await axios.get(randomAudio, { responseType: "stream" });
              const writeStream = fs.createWriteStream(tempAudioPath);
              response.data.pipe(writeStream);

              writeStream.on("finish", async () => {
                
api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                
                  await api.sendMessage({
                      body: '{وَإِذَا قَرَأَ الْقُرْآنَ فَاسْتَمِعُوا لَهُ وَأَنْصِتُوا لَعَلَّكُمْ تُرْحَمُونَ.}',
                      attachment: fs.createReadStream(tempAudioPath),
                  }, event.threadID);

                  fs.unlinkSync(tempAudioPath); // Delete the temporary file after sending
                  api.unsendMessage(sentMessage.messageID);
              });

              writeStream.on("error", (error) => {
                  console.error("Error downloading audio:", error);
                  api.sendMessage("حدث خطأ أثناء تحميل المقطع الصوتي.", event.threadID);
                  api.unsendMessage(sentMessage.messageID);
              });
          } catch (error) {
              console.error("Error:", error);
              api.sendMessage("حدث خطأ أثناء إرسال المقطع الصوتي.", event.threadID);
              api.unsendMessage(sentMessage.messageID);
          }
      }

      export default {
          name: "قرآن",
          author: "kaguya project",
          role: "member",
          description: "يرسل ما تيسر من القرآن",
          execute: sendRandomAudioClip
      };
