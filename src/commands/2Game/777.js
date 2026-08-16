class JackpotGame {
  name = "سلوت";
  author = "Shadow Garden Project";
  cooldowns = 10;
  description = "مغامرة رهانات فاكهية مع فرص الفوز بالجائزة الكبرى !";
  role = "member";
  aliases = ["مراهنة", "رهان"];

  async execute({ event, Economy, args }) {
    const MIN_BET_AMOUNT = 100;
    const MAX_BET_AMOUNT = 1000;
    const SLOT_ITEMS = ["🍇", "🍉", "🍊", "🍏", "7⃣", "🍓", "🍒", "🍌", "🥝", "🥑", "🌽"];
    const { increase, decrease, getBalance } = Economy;

    const userMoney = (await getBalance(event.senderID)).data;

    const [moneyBet] = args;

    if (isNaN(moneyBet) || moneyBet <= 0) {
      return global.shadow.reply(" ⚠️ | مبلغ الرهان غير كافي \n أنظر إلى رصيدك");
    }

    if (moneyBet > userMoney) {
      return global.shadow.reply(`أنت تحتاج ${moneyBet - userMoney} دولار من أجل بدأ الرهان`);
    }

    if (moneyBet < MIN_BET_AMOUNT || moneyBet > MAX_BET_AMOUNT) {
      return global.shadow.reply(` ⚠️ | مبلغ الرهان غير صالح!\n على الأقل قم بالمراهنة ب : ${MIN_BET_AMOUNT} دولار\nالحد الأقصى : ${MAX_BET_AMOUNT}`);
    }

    const spins = Array.from({ length: 3 }, () => SLOT_ITEMS[Math.floor(Math.random() * SLOT_ITEMS.length)]);

    var winMultiplier = calculateWinMultiplier(spins);

    const hasJackpot = Math.random() < 0.05;

    if (hasJackpot) {
      winMultiplier = 10;
    }

    const winnings = moneyBet * winMultiplier;
    const isWin = winMultiplier > 1;

    if (isWin) {
      await increase(winnings, event.senderID);
      global.shadow.reply(`🎰 ${spins.join(" | ")} 🎰\n تهانينا 🥳🥳! لقد فزت ب ${winnings} دولار`);
    } else {
      await decrease(moneyBet, event.senderID);
      global.shadow.reply(`🎰 ${spins.join(" | ")} 🎰\nآسف، لقد خسرت ${moneyBet} دولار`);
    }

    if (hasJackpot) {
      global.shadow.reply("🎉🎉🎉 لقد فزت بالجائزة الكبرى! 🎉🎉🎉\nلقد فزت بجائزة رائعة!");
    }
  }
}

function calculateWinMultiplier(spins) {
  if (spins.every((symbol) => symbol === "7⃣")) {
    return 10;
  } else if (spins[0] === spins[1] && spins[1] === spins[2]) {
    return 3;
  } else if (spins[0] === spins[1] || spins[0] === spins[2] || spins[1] === spins[2]) {
    return 2;
  } else {
    return 1;
  }
}

export default new JackpotGame();
