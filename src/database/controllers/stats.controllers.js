import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const statsPath = path.join(projectRoot, "database", "stats.json");

const defaultStats = () => ({
  totalCommands: 0,
  commandsMap: {},
  dailyActiveUsers: {},
  topUsers: []
});

fs.ensureFileSync(statsPath);
if (fs.readFileSync(statsPath, "utf8").trim() === "") {
  fs.writeJsonSync(statsPath, defaultStats(), { spaces: 2 });
}

const getStats = () => {
  try {
    const stats = fs.readJsonSync(statsPath);
    return {
      ...defaultStats(),
      ...stats,
      commandsMap: stats?.commandsMap || {},
      dailyActiveUsers: stats?.dailyActiveUsers || {}
    };
  } catch {
    const stats = defaultStats();
    fs.writeJsonSync(statsPath, stats, { spaces: 2 });
    return stats;
  }
};

const saveStats = (stats) => fs.writeJsonSync(statsPath, stats, { spaces: 2 });

export default function () {
  const incrementCommand = (commandName, uid) => {
    const stats = getStats();
    const today = new Date().toISOString().split("T")[0];
    const normalizedUid = String(uid ?? "مجهول");

    stats.totalCommands = Number(stats.totalCommands || 0) + 1;
    stats.commandsMap[commandName] = Number(stats.commandsMap[commandName] || 0) + 1;
    stats.dailyActiveUsers[today] ||= [];
    if (!stats.dailyActiveUsers[today].includes(normalizedUid)) {
      stats.dailyActiveUsers[today].push(normalizedUid);
    }

    const validDates = Object.keys(stats.dailyActiveUsers).sort().slice(-31);
    stats.dailyActiveUsers = Object.fromEntries(
      validDates.map((date) => [date, stats.dailyActiveUsers[date]])
    );
    saveStats(stats);
    return stats;
  };

  return { getStats, incrementCommand };
}
