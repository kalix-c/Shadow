async function execute({ api, event, args }) {
  const choices = ["✊", "✋", "✌️"];
  const userChoice = args[0];

  if (!userChoice || !choices.includes(userChoice)) {
    api.sendMessage("يرجى اختيار أي منهما ✊, ✋, أو ✌️!", event.threadID);
    return;
  }

  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  api.sendMessage(`أنت إخترت ${userChoice}. أنا إخترت ${botChoice}.`, event.threadID);

  if (userChoice === botChoice) {
    api.sendMessage("إنها ربطة عنق! ⚖️", event.threadID);
  } else if (
    (userChoice === "✊" && botChoice === "✌️") ||
    (userChoice === "✋" && botChoice === "✊") ||
    (userChoice === "✌️" && botChoice === "✋")
  ) {
    api.sendMessage("تهانينا! لقد فزت! 🎉", event.threadID);
  } else {
    api.sendMessage("انا فزت! حظ أوفر في المرة القادمة! 😎", event.threadID);
  }
}

export default {
  name : "حجر_ورقة_مقص",
  author: "ChatGPT",
  role: "member",
  description: "لعبة بسيطة للحجر ورقة مقص مع البوت.",
  execute,
};