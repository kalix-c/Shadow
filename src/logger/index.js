import chalk from "chalk";

const colors = {
  red: "#ff0000",
  green: "#00ff00",
  yellow: "#ffff00",
  blue: "#0000ff",
  magenta: "#ff00ff",
  cyan: "#00ffff",
  white: "#ffffff",
  gray: "#808080",
  ocean: "#00bfff",
  purple: "#9b59b6"
};

export const log = async (messages = []) => {
  const logMessage = messages
    .map(({ message = "", color = "white" }) => {
      const hex = colors[color] || colors.white;
      return chalk.hex(hex)(String(message));
    })
    .join("");
  console.log(logMessage);
};

export const notifer = async (title, message) => {
  if (process.platform === "win32" || process.platform === "win64") {
    const { default: notifier } = await import("node-notifier").catch(() => ({ default: null }));
    notifier?.notify({
      appName: "Shadow Bot",
      title,
      message,
      icon: "./helper/logo.jpg"
    });
  }
};
