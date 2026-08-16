import axios from "axios";
import fs from "fs";
import path from "path";

async function sendRandomAnimeClip({ api, event }) {
    const sentMessage = await api.sendMessage(" ⏱️ | المرجو الانتظار....", event.threadID);

    try {
        const link = [
          'https://i.imgur.com/5is7FsX.mp4',
          'https://v1.pinimg.com/videos/mc/720p/50/69/a4/5069a40cc3de5cbe9291cf09a13d0577.mp4', 'https://v1.pinimg.com/videos/mc/720p/75/52/20/75522035a50e814af3af98f9b3646685.mp4', 'https://i.imgur.com/J2nVQe4.mp4', 'https://i.imgur.com/a84XWkx.mp4', 'https://i.imgur.com/4G3B2YR.mp4', 'https://i.imgur.com/ep5zfed.mp4', 'https://i.imgur.com/N7XCSZO.mp4', 'https://i.imgur.com/RgqCvp5.mp4', 'https://i.imgur.com/xDOOapQ.mp4', 'https://i.imgur.com/GYPUtkj.mp4', 'https://i.imgur.com/noPL22M.mp4', 'https://i.imgur.com/K9kmYRS.mp4', 'https://i.imgur.com/28TYy8M.mp4', 'https://i.imgur.com/5utk5sA.mp4', 'https://i.imgur.com/RBFJkPc.mp4', 'https://i.imgur.com/IjL6xT0.mp4', 'https://i.imgur.com/Pu6r4Jz.mp4', 'https://i.imgur.com/7awqO74.mp4', 'https://i.imgur.com/7sk8loc.mp4', 'https://i.imgur.com/t8WYmzc.mp4', 'https://i.imgur.com/UfOMJga.mp4', 'https://i.imgur.com/lrRdX37.mp4', 'https://i.imgur.com/cg9vJjL.mp4', 'https://i.imgur.com/nOWja6R.mp4', 'https://i.imgur.com/DXfsbvT.mp4', 'https://i.imgur.com/5wbUMkB.mp4', 'https://i.imgur.com/s9wtmQD.mp4', 'https://i.imgur.com/gnGEHrN.mp4', 'https://i.imgur.com/LdUi4r3.mp4', 'https://i.imgur.com/YcRpE9x.mp4', 'https://i.imgur.com/fTlaKRU.mp4', 'https://i.imgur.com/erTyrEw.mp4', 'https://i.imgur.com/UYLFjcR.mp4', 'https://i.imgur.com/jdJYK2O.mp4', 'https://i.imgur.com/AIA9vrm.mp4', 'https://i.imgur.com/QKnLrvP.mp4', 'https://i.imgur.com/7hKLSPB.mp4', 'https://i.imgur.com/EmfBvWX.mp4', 'https://i.imgur.com/0i4STd9.mp4', 'https://i.imgur.com/OmZM0ze.mp4', 'https://i.imgur.com/ZS1Hbe2.mp4', 'https://i.imgur.com/M3bhAWA.mp4', 'https://i.imgur.com/5y9tgcf.mp4', 'https://i.imgur.com/zhUmB3d.mp4', 'https://i.imgur.com/4EIzLWt.mp4', 'https://i.imgur.com/IcgkiFe.mp4', 'https://i.imgur.com/WedG886.mp4', 'https://i.imgur.com/RVXzj0V.mp4', 'https://i.imgur.com/paE073e.mp4', 'https://i.imgur.com/8pE9Uih.mp4', 'https://i.imgur.com/BZiuQKz.mp4', 'https://i.imgur.com/BwJzYhD.mp4', 'https://i.imgur.com/W09kb6T.mp4', 'https://i.imgur.com/DcBqjQ8.mp4', 'https://i.imgur.com/grGWgqo.mp4', 'https://i.imgur.com/bHX0L25.mp4', 'https://i.imgur.com/qXtUe52.mp4', 'https://i.imgur.com/kAM7wN2.mp4', 'https://i.imgur.com/qie9Vd1.mp4', 'https://i.imgur.com/wsMkzuo.mp4', 'https://i.imgur.com/RyoJRIT.mp4', 'https://i.imgur.com/IPEz5uI.mp4', 'https://i.imgur.com/13l5g8F.mp4', 'https://i.imgur.com/E09tqcv.mp4', 'https://i.imgur.com/xxiHcKY.mp4', 'https://i.imgur.com/nC1mA6f.mp4', 'https://i.imgur.com/ows1wQG.mp4', 'https://i.imgur.com/Ews5WSl.mp4', 'https://i.imgur.com/SwceptK.mp4', 'https://i.imgur.com/u2gvM87.mp4', 'https://i.imgur.com/wD6vyFO.mp4', 'https://i.imgur.com/26yaVex.mp4', 'https://i.imgur.com/ZtXFHDF.mp4', 'https://i.imgur.com/ScxQbQU.mp4', 'https://i.imgur.com/8Sf3Fv3.mp4', 'https://i.imgur.com/H8tb9g7.mp4', 'https://i.imgur.com/13aJE9h.mp4', 'https://i.imgur.com/5C6OXB0.mp4', 'https://i.imgur.com/PzmbnNI.mp4', 'https://i.imgur.com/dnKdIvG.mp4', 'https://i.imgur.com/lJ7xsCu.mp4', 'https://i.imgur.com/UPmWyke.mp4', 'https://i.imgur.com/1ktKby4.mp4', 'https://i.imgur.com/8fCReJy.mp4', 'https://i.imgur.com/J8s4VOC.mp4', 'https://i.imgur.com/W2cLSQ4.mp4', 'https://i.imgur.com/KWfES7N.mp4', 'https://i.imgur.com/uKGLLD1.mp4', 'https://i.imgur.com/zHvGORR.mp4', 'https://i.imgur.com/djZbftQ.mp4', 'https://i.imgur.com/rUr74af.mp4', 'https://i.imgur.com/dhk5qST.mp4', 'https://i.imgur.com/BHiKPlx.mp4', 'https://i.imgur.com/uN70zJX.mp4', 'https://i.imgur.com/fsfcRMd.mp4', 'https://i.imgur.com/kBNJ2zu.mp4', 'https://i.imgur.com/SwjfMiv.mp4', 'https://i.imgur.com/ikkzSO3.mp4', 'https://i.imgur.com/cEyOUeP.mp4', 'https://i.imgur.com/5Bu8TOy.mp4', 'https://i.imgur.com/jBSi5i5.mp4', 'https://i.imgur.com/0HzIGKe.mp4', 'https://i.imgur.com/GdLj12H.mp4', 'https://i.imgur.com/pHSRGcj.mp4', 'https://i.imgur.com/vUyjRgO.mp4', 'https://i.imgur.com/JQ3RaPg.mp4', 'https://i.imgur.com/MRewy01.mp4', 'https://i.imgur.com/iM6zdqW.mp4', 'https://i.imgur.com/5utk5sA.mp4', 'https://i.imgur.com/OmZM0ze.mp4', 'https://i.imgur.com/t8WYmzc.mp4', 'https://i.imgur.com/nOWja6R.mp4', 'https://i.imgur.com/SwceptK.mp4', 'https://i.imgur.com/W2cLSQ4.mp4', 'https://i.imgur.com/kAM7wN2.mp4', 'https://i.imgur.com/1ktKby4.mp4', 'https://i.imgur.com/4G3B2YR.mp4', 'https://i.imgur.com/Ews5WSl.mp4', 'https://i.imgur.com/13aJE9h.mp4', 'https://i.imgur.com/RVXzj0V.mp4', 'https://i.imgur.com/YcRpE9x.mp4', 'https://i.imgur.com/BZiuQKz.mp4', 'https://i.imgur.com/UPmWyke.mp4', 'https://i.imgur.com/28TYy8M.mp4', 'https://i.imgur.com/cEyOUeP.mp4', 'https://i.imgur.com/7awqO74.mp4', 'https://i.imgur.com/djZbftQ.mp4', 'https://i.imgur.com/jBSi5i5.mp4', 'https://i.imgur.com/pHSRGcj.mp4', 'https://i.imgur.com/erTyrEw.mp4', 'https://i.imgur.com/MRewy01.mp4', 'https://i.imgur.com/kBNJ2zu.mp4', 'https://i.imgur.com/JQ3RaPg.mp4', 'https://i.imgur.com/5wbUMkB.mp4', 'https://i.imgur.com/paE073e.mp4', 'https://i.imgur.com/SwjfMiv.mp4', 'https://i.imgur.com/7sk8loc.mp4', 'https://i.imgur.com/IjL6xT0.mp4', 'https://i.imgur.com/bHX0L25.mp4', 'https://i.imgur.com/dhk5qST.mp4', 'https://i.imgur.com/AIA9vrm.mp4', 'https://i.imgur.com/uKGLLD1.mp4', 'https://i.imgur.com/xDOOapQ.mp4', 'https://i.imgur.com/jdJYK2O.mp4', 'https://i.imgur.com/wsMkzuo.mp4', 'https://i.imgur.com/zhUmB3d.mp4', 'https://i.imgur.com/E09tqcv.mp4', 'https://i.imgur.com/26yaVex.mp4', 'https://i.imgur.com/RyoJRIT.mp4', 'https://i.imgur.com/PzmbnNI.mp4', 'https://i.imgur.com/DXfsbvT.mp4', 'https://i.imgur.com/M3bhAWA.mp4', 'https://i.imgur.com/RgqCvp5.mp4', 'https://i.imgur.com/grGWgqo.mp4', 'https://i.imgur.com/N7XCSZO.mp4', 'https://i.imgur.com/iM6zdqW.mp4', 'https://i.imgur.com/7hKLSPB.mp4', 'https://i.imgur.com/0i4STd9.mp4', 'https://i.imgur.com/fTlaKRU.mp4', 'https://i.imgur.com/ows1wQG.mp4', 'https://i.imgur.com/13l5g8F.mp4', 'https://i.imgur.com/8fCReJy.mp4', 'https://i.imgur.com/dnKdIvG.mp4', 'https://i.imgur.com/noPL22M.mp4', 'https://i.imgur.com/uN70zJX.mp4', 'https://i.imgur.com/xxiHcKY.mp4', 'https://i.imgur.com/IPEz5uI.mp4', 'https://i.imgur.com/DcBqjQ8.mp4', 'https://i.imgur.com/WedG886.mp4', 'https://i.imgur.com/5y9tgcf.mp4', 'https://i.imgur.com/RBFJkPc.mp4', 'https://i.imgur.com/W09kb6T.mp4', 'https://i.imgur.com/H8tb9g7.mp4', 'https://i.imgur.com/vUyjRgO.mp4', 'https://i.imgur.com/LdUi4r3.mp4', 'https://i.imgur.com/wD6vyFO.mp4', 'https://i.imgur.com/qXtUe52.mp4', 'https://i.imgur.com/5C6OXB0.mp4', 'https://i.imgur.com/cg9vJjL.mp4', 'https://i.imgur.com/u2gvM87.mp4', 'https://i.imgur.com/KWfES7N.mp4', 'https://i.imgur.com/ikkzSO3.mp4', 'https://i.imgur.com/s9wtmQD.mp4', 'https://i.imgur.com/5Bu8TOy.mp4', 'https://i.imgur.com/BwJzYhD.mp4', 'https://i.imgur.com/zHvGORR.mp4', 'https://i.imgur.com/UfOMJga.mp4', 'https://i.imgur.com/GYPUtkj.mp4', 'https://i.imgur.com/Pu6r4Jz.mp4', 'https://i.imgur.com/4EIzLWt.mp4', 'https://i.imgur.com/ep5zfed.mp4', 'https://i.imgur.com/qie9Vd1.mp4', 'https://i.imgur.com/8Sf3Fv3.mp4', 'https://i.imgur.com/J2nVQe4.mp4', 'https://i.imgur.com/K9kmYRS.mp4', 'https://i.imgur.com/nC1mA6f.mp4', 'https://i.imgur.com/GdLj12H.mp4', 'https://i.imgur.com/8pE9Uih.mp4', 'https://i.imgur.com/ZtXFHDF.mp4', 'https://i.imgur.com/rUr74af.mp4', 'https://i.imgur.com/fsfcRMd.mp4', 'https://i.imgur.com/QKnLrvP.mp4', 'https://i.imgur.com/UYLFjcR.mp4', 'https://i.imgur.com/J8s4VOC.mp4', 'https://i.imgur.com/lrRdX37.mp4', 'https://i.imgur.com/BHiKPlx.mp4', 'https://i.imgur.com/EmfBvWX.mp4', 'https://i.imgur.com/IcgkiFe.mp4', 'https://i.imgur.com/lJ7xsCu.mp4', 'https://i.imgur.com/ZS1Hbe2.mp4', 'https://i.imgur.com/ScxQbQU.mp4', 'https://i.imgur.com/a84XWkx.mp4', 'https://i.imgur.com/gnGEHrN.mp4', 'https://i.imgur.com/0HzIGKe.mp4',
        "https://drive.google.com/uc?export=download&id=1cyB6E3z4-_Dr4mlYFB87DlWkUlC_KvrR",
            "https://drive.google.com/uc?export=download&id=1Q5L8SGKYpNrXtJ6mffcwMA9bcUtegtga",
            "https://drive.google.com/uc?export=download&id=1u8JzKCTubRhnh0APo2mMob-mQM0CoNYj",
            "https://drive.google.com/uc?export=download&id=1JBIo966g0MmUT27S1yc0B06lASt4dD9V",
            "https://drive.google.com/uc?export=download&id=1w_HUyAFHnVfkUl8XLY01pxs8dnmQNEVn",
            "https://drive.google.com/uc?export=download&id=1EoeMITZrSNB1PpPjsh5cmsFzbjMZKH2c",
            "https://drive.google.com/uc?export=download&id=1Kh4qvle57FlMjcam-JNxTQtPZe2uxrJ8",
            "https://drive.google.com/uc?export=download&id=1KtyLzqbyJpq5_ke0Cb6gD89ZNf0NQm0t",
            "https://drive.google.com/uc?export=download&id=1vy0ZldnlTqXgwJ36HxOXC9hLObgNkTZ-",
            "https://drive.google.com/uc?export=download&id=1hPZhzKm_uj6HRsEdFAH1lPFFF8vC-lTB",
            "https://drive.google.com/uc?export=download&id=1AJCeDc-MvtvSspz7oX98ywzDB3Z29bSu",
            "https://drive.google.com/uc?export=download&id=1reVD_c5kK29iTdLAu_7sYFBB0hzrRkAx",
            "https://drive.google.com/uc?export=download&id=1vmnlCwp40mmjW6aFob_wD_U1PmOgRYst",
            "https://drive.google.com/uc?export=download&id=1R0n8HQgMEEAlaL6YJ3JiDs_6oBdsjN0e",
            "https://drive.google.com/uc?export=download&id=1tUJEum_tf79gj9420mHx-_q7f0QP27DC",
            "https://drive.google.com/uc?export=download&id=1hAKRt-oOSNnUNYjDQG-OF-tdzN_qJFoR",
            "https://drive.google.com/uc?export=download&id=1HrvT5jaPsPi66seHCLBkRbTziXJUkntn",
            "https://drive.google.com/uc?export=download&id=1v8k2YxBme5zEumlNiLIry5SDMryfkBts",
            "https://drive.google.com/uc?export=download&id=1x01XDJoJMbtUjWztomF25Ne1Up4cWQoC",
            "https://drive.google.com/uc?export=download&id=12j65dstfkMUHMSmQU8FnZi2RyHPHJipx",
            "https://drive.google.com/uc?export=download&id=13ImpZl3aLHpwlYhWvjKLfiRvFsK3kl5z",
            "https://drive.google.com/uc?export=download&id=1EdFmtprVtt652PDocRlgeXXxIQRYTSQw",
            "https://drive.google.com/uc?export=download&id=1EdFmtprVtt652PDocRlgeXXxIQRYTSQw",
            "https://drive.google.com/uc?export=download&id=1QdLGspkvM-Gf1SHh2fJf8zPbrZaURTJs",
            "https://drive.google.com/uc?export=download&id=1RyG2Lh1cp6lq9IEIr4vVaDyu21RW_pav",
            "https://drive.google.com/uc?export=download&id=1zlmaoBVrk9GKPZ_2XYZzzQkFMdiszSzL",
            "https://drive.google.com/uc?export=download&id=1rcxnb5U4gnwSiZhOcsbahqzE003LKYXc",
            "https://drive.google.com/uc?export=download&id=12cjBYkdDR4BMKj1H4aV6rfa7sVuoU3eU",
            "https://drive.google.com/uc?export=download&id=1aBHnJ7AgkQKC9RBIycVN-l6F4kdeX3hf",
            "https://drive.google.com/uc?export=download&id=13X4yhx9Nr8tIleXtxC7bV1Rfjt1FXeDv",
            "https://drive.google.com/uc?export=download&id=1uuajuhhLPlLXlSRBdzmwGfIMAV6WwW5u",
            "https://drive.google.com/uc?export=download&id=1wkoC5kbo4GuDEqoEXoz40DwZi6OMKiSI", 

            // Add more video links here
        ];

        const randomIndex = Math.floor(Math.random() * link.length);
        const randomVideo = link[randomIndex];
        const videoName = `anime_clip_${Date.now()}.mp4`;
        const tempPath = path.join(process.cwd(), "temp", videoName);

        const response = await axios.get(randomVideo, { responseType: "stream" });
        const writeStream = fs.createWriteStream(tempPath);

        response.data.pipe(writeStream);

        writeStream.on("finish", async () => {

          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          
            await api.sendMessage({
                body: 'إستمتع..!🤍',
                attachment: fs.createReadStream(tempPath),
            }, event.threadID);

            fs.unlinkSync(tempPath); // Delete the temporary file after sending
            api.unsendMessage(sentMessage.messageID);
        });

        writeStream.on("error", (error) => {
            console.error("Error downloading video:", error);
            api.sendMessage("حدث خطأ أثناء تحميل المقطع الصوتي.", event.threadID);
            api.unsendMessage(sentMessage.messageID);
        });
    } catch (error) {
        console.error("Error fetching video:", error);
        api.sendMessage("حدث خطأ أثناء جلب مقطع الفيديو.", event.threadID);
        api.unsendMessage(sentMessage.messageID);
    }
}

export default {
    name: "مقطع_أنمي",
    author: "kaguya project",
    role: "member",
    description: "يقوم بإرسال مقاطع أنمي عشوائية",
    execute: sendRandomAnimeClip
};