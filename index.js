import fs from "node:fs";
import login from "@trunqkj3n/kaguya";
import { listen } from "./src/listen/listen.js";
import './src/utils/kaguya.js';
import { commandMiddleware, eventMiddleware } from "./src/middleware/index.js";
import sleep from "time-sleep";
import { log, notifer } from "./src/logger/index.js";
import gradient from "gradient-string";
import chokidar from "chokidar";
import config from "./KaguyaSetUp/config.js";
import EventEmitter from "events";
import axios from "axios";
import semver from "semver";

class Shadow extends EventEmitter {
  constructor() {
    super();
    this.on("system:error", (err) => {
      log([
        {
          message: "[ SHADOW ERROR ]: ",
          color: "red",
        },
        {
          message: `Error in the Garden of Shadows: ${err}`,
          color: "white",
        },
      ]);
      process.exit(1);
    });
    this.currentConfig = config;
    this.watcher = chokidar.watch("./KaguyaSetUp/config.js");
    this.statePath = "./KaguyaSetUp/KaguyaState.json";
    this.package = JSON.parse(fs.readFileSync("./package.json"));
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.watcher.on("change", async () => {
      try {
        const updatedConfig = await import("./KaguyaSetUp/config.js?update=" + Date.now());
        this.currentConfig = updatedConfig.default;
        global.client.config = this.currentConfig;
        log([{ message: "[ SYSTEM ]: ", color: "green" }, { message: "Shadow configuration updated.", color: "white" }]);
      } catch (error) {
        this.emit("system:error", "Unable to reload Shadow configuration!");
      }
    });
  }

  checkCredentials() {
    if (!fs.existsSync(this.statePath)) {
        this.emit("system:error", `Credential file not found at ${this.statePath}. Shadow cannot emerge from the darkness without it.`);
    }
    try {
      const credentials = fs.readFileSync(this.statePath, "utf8");
      const credentialsArray = JSON.parse(credentials);
      if (!Array.isArray(credentialsArray) || credentialsArray.length === 0) {
        this.emit("system:error", "Shadow State file is empty. Please provide a valid appstate.");
      }
      return credentialsArray;
    } catch (error) {
      this.emit("system:error", "Failed to parse Shadow State. Ensure it is a valid JSON array.");
    }
  }

  async displayIntro() {
    const shadowGradient = gradient("#2c3e50", "#000000", "#2c3e50");
    const neonPurple = gradient("#8e44ad", "#9b59b6");
    
    console.log(shadowGradient("=".repeat(50)));
    console.log(neonPurple("         ⚡ THE EMINENCE IN SHADOW ⚡         "));
    console.log(shadowGradient("=".repeat(50)));
    console.log(`${neonPurple("[ STATUS ]:")} Shadow is lurking in the darkness...`);
    console.log(`${neonPurple("[ VERSION ]:")} ${this.package.version}`);
    console.log(shadowGradient("-".repeat(50)));
    
    this.emit("system:run");
  }

  start() {
    process.title = `Shadow Bot - The Eminence in Shadow - v${this.package.version}`;
    
    const credentials = this.checkCredentials();

    (async () => {
      global.client = {
        commands: new Map(),
        events: new Map(),
        cooldowns: new Map(),
        aliases: new Map(),
        handler: {
          reply: new Map(),
          reactions: new Map(),
        },
        config: this.currentConfig,
      };

      await commandMiddleware();
      await eventMiddleware();
      
      this.displayIntro();

      this.on("system:run", () => {
        login({ appState: credentials }, async (err, api) => {
          if (err || !api) {
            this.emit("system:error", `Login failed: ${err?.message || err || "Unknown login error"}`);
            return;
          }

          api.setOptions(this.currentConfig.options);

          const listenMqtt = async () => {
            try {
              if (!listenMqtt.isListening) {
                listenMqtt.isListening = true;
                const mqtt = await api.listenMqtt(async (err, event) => {
                  if (err) {
                    log([{ message: "[ MQTT ERROR ]: ", color: "red" }, { message: err.message, color: "white" }]);
                  }
                  if (event) {
                    await listen({ api, event, client: global.client });
                  }
                });
                
                await sleep(this.currentConfig.mqtt_refresh);
                log([{ message: "[ MQTT ]: ", color: "purple" }, { message: "Refreshing Shadow connection...", color: "white" }]);
                
                await mqtt.stopListening();
                await sleep(5000);
                listenMqtt.isListening = false;
              }
              listenMqtt();
            } catch (error) {
              log([{ message: "[ CRITICAL ]: ", color: "red" }, { message: `Shadow connection lost: ${error.message}`, color: "white" }]);
              setTimeout(listenMqtt, 10000);
            }
          };

          listenMqtt.isListening = false;
          listenMqtt();
        });
      });
    })();
  }
}

const ShadowInstance = new Shadow();
ShadowInstance.start();
