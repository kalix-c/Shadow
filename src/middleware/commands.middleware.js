import fs from "node:fs/promises";
import { log } from "../logger/index.js";
import path from "path";

/**
 * Middleware function to load Shadow commands and their aliases.
 */
export const commandMiddleware = async () => {
  try {
    const baseDir = "./src/commands";
    const dir = await fs.readdir(baseDir);
    
    for (const directory of dir) {
      const fullPath = path.join(baseDir, directory);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const cmdFiles = await fs.readdir(fullPath);
        for (const file of cmdFiles) {
          if (!file.endsWith(".js")) continue;
          
          try {
            // Using absolute path or relative from this file for import
            const modulePath = `../commands/${directory}/${file}`;
            const commands = (await import(modulePath)).default;
            
            if (commands?.onLoad && typeof commands?.onLoad == "function") {
              await commands.onLoad();
            }
            
            if (!commands?.name) {
              log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Failed: ${file} (No Name)`, color: "red" }]);
              continue;
            }
            
            if (typeof commands?.execute !== "function") {
              log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Failed: ${file} (No Execute)`, color: "red" }]);
              continue;
            }
            
            global.client.commands.set(commands.name, commands);
            
            if (commands.aliases && Array.isArray(commands.aliases)) {
              for (const alias of commands.aliases) {
                if (!alias || global.client.aliases.has(alias)) continue;
                global.client.aliases.set(alias, commands.name);
              }
            }
            
            log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Emerged: ${commands.name}`, color: "white" }]);
            
          } catch (error) {
            log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Error loading ${file}: ${error.message}`, color: "red" }]);
          }
        }
      }
    }
  } catch (error) {
    log([{ message: "[ SHADOW ]: ", color: "purple" }, { message: `Failed to open Shadow Vault: ${error.message}`, color: "red" }]);
  }
};
