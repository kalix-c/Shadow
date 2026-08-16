async function execute({ api, event, args, Threads, Users, Economy }) {
  try {
    function output(msg) {
      if (typeof msg === "number" || typeof msg === "boolean" || typeof msg === "function")
        msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      }
      else if (typeof msg === "object")
        msg = JSON.stringify(msg, null, 2);
      else if (typeof msg === "undefined")
        msg = "undefined";

      api.sendMessage(msg, event.threadID, event.messageID);
    }

    function mapToObj(map) {
      const obj = {};
      map.forEach(function (v, k) {
        obj[k] = v;
      });
      return obj;
    }

    if (args.length === 0) {
      api.sendMessage("❌ اكتب شيئا.", event.threadID);
      return;
    }

    const cmd = `
    (async () => {
      try {
        ${args.join(" ")}
      }
      catch(err) {
        console.log("eval command", err);
        api.sendMessage(err.message, event.threadID);
      }
    })()`;

    eval(cmd);
  } catch (err) {
    console.error(err);
    api.sendMessage(err.message, event.threadID);
  }
}

export default {
  name: "تجربة",
  auther:"owner",
  aliases:["eval"],
  description: "يقوم بتقييم الكود المُدخل وإظهار الناتج.",
  execute,
};
