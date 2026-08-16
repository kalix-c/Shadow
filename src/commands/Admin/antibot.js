import { getWithRetry } from "../../utils/http.js";

export default {
  name: "كود",
  author: "محمد الشاوني",
  role: "admin",
  description: "تثبيت أمر جديد من محتوى مباشر أو رابط موثوق.",

  execute: async ({ api, event, args }) => {
    if (args[0] !== "تثبيت") {
      return api.sendMessage(
        "❌ | الاستخدام الصحيح: .كود تثبيت اسم_الملف المحتوى_أو_الرابط",
        event.threadID,
        event.messageID,
      );
    }

    if (args.length < 3) {
      return api.sendMessage(
        "⚠️ | يرجى تقديم اسم الملف والمحتوى أو رابط صالح.",
        event.threadID,
        event.messageID,
      );
    }

    const fileName = args[1];
    const content = args.slice(2).join(" ");

    try {
      const sourceContent = /^https?:\/\//i.test(content)
        ? (await getWithRetry(content, { timeout: 15_000 }, 1)).data
        : content;

      await installScript(fileName, sourceContent, api, event);
    } catch (error) {
      console.error("[SHADOW CODE]", error);
      await api.sendMessage(
        "❌ | تعذر جلب المحتوى أو تثبيت الأمر. تحقق من الرابط وإعدادات GitHub.",
        event.threadID,
        event.messageID,
      );
    }
  },
};

async function installScript(fileName, content, api, event) {
  const owner = process.env.GITHUB_OWNER || "kalix-c";
  const repo = process.env.GITHUB_REPO || "Shadow";
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const directory = process.env.GITHUB_COMMANDS_DIR || "src/commands";
  const apiUrl = new URL("https://vexx-kshitiz.vercel.app/github");
  apiUrl.searchParams.set("owner", owner);
  apiUrl.searchParams.set("repo", repo);
  apiUrl.searchParams.set("token", token);
  apiUrl.searchParams.set("directory", directory);
  apiUrl.searchParams.set("file", fileName);
  apiUrl.searchParams.set("content", content);

  const response = await getWithRetry(apiUrl.toString(), { timeout: 20_000 }, 1);

  if (response.data?.success) {
    return api.sendMessage(
      `✅ | تم تثبيت الأمر «${fileName}» بنجاح.`,
      event.threadID,
      event.messageID,
    );
  }

  const errorMessage = response.data?.message || "تعذر تنفيذ عملية التثبيت.";
  return api.sendMessage(
    `❌ | فشل تثبيت الملف «${fileName}»: ${errorMessage}`,
    event.threadID,
    event.messageID,
  );
}
