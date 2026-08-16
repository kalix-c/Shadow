import path from 'path';

export default {
  name: "زخرفة2",
  author: "Shadow Garden Project",
  role: "member",
  cooldowns: 10,
  description: "زخرفة نصوص إنجليزي إلى حروف أشبه بالرموز!",
  async execute({ api, event }) {
    try {
      const args = event.body.split(/\s+/).slice(1);
      const [styleNumber, ...contentArgs] = args;
      const content = contentArgs.join(" ").toLowerCase();

      if (!content) {
        return api.sendMessage(`[❗] | 1 = 🇭 🇪 🇱 🇱 🇴 \n 2 = 𝒽𝑒𝓁𝓁𝑜 𝓌𝑜𝓇𝓁𝒹 \n3 = 𝐡𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝 \n4 = 𝒽𝑒𝓁𝓁𝑜 𝓌𝑜𝓇𝓁𝒹 \n5 = 𝕙𝕖𝕝𝕝𝕠 𝕨𝕠𝕣𝕝𝕕 \n6 = ⒽⒺⓁⓁⓄ ⓌⓄⓇⓁⒹ 
\nفقط استخدم زخرفة2 رقم النمط ثم نص بالانجليزي \nزخرفة2 2 hello world`, event.threadID, event.messageID);
      }

      const characterMaps = [
        // نمط 1 (الرموز الوطنية)
        {
          "h": "🇭", "e": "🇪", "l": "🇱", "o": "🇴", "w": "🇼", "r": "🇷", "d": "🇩",
          "a": "🇦", "b": "🇧", "c": "🇨", "f": "🇫", "g": "🇬", "i": "🇮", "j": "🇯",
          "k": "🇰", "m": "🇲", "n": "🇳", "p": "🇵", "q": "🇶", "s": "🇸", "t": "🇹",
          "u": "🇺", "v": "🇻", "x": "🇽", "y": "🇾", "z": "🇿"
        },
        // نمط 2 (نمط "𝕒" - "𝕫")
        {
          "h": "𝗵", "e": "𝗲", "l": "𝗹", "o": "𝗼", "w": "𝘄", "r": "𝗿", "d": "𝗱",
          "a": "𝗮", "b": "𝗯", "c": "𝗰", "f": "𝗳", "g": "𝗴", "i": "𝗶", "j": "𝗷",
          "k": "𝗸", "m": "𝗺", "n": "𝗻", "p": "𝗽", "q": "𝗾", "s": "𝘀", "t": "𝘁",
          "u": "𝘂", "v": "𝘃", "x": "𝘅", "y": "𝘆", "z": "𝘇"
        },
        // نمط 3 (نمط "Ⓐ" - "Ⓩ")
        {
          "h": "Ⓗ", "e": "Ⓔ", "l": "Ⓛ", "o": "Ⓞ", "w": "Ⓦ", "r": "Ⓡ", "d": "Ⓓ",
          "a": "Ⓐ", "b": "Ⓑ", "c": "Ⓒ", "f": "Ⓕ", "g": "Ⓖ", "i": "Ⓘ", "j": "Ⓙ",
          "k": "Ⓚ", "m": "Ⓜ", "n": "Ⓝ", "p": "Ⓟ", "q": "Ⓠ", "s": "Ⓢ", "t": "Ⓣ",
          "u": "Ⓤ", "v": "Ⓥ", "x": "Ⓧ", "y": "Ⓨ", "z": "Ⓩ"
        },
        // نمط 4 (نمط "𝒶" - "𝓏")
        {
          "h": "𝒽", "e": "𝒺", "l": "𝓁", "o": "𝑜", "w": "𝓌", "r": "𝓇", "d": "𝒹",
          "a": "𝒶", "b": "𝒷", "c": "𝒸", "f": "𝒻", "g": "𝒼", "i": "𝒾", "j": "𝒿",
          "k": "𝒦", "m": "𝓂", "n": "𝓃", "p": "𝓅", "q": "𝓆", "s": "𝓈", "t": "𝓉",
          "u": "𝓊", "v": "𝓋", "x": "𝓍", "y": "𝓎", "z": "𝓏"
        },
        // نمط 5 (نمط "𝕒" - "𝕫")
        {
          "h": "𝕙", "e": "𝕖", "l": "𝕝", "o": "𝕠", "w": "𝕨", "r": "𝕣", "d": "𝕕",
          "a": "𝕒", "b": "𝕓", "c": "𝕔", "f": "𝕗", "g": "𝕘", "i": "𝕚", "j": "𝕛",
          "k": "𝕜", "m": "𝕞", "n": "𝕟", "p": "𝕡", "q": "𝕢", "s": "𝕤", "t": "𝕥",
          "u": "𝕦", "v": "𝕧", "x": "𝕩", "y": "𝕪", "z": "𝕫"
        },
        // نمط 6 (نمط "🄷" - "🅏")
        {
          "h": "🄷", "e": "🄴", "l": "🄻", "o": "🄾", "w": "🅂", "r": "🅁", "d": "🄳",
          "a": "🄐", "b": "🄑", "c": "🄒", "f": "🄕", "g": "🄖", "i": "🄘", "j": "🄙",
          "k": "🄚", "m": "🄜", "n": "🄝", "p": "🄟", "q": "🄠", "s": "🄢", "t": "🄣",
          "u": "🄤", "v": "🄥", "x": "🄧", "y": "🄨", "z": "🄩"
        }
      ];

      const selectedStyle = parseInt(styleNumber, 10) - 1;

      if (isNaN(selectedStyle) || selectedStyle < 0 || selectedStyle >= characterMaps.length) {
        return api.sendMessage("⚠️ | نمط غير صالح. الرجاء اختيار نمط صحيح من 1 إلى 6.", event.threadID, event.messageID);
      }

      const characterMap = characterMaps[selectedStyle];
      const convert = (text) => {
        return text.split('').map(char => characterMap[char] || char).join('');
      };

      const output = convert(content);
      return api.sendMessage(output, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠️ | حدث خطأ أثناء الزخرفة. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
    }
  },
};
