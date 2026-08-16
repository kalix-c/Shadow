export default {
  name: "مهمة_سرية",
  aliases: ["مهمة"],
  role: "user",
  cooldowns: 15,
  description: "إرسال أعضاء الحديقة في مهمة استخباراتية لجمع عملات الظل والخبرة.",

  execute: async ({ api, event, Users, Exp }) => {
    const { senderID, threadID, messageID } = event;
    let userData = await Users.find(senderID);

    if (!userData.status) {
      await Users.create(senderID);
      userData = await Users.find(senderID);
    }

    if (!userData.status) {
      return api.sendMessage("تعذر تجهيز ملف عضو الحديقة حاليًا.", threadID, messageID);
    }

    const missions = [
      "التسلل إلى قاعدة طائفة ديابولوس وسرقة وثائق سرية.",
      "إنقاذ حليف للحديقة من شوارع العاصمة الملكية.",
      "مراقبة تحركات اللوردات الثلاثة دون كشف الهوية.",
      "القضاء على وحش سحري ظهر في أعماق المتاهة."
    ];

    const operation = missions[Math.floor(Math.random() * missions.length)];
    const reward = Math.floor(Math.random() * 801) + 200;
    const expGain = Math.floor(Math.random() * 41) + 10;
    const currentMoney = Number(userData.data?.data?.money || 0);

    await Users.update(senderID, { money: currentMoney + reward });
    const xpResult = Exp?.increase
      ? await Exp.increase(senderID, expGain)
      : { status: true, data: { currentLevel: userData.data?.data?.level || 1 } };

    const level = xpResult?.data?.level || xpResult?.data?.currentLevel || userData.data?.data?.level || 1;
    const levelMessage = xpResult?.status === "level_up" ? "\n⬆️ تمت ترقيتك إلى مستوى جديد!" : "";

    const msg = `🌑 تقرير المهمة السرية 🌑\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⚔️ العملية: ${operation}\n` +
      `🎯 النتيجة: نجاح باهر في الظلال!\n` +
      `💰 المكافأة: +${reward} عملة ظل\n` +
      `📈 الخبرة: +${expGain} | المستوى: ${level}${levelMessage}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `نحن نتحرك من خلف الكواليس.`;

    return api.sendMessage(msg, threadID, messageID);
  }
};
