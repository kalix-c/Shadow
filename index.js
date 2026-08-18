import fs from "node:fs";
import login from "@trunqkj3n/kaguya";
import { commandMiddleware, eventMiddleware } from "./src/middleware/index.js";
import sleep from "time-sleep";
import { log, notifer } from "./src/logger/index.js";
import gradient from "gradient-string";
import chokidar from "chokidar";
import config from "./ShadowSetUp/config.js";
import EventEmitter from "events";
import { ShadowMessenger } from "./src/shadow/ShadowMessenger.js";
import { ShadowResponseEngine } from "./src/shadow/ShadowResponseEngine.js";
import { dispatchCommandEvent } from "./src/shadow/CommandRouter.js";

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
          message: "Startup failed. Review only the safe status signals in the runtime log.",
          color: "white",
        },
      ]);
      process.exit(1);
    });
    this.currentConfig = config;
    this.watcher = chokidar.watch("./ShadowSetUp/config.js");
    this.statePath = "./ShadowSetUp/ShadowState.json";
    this.package = JSON.parse(fs.readFileSync("./package.json"));
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.watcher.on("change", async () => {
      try {
        const updatedConfig = await import("./ShadowSetUp/config.js?update=" + Date.now());
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

      this.on("system:run", () => {
        const connectionOptions = {
          ...this.currentConfig.options,
          autoReconnect: true,
          emitReady: true,
        };

        let loginSettled = false;
        const loginTimeout = setTimeout(() => {
          if (!loginSettled) {
            log([{ message: "[ LOGIN ]: ", color: "yellow" }, { message: "No response from Messenger after 30 seconds. Verify the saved session in a browser and replace it if Facebook requests a checkpoint.", color: "white" }]);
          }
        }, 30000);

        const messenger = new ShadowMessenger({ login, appState: credentials, options: connectionOptions });
        this.messenger = messenger;
        let responder = null;

        messenger.once("apiReady", (api) => {
          responder = new ShadowResponseEngine({ api, client: global.client });
          log([{ message: "[ SHADOW RESPONSE ]: ", color: "green" }, { message: "Command engine initialized.", color: "white" }]);
        });

        messenger.on("status", (status) => {
          if (status.type === "ready") {
            log([{ message: "[ MQTT ]: ", color: "green" }, { message: "Messenger listener is ready for commands.", color: "white" }]);
          } else if (status.type === "mqtt_connected") {
            log([{ message: "[ MQTT ]: ", color: "green" }, { message: "WebSocket connected; waiting for Messenger sync.", color: "white" }]);
          } else if (status.type === "mqtt_sync_recovered") {
            log([{ message: "[ MQTT ]: ", color: "green" }, { message: "Messenger sync bootstrap recovered safely.", color: "white" }]);
          } else if (status.type === "transport_started") {
            log([{ message: "[ MQTT ]: ", color: "purple" }, { message: "Connecting to Messenger...", color: "white" }]);
          }
        });

        messenger.on("diagnostic", (diagnostic) => {
          if (diagnostic.type === "mqtt_topic") {
            log([{ message: "[ MQTT TOPIC ]: ", color: "purple" }, { message: `Observed ${diagnostic.topic}.`, color: "white" }]);
          } else if (diagnostic.type === "mqtt_bootstrap_outcome") {
            log([{ message: "[ MQTT BOOTSTRAP ]: ", color: "yellow" }, { message: `${diagnostic.status}:${diagnostic.source}:${diagnostic.reason || "none"}`, color: "white" }]);
          } else {
            const shape = Array.isArray(diagnostic.shape) && diagnostic.shape.length > 0 ? diagnostic.shape.join(",") : "none";
            log([{ message: "[ MQTT DIAGNOSTIC ]: ", color: "yellow" }, { message: `Unparsed transport event on ${diagnostic.topic}; fields=${shape}.`, color: "white" }]);
          }
        });

        messenger.on("transportError", (transportError) => {
          log([{ message: "[ MQTT ERROR ]: ", color: "red" }, { message: transportError.type || "mqtt_error", color: "white" }]);
        });

        messenger.on("event", async (event) => {
          log([{ message: "[ MQTT EVENT ]: ", color: "purple" }, { message: `Received ${event.type || "unknown"} event (group: ${Boolean(event.isGroup)}).`, color: "white" }]);
          if (!responder) {
            log([{ message: "[ SHADOW RESPONSE ]: ", color: "yellow" }, { message: "Event arrived before command engine initialization.", color: "white" }]);
            return;
          }

          const result = await dispatchCommandEvent({ event, responder, telemetry: messenger.telemetry });
          if (result.handled && result.command) {
            log([{ message: "[ SHADOW RESPONSE ]: ", color: "green" }, { message: "Command response dispatched.", color: "white" }]);
          }
        });

        messenger.connect()
          .then(() => {
            loginSettled = true;
            clearTimeout(loginTimeout);
          })
          .catch(() => {
            loginSettled = true;
            clearTimeout(loginTimeout);
            this.emit("system:error", "Messenger connection did not complete.");
          });
      });

      this.displayIntro();
    })();
  }
}

const ShadowInstance = new Shadow();
ShadowInstance.start();
