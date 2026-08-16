export default {
  name: "رصيدي",
  author: "Thiệu Trung Kiên",
  cooldowns: 5,
  description: "يعرض رصيدك المالي أو رصيد شخص آخر!",
  role: "member",
  aliases:["رصيد"],
  async execute({ api, event, Economy, args }) {
    try {
      let targetID = event.senderID; // افتراضيًا، نبدأ برصيد المستخدم الحالي

      // التحقق مما إذا كان هناك رد على شخص آخر
      if (event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        // التحقق مما إذا تم ذكر شخص آخر في الرسالة
        targetID = Object.keys(event.mentions)[0];
      }

      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID].name;

      const balance = await Economy.getBalance(targetID);
      const money = balance.data; // رصيد المستخدم

      let replyMessage = `رصيد ${targetID === event.senderID ? "ك" : ` ${userName}`} الحالي هو: ${money} دولار`;

      // قم بإرسال الرد
      return api.sendMessage(replyMessage, event.threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | لقد حدث خطأ، رجاءً أعد المحاولة لاحقًا!", event.threadID);
    }
  },
};
