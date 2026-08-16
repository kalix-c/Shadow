import fs from "fs";
import path from "path";
import axios from "axios";

const tempImageFilePath = process.cwd() + "/cache/tempImage.jpg";
const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "اعلام",
    author: "kaguya project",
    role: "member",
    description: "أرسل صورة واسأل المستخدمين عنها.",
    execute: async function ({ api, event, Economy }) {
        const questions = [
          
    { image: "https://i.pinimg.com/originals/6f/a0/39/6fa0398e640e5545d94106c2c42d2ff8.jpg", answer: "العراق" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/256px-Flag_of_Brazil.svg.png", Answer: "البرازيل" },
    { image: "https://i.pinimg.com/originals/66/38/a1/6638a104725f4fc592c1b832644182cc.jpg", answer: "فلسطين" },
    { image: "https://i.pinimg.com/originals/f9/47/0e/f9470ea33ff6fbf794b0b8bb00a5ccb4.jpg", answer: "المغرب" },
    { image: "https://i.imgur.com/YLdLU6g.png", Answer: "الصومال" },
    { image: "https://i.pinimg.com/originals/eb/cd/cc/ebcdccc8ea5ecec70fcb727a8581bd0e.jpg", answer: "اخرائيل" },
    { image: "https://i.pinimg.com/originals/0e/10/d2/0e10d2240dd28af2eff27ce0fa8b5b8d.jpg", answer: "اليابان" },
    { image: "https://i.pinimg.com/originals/e8/8e/e7/e88ee7f3ba7ff9181aabdd9520bdfa64.jpg", answer: "الجزائر" },
    { image: "https://i.pinimg.com/564x/21/47/ba/2147ba2a3780fb5b9395af5a0eb30deb.jpg", answer: "سوريا" },
    { image: "https://i.pinimg.com/564x/a9/e9/c3/a9e9c3a54aa9fbe2400cc85c8dc45dc3.jpg", answer: "ليبيا" },
    { image: "https://i.pinimg.com/564x/72/d7/d9/72d7d9586177d3cd05adbd0d9f494b20.jpg", answer: "السعودية" },
    { image: "https://i.pinimg.com/564x/e1/2d/13/e12d13ee06067dc324086ac1cf699a4f.jpg", answer: "تونس" },
    { image: "https://i.pinimg.com/564x/03/d1/24/03d1245ce41669d15ab285c31e1b2b4c.jpg", answer: "موريتانيا" },
    { image: "https://i.pinimg.com/564x/69/b2/0a/69b20a2431b0f6105661f1d4d5d7509c.jpg", answer: "كوريا الجنوبية" },
    { image: "https://i.pinimg.com/236x/53/76/b4/5376b4793712faa060cabb4fe8e85b20.jpg", answer: "الصين" },
    { image: "https://i.pinimg.com/564x/8a/40/f6/8a40f62eadc052d92641ec1f32f67053.jpg", answer: "الارجنتين" },
    { image: "https://i.pinimg.com/236x/c8/aa/36/c8aa36dadd87d63233ef72e84aebe694.jpg", answer: "كندا" },
    { image: "https://i.pinimg.com/564x/d3/28/0f/d3280f4c8423cb190eebadd0acc6c88e.jpg", answer: "فرنسا" },
    { image: "https://i.pinimg.com/236x/8f/ef/24/8fef241778c6e4c6bfcdab543567adff.jpg", answer: "امريكا" },
    { image: "https://i.pinimg.com/236x/41/cf/c8/41cfc821d08adfdee59d6a3503ba0c0b.jpg", answer: "لبنان" },
    { image: "https://i.pinimg.com/564x/49/1d/40/491d4027acb78b7d4bad83ed011cb0db.jpg", answer: "البوسنة" },
    { image: "https://i.pinimg.com/564x/2d/2d/6e/2d2d6ec65a733e1a04c4442ed1aad404.jpg", answer: "الكويت" },
    { image: "https://i.pinimg.com/564x/94/46/15/94461526e1bdd96f36daf2a788c51ea7.jpg", answer: "الاردن" },
    { image: "https://i.pinimg.com/564x/d0/da/17/d0da173c43093d6dd7d557bdbc8fef65.jpg", answer: "السودان" },
   { image: "https://i.pinimg.com/564x/4f/f7/36/4ff736715682f408b3683cbc89c8e166.jpg", answer: "بريطانيا" },
{ image: "https://i.pinimg.com/236x/40/0a/7a/400a7a4ed35c8e7e847d9a105fbf098a.jpg", answer: "الهند" },
{ image: "https://i.pinimg.com/564x/45/a1/52/45a152547ef5afc0875d705a59d28573.jpg", answer: "بولندا" },
{ image: "https://i.pinimg.com/564x/fa/cb/ec/facbecb0fdabf0d22b0e4c2dbbac7c63.jpg", answer: "بورتوريكو" },
{ image: "https://i.pinimg.com/564x/0a/eb/02/0aeb028d568adf3772ded313cceb288d.jpg", answer: "الدنمارك" },
{ image: "https://i.pinimg.com/564x/d8/31/f1/d831f19af6450de0859baf975581994c.jpg", answer: "المانيا" },
{ image: "https://i.pinimg.com/564x/6a/b5/fe/6ab5fe27d6b1ca8b5d028afee1a6f7e8.jpg", answer: "سويسرا" },
{ image: "https://i.pinimg.com/564x/8e/52/a7/8e52a79e25ea5b8da3cc1c5ca199c2d5.jpg", answer: "قطر" },
{ image: "https://i.pinimg.com/236x/71/16/33/711633aa590dba2b6b55c5dec8cf00a8.jpg", answer: "ماليزيا" },
{ image: "https://i.pinimg.com/236x/2a/cb/7d/2acb7d9371550e4f145d5a1a841a41cb.jpg", answer: "فيتنام" },
{ image: "https://i.pinimg.com/236x/2c/60/86/2c608693f21531817c6b10129840e9b3.jpg", answer: "المكسيك" },
{ image: "https://i.pinimg.com/236x/8a/d1/29/8ad12979f384bc252061056877f7c06f.jpg", answer: "مدغشقر" },
{ image: "https://i.pinimg.com/236x/56/1a/4c/561a4c106fbdf99129e369c4fc3142c4.jpg", answer: "استراليا" },
{ image: "https://i.pinimg.com/564x/95/49/47/9549475724c609dae42415c7d5e5d099.jpg", answer: "تركيا" },
{ image: "https://i.pinimg.com/236x/81/62/9c/81629c2e2898a5eef1de2c575545199d.jpg", answer: "اوكرانيا" },
{ image: "https://i.pinimg.com/236x/1e/15/25/1e15259b4341aa9441d189defe3c551c.jpg", answer: "قبرص" },
{ image: "https://i.pinimg.com/236x/51/90/1b/51901b23f7992d2b77f8a4f442e5ff96.jpg", answer: "جورجيا" },
{ image: "https://i.pinimg.com/236x/cc/9a/ff/cc9aff5061ab431a71cd71c271f05f06.jpg", answer: "كينيا" },
{ image: "https://i.pinimg.com/236x/6a/d5/fc/6ad5fc6cda8784b1af22ebb1a63ddd9d.jpg", answer: "استونيا" },
{ image: "https://i.pinimg.com/236x/17/cc/ec/17ccecec86eb5fe2d0c75c7c85bc7b5d.jpg", answer: "السويد" },
{ image: "https://i.pinimg.com/236x/ce/5f/a9/ce5fa91dd4f2338af1523a0d3d661bc2.jpg", answer: "هولندا" },
{ image: "https://i.pinimg.com/236x/ac/26/b9/ac26b924d24ebfc690a697307eb143b2.jpg", answer: "بلجيكا" },
{ image: "https://i.pinimg.com/236x/97/8c/b5/978cb569075fda132c628732a4d2b49d.jpg", answer: "اليونان" },
{ image: "https://i.pinimg.com/236x/8c/4b/bd/8c4bbd6d9683248841c92634e4aba822.jpg", answer: "ايرلندا" },
{ image: "https://i.imgur.com/qI1a4UJ.png", answer: "كوبا" },
{ image: "https://i.imgur.com/cIj6C6m.jpeg", answer: "ايطاليا" },
{ image: "https://i.imgur.com/mZMfaxX.png", answer: "الفلبين" },
{ image: "https://i.imgur.com/nkZT0rg.png", answer: "كوريا الشمالية" },
{ image: "https://i.imgur.com/eQaFh0P.png", answer: "التايلاند" },
{ image: "https://i.imgur.com/7Hr8wej.png", answer: "التشيك" },
{ image: "https://i.imgur.com/uct5SN9.png", answer: "النمسا" },
{ image: "https://i.imgur.com/PE2ZWkw.png", answer: "بلجيكا" },
{ image: "https://i.imgur.com/DXYcnuy.png", answer: "السويد" },
{ image: "https://i.imgur.com/FZwz4Fz.png", answer: "كرواتيا" },
{ image: "https://i.imgur.com/pEAjugV.png", answer: "لوكسمبورغ" },
{ image: "https://i.imgur.com/2tJ3C48.png", answer: "سنغافورة" }
            ];

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const correctAnswer = randomQuestion.answer;

        const imageResponse = await axios.get(randomQuestion.image, { responseType: "arraybuffer" });
        fs.writeFileSync(tempImageFilePath, Buffer.from(imageResponse.data, "binary"));

        const attachment = [fs.createReadStream(tempImageFilePath)];
        const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\t\tما اسم علم هذه الدولة ؟\n▱▱▱▱▱▱▱▱▱▱▱▱▱`;

        api.sendMessage({ body: message, attachment }, event.threadID, async (error, info) => {
            if (!error) {
                try {
                    await Economy.getBalance(event.senderID); // التحقق من وجود معلومات الاقتصاد للمستخدم
                    client.handler.reply.set(info.messageID, {
                        author: event.senderID,
                        type: "reply", // تحديد نوع الرد
                        name: "اعلام",
                        correctAnswer: correctAnswer, // إضافة الإجابة الصحيحة
                        unsend: true
                    });
                } catch (e) {
                    console.error("خطأ في التحقق من معلومات الاقتصاد للمستخدم:", e);
                }
            } else {
                console.error("خطأ في إرسال الرسالة:", error);
            }
        });
    },
    onReply: async function ({ api, event, reply, Economy }) {
        if (reply && reply.type === "reply" && reply.name === "اعلام") { // التحقق من وجود الرد ونوعه
            const userAnswer = event.body.trim().toLowerCase();
            const correctAnswer = reply.correctAnswer && reply.correctAnswer.toLowerCase(); // التحقق من وجود الإجابة الصحيحة

            if (correctAnswer) {
                try {
                    const userInfo = await api.getUserInfo(event.senderID);
                    const userName = userInfo ? userInfo[event.senderID].name : 'المستخدم'; // افتراضي 'المستخدم' إذا لم يتم العثور على اسم المستخدم

                    if (userAnswer === correctAnswer) {
                        const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                        const userPoints = pointsData[event.senderID] || { name: userName, points: 0 }; // تحقق من وجود بيانات المستخدم، وإذا لم يكن موجودًا، قم بإنشاء بيانات جديدة
                        userPoints.points += 50; // زيادة عدد النقاط
                        pointsData[event.senderID] = userPoints; // تحديث بيانات المستخدم في الكائن
                        fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2)); // كتابة البيانات إلى الملف

                        api.sendMessage(`✅ | تهانينا يا ${userName} 🥳إجابتك صحيحة، وحصلت بذالك على『50 』 نقطة`, event.threadID);
                        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                        api.unsendMessage(reply.messageID);
                    } else {
                     api.sendMessage(` ❌ |آسفة إجابتك خاطئة`, event.threadID); 
                        api.setMessageReaction("❌", event.messageID, (err) => {}, true); } } catch (e) { console.error("حدث خطأ أثناء معالجة الرد:", e); }
            } else { console.error("الإجابة الصحيحة غير معروفة"); }
        } else { console.error("رد غير معروف"); }fs.unlinkSync(tempImageFilePath);
}
};