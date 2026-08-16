
const leaveGroupCommand = async ({ api, event, args }) => {
  try {
    if (!args[0]) {
      const inbox = await api.getThreadList(100, null, ['INBOX']);
      const list = inbox.filter(group => group.isSubscribed && group.isGroup);

      const listthread = [];

      for (const groupInfo of list) {
        const data = await api.getThreadInfo(groupInfo.threadID);
        listthread.push({
          id: groupInfo.threadID,
          name: groupInfo.name,
          membersCount: data.userInfo.length,
        });
      }

      const listbox = listthread.sort((a, b) => b.membersCount - a.membersCount);

      let msg = 'قائمة المجموعات:\n\n',
        i = 1;
      const groupid = [];
      for (const group of listbox) {
        msg += `${i++}. ${group.name}\nالمعرف: ${group.id}\nالأعضاء: ${group.membersCount}\n\n`;
        groupid.push(group.id);
      }

      api.sendMessage(
        msg + 'رد بـ رقم المجموعة لمغادرة هذا المجموعة !!',
        event.threadID,
        (e, info) => {
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: 'pick',
            name: 'لاست',
            groupid,
            unsend: true,
          });
        }
      );
    } else {
      api.sendMessage('يرجى الرد برقم المجموعة لمغادرة المجموعة.', event.threadID);
    }
  } catch (error) {
    console.error('Error retrieving group list', error);
    api.sendMessage('حدث خطأ أثناء جلب قائمة المجموعات.\nيرجى المحاولة مرة أخرى لاحقًا.', event.threadID);
  }
};

async function onReply({ api, event, reply }) {
  if (reply.type !== 'pick') return;

  const { author, groupid } = reply;

  if (event.senderID !== author) return;

  const selectedNumber = parseInt(event.body);

  if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > groupid.length) {
    api.sendMessage('رقم غير صالح. يرجى الرد برقم مجموعة صحيح من القائمة.', event.threadID);
    return;
  }

  const selectedGroupId = groupid[selectedNumber - 1];

  try {
    await api.removeUserFromGroup(api.getCurrentUserID(), selectedGroupId);
    api.sendMessage(` ✅ | تم الخروج بنجاح من المجموعة: ${selectedGroupId}`, event.threadID);
  } catch (error) {
    console.error('Error leaving group chat', error);
    api.sendMessage('حدث خطأ أثناء مغادرة المجموعة.\nيرجى المحاولة مرة أخرى لاحقًا.', event.threadID);
  }
  await api.unsendMessage(reply.messageID);
}

export default {
  name: 'لاست',
  author: 'Kshitiz',
  role: "owner",
  description: 'مغادرة مجموعة محددة',
  execute: leaveGroupCommand,
  onReply,
};
