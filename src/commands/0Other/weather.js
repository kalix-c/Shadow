import WeatherJS from "weather-js";
import axios from "axios";

async function translateToArabic(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0] || text;
  } catch (error) {
    console.error("Error translating text to Arabic:", error);
    return text;
  }
}

export default {
  name: "الطقس",
  author: "Shadow Garden Project",
  role: "member",
  description: "الحصول على تقرير الطقس لموقع معين.",
  async execute({ api, event, args }) {
    try {
      if (args.length < 1) {
        const usage = " ⚠️ | أرجوك قم بإدخال إسم المدينة هكذا\nالطقس الدار البيضاء";
        api.sendMessage(usage, event.threadID);
        return;
      }

      const location = args.join(" ");
      WeatherJS.find(
        {
          search: location,
          degreeType: "C",
        },
        async (err, result) => {
          if (err) {
            api.sendMessage(" ❌ | حدث خطأ أثناء جلب بيانات الطقس.", event.threadID);
            return;
          }
          if (result.length === 0) {
            api.sendMessage(` ❗ | لم يتم إيجاد أي نتائج ل "${location}". الرجاء إدخال اسم صالح للمدينة أو الموقع.`, event.threadID);
            return;
          }
          const weatherData = result[0];
          const locationArabic = await translateToArabic(weatherData.location.name);
          const skytextdayArabic = await translateToArabic(weatherData.forecast[0].skytextday);
          const message = `الطقس من أجل ${locationArabic} (${weatherData.location.lat}, ${weatherData.location.long}):\n\n` +
            `الحرارة 💥: ${weatherData.current.temperature}°C / ${(weatherData.current.temperature * 9) / 5 + 32}°F\n` +
            `السماء 🌌: ${await translateToArabic(weatherData.current.skytext)}\n` +
            `أشعر و كأنها 🌝: ${weatherData.current.feelslike}\n` +
            `الرطوبة 💦: ${weatherData.current.humidity}\n` +
            `سرعة الرياح 🌪️: ${await translateToArabic(weatherData.current.winddisplay)}\n\n` +
            `تنبؤ بالمناخ 🧿\n` +
            `الإثنين: ${skytextdayArabic}\n` +
            `الثلاثاء: ${await translateToArabic(weatherData.forecast[1].skytextday)}\n` +
            `الأربعاء: ${await translateToArabic(weatherData.forecast[2].skytextday)}\n` +
            `الخميس: ${await translateToArabic(weatherData.forecast[3].skytextday)}\n` +
            `الجمعة: ${await translateToArabic(weatherData.forecast[4].skytextday)}\n`;
          api.sendMessage(message, event.threadID);
        }
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | عذرًا، حدث خطأ أثناء جلب بيانات الطقس.", event.threadID);
    }
  }
};