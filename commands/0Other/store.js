import axios from 'axios';
const APIKEY = `V-GoatMart-Beta-xv4-Ibs8j-90-az7-V`;
const serverURL = `https://goatmart-apis.onrender.com`;
export default {
  name: 'المتجر',
  author: 'Your Name',
  role: 'member',
  description: 'Handles the search command.',
  execute: async (event, api) => {
    try {
      const args = event.body.split(' ');
      if (args[0] === 'بحث') {
        if (args.length < 2) {
          return api.sendMessage("📚 𝗚𝗼𝗮𝘁𝗠𝗮𝗿𝘁\n━━━━━━━━━━━━\n\n❓ 𝖯𝗹𝖾𝖺𝗌𝖾 𝖿𝗂𝗇𝖽 𝖺 𝖲𝖾𝖺𝗋𝖼𝗁 𝖽𝗲𝖿𝗂𝗇𝖾.\n\n- 𝖳𝖾𝖺𝗆 𝗚𝗈𝖺𝗍𝗠𝖺𝗋𝗍\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖦𝗈𝖺𝗍𝖬𝖺𝗋𝗍 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 🥰.", event.threadID, event.messageID);
        }

        const query = args.slice(1).join(' ');
        try {
          const response = await axios.get(`${serverURL}/api/search?apikey=${APIKEY}&query=${encodeURIComponent(query)}`);
          if (response.status === 200) {
            const data = response.data;
            const resultMessage = data.length > 0 
              ? data.map(item => `📝 ${item.title}\n🆔 ${item.id}`).join('\n\n') 
              : '❌ 𝖭𝗈 𝗿𝖾𝖽𝖾𝗋𝗂𝗍 𝖿𝗈𝗎𝗇𝖽.';
            api.sendMessage(`📚 𝗚𝗈𝖺𝗍𝗠𝗮𝗋𝗍\n━━━━━━━━━━━━\n\n${resultMessage}`, event.threadID, event.messageID);
          } else {
            api.sendMessage("📚 𝗚𝗈𝖺𝗍𝗠𝗮𝗋𝗍\n━━━━━━━━━━━━\n\n🚫 𝖠𝖯𝗂 𝖠𝖼𝖼𝖾𝗌𝖲 𝖿𝖺𝗂𝗅𝖾𝗱. يرجى المحاولة لاحقًا.\n\n- 𝖳𝖾𝖺𝗆 𝗚𝗈𝖺𝗍𝗠𝖺𝗋𝗍\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖦𝗈𝖺𝗍𝖬𝖺𝗋𝗍 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 🥰.", event.threadID, event.messageID);
          }
        } catch (err) {
          console.error(err);
          api.sendMessage("📚 𝗚𝗈𝖺𝗍𝗠𝗮𝗋𝗍\n━━━━━━━━━━━━\n\n💥 𝖤𝗋𝗋𝗈𝗋 𝖺𝖼𝖼𝖾𝗌𝖲. يرجى المحاولة لاحقًا.\n\n- 𝖳𝖾𝖺𝗆 𝗚𝗈𝖺𝗍𝗠𝖺𝗋𝗍\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖦𝗈𝖺𝗍𝖬𝖺𝗋𝗍 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 🥰.", event.threadID, event.messageID);
        }
      } else {
        api.sendMessage("📚 𝗚𝗈𝖺𝗍𝗠𝗮𝗋𝗍\n━━━━━━━━━━━━\n\n❓ 𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖦𝗈𝖺𝗍𝖬𝖺𝗋𝗍 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 🥰. 𝗨𝗌𝗂𝗇𝗀 𝗌𝖾𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("📚 𝗚𝗈𝖺𝗍𝗠𝗮𝗋𝗍\n━━━━━━━━━━━━\n\n💥 𝖤𝗋𝗋𝗈𝗋 𝖺𝖼𝖼𝖾𝗌𝖲. يرجى المحاولة لاحقًا.\n\n- 𝖳𝖾𝖺𝗆 𝗚𝗈𝖺𝗍𝗠𝖺𝗋𝗍\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖦𝗈𝖺𝗍𝖬𝖺𝗋𝗍 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 🥰.", event.threadID, event.messageID);
    }
  }
};
