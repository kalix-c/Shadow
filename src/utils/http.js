import axios from "axios";
import fs from "node:fs/promises";

const DEFAULT_TIMEOUT = 15_000;
const RETRYABLE_CODES = new Set([
  "ECONNABORTED",
  "ETIMEDOUT",
  "ECONNRESET",
  "ENETUNREACH",
  "EAI_AGAIN",
]);

const http = axios.create({
  timeout: DEFAULT_TIMEOUT,
  maxContentLength: 12 * 1024 * 1024,
  maxBodyLength: 12 * 1024 * 1024,
  headers: {
    "User-Agent": "Shadow-Bot/2.0 (+https://github.com/kalix-c/Shadow)",
  },
});

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function getWithRetry(url, options = {}, retries = 1) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await http.get(url, {
        timeout: options.timeout ?? DEFAULT_TIMEOUT,
        ...options,
      });
    } catch (error) {
      lastError = error;
      const code = error?.code;
      const status = error?.response?.status;
      const retryable = RETRYABLE_CODES.has(code) || !status || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt >= retries) throw error;
      await pause(500 * (attempt + 1));
    }
  }
  throw lastError;
}

export async function downloadToFile(url, filePath, options = {}) {
  const response = await getWithRetry(
    url,
    { responseType: "arraybuffer", timeout: options.timeout ?? DEFAULT_TIMEOUT },
    options.retries ?? 1,
  );
  await fs.writeFile(filePath, response.data);
  return filePath;
}

export { DEFAULT_TIMEOUT };
export default http;
