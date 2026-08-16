export default {
  name: "تحية",
  author: "البوت",
  role: "member",
  aliases:["السلام عليكم","سلام","السلام عليكم ورحمة الله وبركاته"],
  description: "رد السلام",
  execute: async function({ api, event }) {
    try {
      api.setMessageReaction("💖", event.messageID, (err) => {}, true);

      api.sendMessage({
        body: "〘وعــلـ(✋)ـيــكـم الــ(💜)ـســلام وݛحـٍّْـٍّْ⁽😘ــمــة الًـًٍۖـٍـٍۖ(☝)ٍۖـًٍٍٍّـًٍلۖهًٍۖۂ وبـۗـۗـۗـۗـۗـۗركۧۧــۧۧۧۧۧـۗـۗ(ۗ😇)ـۗـۗاتهۂ〙"
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error sending message:', error);
      api.sendMessage('❌ | حدث خطأ أثناء إرسال الرسالة.', event.threadID, event.messageID);
    }
  }
};
