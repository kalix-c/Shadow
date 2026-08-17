import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, "node_modules", "@trunqkj3n", "kaguya");

function patchFile(relativePath, before, after, label) {
  const target = path.join(packageRoot, relativePath);
  let source = fs.readFileSync(target, "utf8");

  if (source.includes(after)) {
    console.log(`[Kaguya patch] ${label}: already applied.`);
    return;
  }

  if (!source.includes(before)) {
    throw new Error(`[Kaguya patch] ${label}: expected source fragment was not found.`);
  }

  source = source.replace(before, after);
  fs.writeFileSync(target, source, "utf8");
  console.log(`[Kaguya patch] ${label}: applied.`);
}

patchFile(
  "index.js",
  `    appState.map(function (c) {
      var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);
    });`,
  `    appState.map(function (c) {
      var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);

      // Messenger uses a separate host. Mirror Facebook-scoped cookies into
      // its compatible domain without ever logging cookie names or values.
      if (String(c.domain).replace(/^\\./, "").endsWith("facebook.com")) {
        var messengerStr = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=.messenger.com; path=" + c.path + ";";
        jar.setCookie(messengerStr, "https://www.messenger.com");
      }
    });`,
  "session restore"
);

patchFile(
  "utils.js",
  `      var c2 = c.replace(/domain=\\.facebook\\.com/, "domain=.messenger.com");
      jar.setCookie(c2, "https://www.messenger.com");`,
  `      var c2 = c.replace(/domain=\\.?(www\\.)?facebook\\.com/i, "domain=.messenger.com");
      if (c2 !== c) {
        jar.setCookie(c2, "https://www.messenger.com");
      }`,
  "response cookie sync"
);
