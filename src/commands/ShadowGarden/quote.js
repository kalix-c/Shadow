import assets from "../../config/assets.js";

export default {
  name: "حكمة",
  aliases: ["اقتباس", "حكم"],
  role: "user",
  cooldowns: 5,
  description: "استعراض حكمة من ظلال سيد الظل.",

  execute: async ({ api, event }) => {
    const quotes = Array.isArray(assets?.quotes) && assets.quotes.length
      ? assets.quotes
      : ["القوة ليست كل شيء، لكن الظهور بمظهر القوي هو كل شيء."];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const msg = `🌑 حكمة سيد الظل 🌑\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `«${randomQuote}»\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      "أنا ذري.";
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
