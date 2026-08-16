export default {
  name: "المستخدم",
  author: "Kaguya Project",
  cooldowns: 0,
  description: "حظر أو رفع الخظر عن مستخدم من إستخدام البوت",
  role: "owner",
  aliases: ["العضو", "banuser"],
  execute: async ({ api, event, Users, args }) => {
    var [type] = args;
    switch (type) {
      case "حظر": {
        return api.sendMessage(`⚠️ |الرجاء إدخال سبب الحظر  `, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "المستخدم",
            author: event.senderID,
            type: "ban",
          });
        });
      }
      case "رفع": {
        return api.sendMessage(`يرجى عمل منشن على الشخص الذي تريد رفع الحظر عنه، على سبيل المثال : @1 @2 ( يمكن وضع منشن على أعضاء كثر في نفس الوقت )`, event.threadID, (err, info) => {
          client.handler.reply.set(info.messageID, {
            name: "المستخدم",
            author: event.senderID,
            type: "confirm",
            choose: "unban",
          });
        });
      }
    }
  },
  onReply: async ({ api, event, Users, reply }) => {
    switch (reply.type) {
      case "حظر": {
        return api.sendMessage(
          `يمكنك رفع الخظر عن المستخدم بعمل منشن  له أو لمجموعة من الاشخاص في نفس الوقت على سبيل المثال: @1 @2 ( منشن لأكثر من واحد )`,
          event.threadID,
          (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "المستخدم",
              author: event.senderID,
              type: "confirm",
              choose: "ban",
              reason: event.body,
            });
          },
          event.messageID
        );
      }
      case "تأكيد": {
        var msg = "",
          listUID = event.mentions;
        if (!Object.keys(listUID).length) {
          return api.sendMessage(` ⚠️ |مطلوب معرف المستخدم ${reply.choose == "ban" ? "ban" : "unban"} غير صالح، قم بالرد على هذه الرسالة عن طريق الإشارة إلى المستخدم الذي تريد حظره\n\nالمستخدم : @1 @2`, event.threadID, (err, info) => {
            client.handler.reply.set(info.messageID, {
              name: "المستخدم",
              author: event.senderID,
              type: "confirm",
              choose: reply.choose,
              reason: event.body,
            });
          });
        }
        for (let [uid, name] of Object.entries(listUID)) {
          var dataUser = await Users.ban(uid, { status: reply.choose == "ban" ? true : false, reason: reply.choose == "ban" ? reply.reason : "" });
          dataUser.status ? (msg += `${uid} - ✅ (${name})\n`) : (msg += `${uid} - ❌ (باطل)\n`);
        }
        return api.sendMessage(`[ ${reply.choose == "ban" ? "BAN USER" : "UNBAN USER"} ]\n` + msg + `\n${reply.choose == "ban" ? `\nسبب الحظر : ${reply.reason}` : ""}\nالمجموع : ${Object.keys(listUID).length} مستخدم\n✅ : بنجاح.\n❌ : فشل\n(يرجع الفشل إلى عدم وجود بيانات مستخدم في قاعدة البيانات)`, event.threadID, event.messageID);
      }
    }
  },
};
