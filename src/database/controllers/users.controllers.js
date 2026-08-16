import { log } from "../../logger/index.js";
import config from "../../KaguyaSetUp/config.js";
import fs from "fs-extra";
import chokidar from "chokidar";

const databaseType = config.database.type;
const filePath = "./database/users.json";

if (!fs.existsSync(filePath)) {
  fs.writeJsonSync(filePath, []);
}

let usersData = fs.readJsonSync(filePath);
const watcher = chokidar.watch(filePath);

watcher.on("change", () => {
  try {
    usersData = fs.readJsonSync(filePath);
  } catch (e) {
    // Silent catch for rapid writes
  }
});

export default function ({ api }) {
  const getUserInfo = async (uid) => {
    try {
        const data = await api.getUserInfo(uid);
        return data?.[uid] ?? null;
    } catch (e) {
        return null;
    }
  };

  const find = async (uid) => {
    try {
      let user;
      if (databaseType === "json") {
        user = usersData.find((i) => i?.uid == uid);
      }
      return {
        status: Boolean(user),
        data: user || null,
      };
    } catch (error) {
      return { status: false, data: "خطأ في نظام قاعدة البيانات!" };
    }
  };

  const create = async (uid) => {
    try {
      if (!uid) return { status: false, data: "UID مطلوب!" };
      const user = await find(uid);
      if (user.status) return user;

      const userData = await getUserInfo(uid);
      const dataUser = {
        uid,
        name: userData?.name || "Shadow Member",
        data: {
          money: 1000, // Starting bonus
          exp: 0,
          level: 1,
          banned: { status: false, reason: "", time: 0 },
          stats: { commandsUsed: 0, gamesWon: 0, points: 0 },
          joinedAt: Date.now()
        },
      };

      if (databaseType === "json") {
        usersData.push(dataUser);
        fs.writeJsonSync(filePath, usersData, { spaces: 2 });
      }

      log([
        { message: "[ SHADOW DB ]: ", color: "purple" },
        { message: `New member emerged from darkness: `, color: "white" },
        { message: `${uid} - ${dataUser.name}`, color: "green" }
      ]);

      return { status: true, data: dataUser };
    } catch (error) {
      return { status: false, data: null };
    }
  };

  const update = async (uid, data) => {
    try {
      const index = usersData.findIndex((i) => i?.uid === uid);
      if (index !== -1) {
        usersData[index].data = { ...usersData[index].data, ...data };
        fs.writeJsonSync(filePath, usersData, { spaces: 2 });
        return { status: true, data: usersData[index] };
      }
      return { status: false, data: null };
    } catch (error) {
      return { status: false, data: null };
    }
  };

  const getAll = async () => ({ status: true, data: usersData });

  return { create, find, update, getAll };
}
