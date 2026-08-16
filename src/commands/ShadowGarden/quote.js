import assets from "../../config/assets.js";

export default {
    name: "حكمة",
    aliases: ["اقتباس", "quote", "shadow"],
    role: "user",
    cooldowns: 5,
    description: "استعراض حكمة أو اقتباس أسطوري من سيد الظل Cid Kagenou.",
    execute: async ({ api, event }) => {
        const quotes = assets.quotes;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const msg = `🌑 **حكمة سيد الظل (Shadow Wisdom)** 🌑\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `"${randomQuote}"\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `⚡ *I am Atomic.*`;
        
        return api.sendMessage(msg, event.threadID, event.messageID);
    }
};
