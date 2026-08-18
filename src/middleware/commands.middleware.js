import fs from "node:fs/promises";
import { log } from "../logger/index.js";
import path from "path";

/**
 * Middleware function to load Shadow commands and their aliases.
 * Optimized for performance and reliability.
 */
export const commandMiddleware = async () => {
  try {
    const baseDir = "./src/commands";
    const coreRuntime = process.env.SHADOW_RUNTIME_PROFILE === "core";
    const coreCommands = { Utility: ["help.js"] };
    const dir = coreRuntime ? Object.keys(coreCommands) : await fs.readdir(baseDir);
    
    const loadPromises = dir.map(async (directory) => {
      const fullPath = path.join(baseDir, directory);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const cmdFiles = coreRuntime ? coreCommands[directory] : await fs.readdir(fullPath);
        for (const file of cmdFiles) {
          if (!file.endsWith(".js")) continue;
          
          try {
            const modulePath = `../commands/${directory}/${file}?update=${Date.now()}`;
            const commands = (await import(modulePath)).default;
            
            if (commands?.onLoad && typeof commands?.onLoad == "function") {
              await commands.onLoad();
            }
            
            if (!commands?.name) continue;
            
            global.client.commands.set(commands.name, commands);
            
            if (commands.aliases && Array.isArray(commands.aliases)) {
              for (const alias of commands.aliases) {
                if (!alias || global.client.aliases.has(alias)) continue;
                global.client.aliases.set(alias, commands.name);
              }
            }
          } catch (error) {
            log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Error loading ${file}: ${error.message}`, color: "red" }]);
          }
        }
      }
    });

    await Promise.all(loadPromises);
    const message = coreRuntime
      ? "Core runtime loaded: command aliases for help are ready."
      : "Shadow Vault opened. All powers manifested.";
    log([{ message: "[ SHADOW ]: ", color: "purple" }, { message, color: "green" }]);
  } catch (error) {
    log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Failed to open Shadow Vault: ${error.message}`, color: "red" }]);
  }
};
