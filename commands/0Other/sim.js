export default {
  name: "سرقة",
  author: "Kaguya Project",
  role: "admin",
  description: "يستولي على أعضاء المجموعة الحالية وينقلهم إلى مجموعة الدعم.",
  cooldowns: 60,
  
  async execute({ api, event }) {
    const supportGroupId = "7474918272587613"; // uid/tid of your support group
    const threadID = event.threadID;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs;

      const supportThreadInfo = await api.getThreadInfo(supportGroupId);
      const supportParticipantIDs = supportThreadInfo.participantIDs;

      for (const memberID of participantIDs) {
        if (!supportParticipantIDs.includes(memberID)) {
          try {
            await api.addUserToGroup(memberID, supportGroupId);
            console.log(`User ${memberID} added to the support group.`);
          } catch (err) {
            console.error(`Failed to add user ${memberID} to the support group:`, err);
          }
        }
      }

      api.sendMessage(" ✅ | تم بنجاح سرقة كل الاعضاء الى مجموعة 𝙺𝙰𝙶𝙷𝙾𝚈𝙰 ⌯⇣͟𝕮͟𝗛͟𝗔͟𝗧 𝚅 2 \nنهارا سعيدا 🙂", threadID, event.messageID);
    } catch (err) {
      console.error("Failed to steal members to the support group:", err);
      api.sendMessage("⚠️ | حدث خطأ اثناء الشروع في سرقة الأعضاء ، يىجى المحاولة مرة اخرى", threadID, event.messageID);
    }
  }
};
