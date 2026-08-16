import usersController from "./users.controllers.js";

export default function ({ api }) {
  const requiredForNextLevel = (level) => 100 + Number(level) * 50;

  const increase = async (uid, count = 0) => {
    const users = usersController({ api });
    const record = await users.find(uid);
    const amount = Number(count);

    if (!record.status) return { status: false, data: "لم يتم العثور على حساب العضو." };
    if (!Number.isFinite(amount) || amount <= 0) {
      return { status: false, data: "يجب أن تكون الخبرة المضافة رقمًا موجبًا." };
    }

    let exp = Number(record.data?.data?.exp || 0) + amount;
    let level = Number(record.data?.data?.level || 1);
    const previousLevel = level;

    while (exp >= requiredForNextLevel(level)) {
      exp -= requiredForNextLevel(level);
      level += 1;
    }

    const updated = await users.update(uid, { exp, level });
    if (!updated.status) return { status: false, data: "تعذر تحديث خبرة العضو." };

    return {
      status: level > previousLevel ? "level_up" : true,
      data: {
        level,
        exp,
        gained: amount,
        message: level > previousLevel
          ? `ارتقى العضو إلى المستوى ${level}!`
          : `تمت إضافة ${amount} نقطة خبرة.`
      }
    };
  };

  const check = async (uid) => {
    const users = usersController({ api });
    const record = await users.find(uid);
    if (!record.status) return { status: false, data: "لم يتم العثور على حساب العضو." };

    const exp = Number(record.data?.data?.exp || 0);
    const level = Number(record.data?.data?.level || 1);
    return {
      status: true,
      data: {
        currentLevel: level,
        exp,
        expNeededForNextLevel: Math.max(requiredForNextLevel(level) - exp, 0)
      }
    };
  };

  return { increase, check };
}
