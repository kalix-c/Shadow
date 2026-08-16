import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const roots = ["index.js", "app.js", "KaguyaSetUp", "helper", "src"];
const files = [];

async function collect(entry) {
  const full = path.join(root, entry);
  const stat = await fs.stat(full);
  if (stat.isFile() && full.endsWith(".js")) {
    files.push(full);
    return;
  }
  if (!stat.isDirectory()) return;
  for (const child of await fs.readdir(full)) {
    await collect(path.join(entry, child));
  }
}

for (const entry of roots) {
  try {
    await collect(entry);
  } catch (error) {
    console.error(`تعذر فحص ${entry}: ${error.message}`);
    process.exitCode = 1;
  }
}

let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    failed += 1;
    console.error(`خطأ صياغة: ${path.relative(root, file)}`);
    console.error(error.stderr?.toString() || error.message);
  }
}

const critical = [
  "./KaguyaSetUp/config.js",
  "./src/database/controllers/index.js",
  "./src/middleware/commands.middleware.js",
  "./src/middleware/event.middleware.js",
  "./src/config/assets.js",
  "./src/commands/Utility/stats.js",
  "./src/commands/ShadowGarden/mission.js",
  "./src/commands/ShadowGarden/garden.js",
  "./src/commands/ShadowGarden/quote.js",
  "./src/commands/2Game/shadowgame.js"
];

for (const modulePath of critical) {
  try {
    const moduleUrl = `${pathToFileURL(path.join(root, modulePath)).href}?validation=${Date.now()}`;
    await import(moduleUrl);
  } catch (error) {
    failed += 1;
    console.error(`فشل استيراد: ${modulePath}`);
    console.error(error.stack || error.message);
  }
}

if (failed) {
  console.error(`فشل التحقق في ${failed} اختبار(ات).`);
  process.exit(1);
}

console.log(`نجح التحقق: ${files.length} ملف JavaScript سليم، والوحدات الأساسية قابلة للاستيراد.`);
