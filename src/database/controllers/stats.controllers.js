import fs from "fs-extra";
import { log } from "../../logger/index.js";

const statsPath = "./database/stats.json";

if (!fs.existsSync(statsPath)) {
    fs.writeJsonSync(statsPath, {
        totalCommands: 0,
        commandsMap: {},
        dailyActiveUsers: {},
        topUsers: []
    });
}

export default function () {
    const getStats = () => fs.readJsonSync(statsPath);
    
    const incrementCommand = (commandName, uid) => {
        const stats = getStats();
        stats.totalCommands += 1;
        stats.commandsMap[commandName] = (stats.commandsMap[commandName] || 0) + 1;
        
        const today = new Date().toISOString().split('T')[0];
        if (!stats.dailyActiveUsers[today]) stats.dailyActiveUsers[today] = [];
        if (!stats.dailyActiveUsers[today].includes(uid)) stats.dailyActiveUsers[today].push(uid);
        
        fs.writeJsonSync(statsPath, stats, { spaces: 2 });
    };

    return { getStats, incrementCommand };
}
