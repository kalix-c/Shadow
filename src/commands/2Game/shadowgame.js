export default {
  name: "ألعاب_الظل",
  aliases: ["لعبة_الظل", "فعاليات", "مبارزة_الظل"],
  role: "user",
  cooldowns: 10,
  description: "ألعاب وفعاليات تفاعلية من حديقة الظل.",

  execute: async ({ api, event, Users, Exp, args }) => {
    const { threadID, messageID, senderID } = event;
    let userData = await Users.find(senderID);
    if (!userData.status) {
      await Users.create(senderID);
      userData = await Users.find(senderID);
    }

    if (!userData.status) {
      return api.sendMessage("تعذر تجهيز ملف لاعب الظل.", threadID, messageID);
    }

    const action = String(args?.[0] || "مساعدة").toLowerCase();
    const isHelp = ["مساعدة", "قائمة", "الالعاب", "الألعاب"].includes(action);

    if (isHelp) {
      const helpMsg = "⚡ ألعاب وفعاليات حديقة الظل ⚡\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "• .ألعاب_الظل مبارزة — مواجهة وحش الظل وربح العملات.\n" +
        "• .ألعاب_الظل ذري — إطلاق الطاقة الكامنة باحتمال فوز كبير.\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "كل مواجهة تُسجل في سجلك داخل الحديقة.";
      return api.sendMessage(helpMsg, threadID, messageID);
    }

    const currentData = userData.data?.data || {};
    const currentMoney = Number(currentData.money || 0);
    const currentStats = currentData.stats || {};

    const recordWin = async (reward, expGain) => {
      await Users.update(senderID, {
        money: currentMoney + reward,
        stats: {
          ...currentStats,
          gamesWon: Number(currentStats.gamesWon || 0) + 1
        }
      });
      if (Exp?.increase) await Exp.increase(senderID, expGain);
    };

    if (["مبارزة", "مواجهة", "قتال"].includes(action)) {
      const reward = Math.floor(Math.random() * 501) + 100;
      const expGain = Math.floor(Math.random() * 31) + 10;
      await recordWin(reward, expGain);
      return api.sendMessage(
        `⚔️ مبارزة الظل\nلقد هزمت وحشًا من أعماق الحديقة.\n💰 المكافأة: +${reward} عملة ظل\n📈 الخبرة: +${expGain} XP`,
        threadID,
        messageID
      );
    }

    if (["ذري", "اتمك", "الطاقة", "القوة"].includes(action)) {
      const success = Math.random() >= 0.4;
      if (!success) {
        return api.sendMessage("🌑 لم تكتمل طاقة الظل هذه المرة. اجمع تركيزك وحاول لاحقًا.", threadID, messageID);
      }

      const reward = 1500;
      const expGain = 75;
      await recordWin(reward, expGain);
      return api.sendMessage(
        `⚡ أنا ذري!\nاهتزت عوالم الظل أمام طاقتك الكامنة.\n💰 الجائزة الكبرى: +${reward} عملة ظل\n📈 الخبرة: +${expGain} XP`,
        threadID,
        messageID
      );
    }

    return api.sendMessage("الأمر غير معروف. اكتب .ألعاب_الظل لعرض الألعاب المتاحة.", threadID, messageID);
  }
};
