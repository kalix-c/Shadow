import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import login from "@trunqkj3n/kaguya";

const loginId = process.env.FB_LOGIN_ID;
const loginPassword = process.env.FB_LOGIN_PASSWORD;
const statePath = path.resolve("ShadowSetUp/ShadowState.json");
const temporaryStatePath = `${statePath}.new`;

function fail(code) {
  console.error(`[ SESSION ]: ${code}`);
  process.exitCode = 1;
}

if (!loginId || !loginPassword) {
  fail("MISSING_TEMPORARY_LOGIN_ENVIRONMENT");
} else {
  login(
    { email: loginId, password: loginPassword },
    { forceLogin: false, logLevel: "silent", autoReconnect: false },
    (error, api) => {
      if (error || !api) {
        const code = error?.error === "login-approval"
          ? "LOGIN_APPROVAL_REQUIRED"
          : "LOGIN_FAILED";
        fail(code);
        return;
      }

      try {
        const appState = api.getAppState();
        if (!Array.isArray(appState) || appState.length === 0) {
          fail("EMPTY_APP_STATE");
          return;
        }

        fs.writeFileSync(temporaryStatePath, JSON.stringify(appState), {
          encoding: "utf8",
          mode: 0o600,
        });
        fs.renameSync(temporaryStatePath, statePath);
        console.log("[ SESSION ]: PRIVATE_APP_STATE_SAVED");
      } catch {
        try {
          fs.rmSync(temporaryStatePath, { force: true });
        } catch {
          // The operational result above is sufficient; do not disclose file data.
        }
        fail("SESSION_WRITE_FAILED");
      }
    },
  );
}
