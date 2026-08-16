import usersController from "./users.controllers.js";

export default function ({ api, event }) {
  const formatCurrency = (amount) => `${new Intl.NumberFormat("ar-MA").format(amount)} عملة ظل`;
  const toCoins = (value) => Number(value);

  const performTransaction = async ({ action, uid, coins }) => {
    try {
      const users = usersController({ api });
      const target = await users.find(uid);
      const sender = await users.find(event?.senderID);
      const amount = toCoins(coins);

      if (!target.status || !sender.status) {
        return { status: false, data: "لم يتم العثور على حساب العضو في قاعدة البيانات." };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { status: false, data: "يجب أن تكون قيمة العملات رقمًا موجبًا." };
      }

      const targetMoney = Number(target.data?.data?.money || 0);
      const senderMoney = Number(sender.data?.data?.money || 0);
      const targetName = target.data?.name || "عضو الظل";

      if (action === "decrease" && targetMoney < amount) {
        return { status: false, data: "لا يملك العضو رصيدًا كافيًا." };
      }
      if (action === "pay" && senderMoney < amount) {
        return { status: false, data: "رصيدك لا يكفي لإتمام التحويل." };
      }

      if (action === "increase") {
        await users.update(uid, { money: targetMoney + amount });
        return { status: true, data: `تمت إضافة ${formatCurrency(amount)} إلى حساب ${targetName}.` };
      }

      if (action === "decrease") {
        await users.update(uid, { money: targetMoney - amount });
        return { status: true, data: `تم خصم ${formatCurrency(amount)} من حساب ${targetName}.` };
      }

      if (action === "pay") {
        const senderUid = String(event?.senderID ?? "");
        const targetUid = String(uid ?? "");
        if (senderUid === targetUid) {
          return { status: false, data: "لا يمكنك تحويل العملات إلى حسابك." };
        }
        await users.update(senderUid, { money: senderMoney - amount });
        await users.update(targetUid, { money: targetMoney + amount });
        return { status: true, data: `تم تحويل ${formatCurrency(amount)} إلى ${targetName}.` };
      }

      return { status: false, data: "نوع العملية غير مدعوم." };
    } catch {
      return { status: false, data: "حدث خطأ أثناء تنفيذ العملية الاقتصادية." };
    }
  };

  const increase = async (coins, uid) => performTransaction({ action: "increase", uid, coins });
  const decrease = async (coins, uid) => performTransaction({ action: "decrease", uid, coins });
  const pay = async (coins, uid) => performTransaction({ action: "pay", uid, coins });

  const getBalance = async (uid) => {
    try {
      const users = usersController({ api });
      const user = await users.find(uid);
      return user.status
        ? { status: true, data: Number(user.data?.data?.money || 0) }
        : { status: false, data: "لم يتم العثور على حساب العضو." };
    } catch {
      return { status: false, data: "حدث خطأ أثناء قراءة الرصيد." };
    }
  };

  return { performTransaction, increase, decrease, pay, getBalance };
}
