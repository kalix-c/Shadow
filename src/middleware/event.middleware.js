import fs from "node:fs/promises";
import { log } from "../logger/index.js";

export const eventMiddleware = async () => {
  try {
    const baseDir = "./src/events";
    const dir = await fs.readdir(baseDir);
    
    for (const file of dir) {
      if (!file.endsWith(".js")) continue;
      
      try {
        const modulePath = `../events/${file}`;
        const events = (await import(modulePath)).default;
        
        if (events?.onLoad && typeof events?.onLoad === "function") {
          await events.onLoad();
        }
        
        if (!events?.name || typeof events?.execute !== "function") {
          log([{ message: "[ SHADOW EVENT ]: ", color: "purple" }, { message: `Invalid event: ${file}`, color: "red" }]);
          continue;
        }
        
        global.client.events.set(events.name, events);
        log([{ message: "[ SHADOW EVENT ]: ", color: "purple" }, { message: `Active: ${events.name}`, color: "white" }]);
        
      } catch (error) {
        log([{ message: "[ SHADOW EVENT ]: ", color: "purple" }, { message: `Error loading ${file}: ${error.message}`, color: "red" }]);
      }
    }
  } catch (error) {
    log([{ message: "[ SHADOW EVENT ]: ", color: "purple" }, { message: `Shadow Garden Events failed to load: ${error.message}`, color: "red" }]);
  }
};
