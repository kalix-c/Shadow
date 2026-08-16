import { log } from "../logger/index.js";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    // جلب بيانات المجموعة
    var threads = (await Threads.find(event.threadID))?.data?.data;

    // التحقق من وجود بيانات المجموعة
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe": {
        // إذا تم طرد البوت من المجموعة
        if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
          await Threads.remove(event.threadID);
          return log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: `تم حذف بيانات المجموعة مع المعرف: ${event.threadID} لأن البوت تم طرده.`,
              color: "green",
            },
          ]);
        }
        // تحديث عدد الأعضاء بعد خروج شخص
        await Threads.update(event.threadID, {
          members: +threads.members - 1,
        });
        // إرسال رسالة إشعار بخروج شخص
        api.sendMessage(event.logMessageBody, event.threadID);
        break;
      }

      case "log:subscribe": {
        // إذا تمت إضافة البوت إلى المجموعة
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة التوصيل
          api.unsendMessage(event.messageID);

          // تغيير اسم البوت عند إضافته إلى المجموعة
          const botName = "⚡ 𝐒𝐇𝐀𝐃𝐎𝐖 ⚡";
          await api.changeNickname(
            `》 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID(),
          );

          // رسالة الترحيب العربية الخاصة بهوية Shadow
          const welcomeMessage = `┌───── ～✦～ ─────┐\n🌑 | تم الارتباط بنجاح من خلف الظلال\n❏ البادئة: 『.』\n❏ اسم البوت: 『${botName}』\n❏ المطور: 『محمد الشاوني』\n❏ رابط المطور: https://www.facebook.com/profile.php?id=61584561724670\n╼╾─────⊹⊱⊰⊹─────╼╾\nاكتب .اوامر لعرض عمليات الحديقة\n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🌑 SHADOW GARDEN 🌑〙\n└───── ～✦～ ─────┘`;

          await api.sendMessage(welcomeMessage, event.threadID);

        } else {
          // إذا تم إضافة أعضاء آخرين
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          // تحديث عدد الأعضاء بعد إضافة أشخاص
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
          // إرسال رسالة إشعار بإضافة أشخاص
          api.sendMessage(event.logMessageBody, event.threadID);
        }
        break;
      }
    }
  },
};
