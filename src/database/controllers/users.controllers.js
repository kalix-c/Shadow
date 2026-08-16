import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { log } from "../../logger/index.js";
import config from "../../../ShadowSetUp/config.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const filePath = path.join(projectRoot, "database", "users.json");
const databaseType = config.database?.type || "json";

fs.ensureFileSync(filePath);
if (fs.readFileSync(filePath, "utf8").trim() === "") {
  fs.writeJsonSync(filePath, [], { spaces: 2 });
}

const readUsers = () => {
  try {
    const data = fs.readJsonSync(filePath);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const writeUsers = (data) => {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
};

const normalizeUid = (uid) => (uid === undefined || uid === null ? "" : String(uid));

export default function ({ api }) {
  const getUserInfo = async (uid) => {
    try {
      const data = await api?.getUserInfo?.(uid);
      return data?.[uid] ?? null;
    } catch {
      return null;
    }
  };

  const find = async (uid) => {
    const normalizedUid = normalizeUid(uid);
    if (!normalizedUid) return { status: false, data: null };

    try {
      const user = readUsers().find((item) => normalizeUid(item?.uid) === normalizedUid);
      return { status: Boolean(user), data: user || null };
    } catch {
      return { status: false, data: null };
    }
  };

  const create = async (uid) => {
    const normalizedUid = normalizeUid(uid);
    if (!normalizedUid) return { status: false, data: "UID مطلوب!" };

    const existing = await find(normalizedUid);
    if (existing.status) return existing;

    try {
      const users = readUsers();
      const userInfo = await getUserInfo(normalizedUid);
      const dataUser = {
        uid: normalizedUid,
        name: userInfo?.name || "عضو الظل",
        data: {
          money: 1000,
          exp: 0,
          level: 1,
          banned: { status: false, reason: "", time: 0 },
          stats: { commandsUsed: 0, gamesWon: 0, points: 0 },
          joinedAt: Date.now()
        }
      };

      if (databaseType === "json") {
        users.push(dataUser);
        writeUsers(users);
      }

      await log([
        { message: "[ SHADOW DB ]: ", color: "purple" },
        { message: `تم تسجيل عضو جديد في الحديقة: ${normalizedUid} - ${dataUser.name}`, color: "green" }
      ]);

      return { status: true, data: dataUser };
    } catch {
      return { status: false, data: null };
    }
  };

  const update = async (uid, patch = {}) => {
    const normalizedUid = normalizeUid(uid);
    try {
      const users = readUsers();
      const index = users.findIndex((item) => normalizeUid(item?.uid) === normalizedUid);
      if (index === -1) return { status: false, data: null };

      users[index].data = {
        ...(users[index].data || {}),
        ...patch
      };
      writeUsers(users);
      return { status: true, data: users[index] };
    } catch {
      return { status: false, data: null };
    }
  };

  const getAll = async () => ({ status: true, data: readUsers() });

  return { create, find, update, getAll };
}
