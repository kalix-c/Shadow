import fs from 'fs';
import path from 'path';
import axios from 'axios';

class Example {
  name = "طلبات";
  author = "Thiệu Trung Kiên";
  role = "admin";
  description = "يوافق على المجموعات المعلقة";
  handleReply = [];

  async execute({ api, event }) {
    const { threadID, messageID } = event;
    const commandName = "approve";
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      if (list.length === 0) {
        return api.sendMessage("لا توجد مجموعات في قائمة الانتظار", threadID, messageID);
      }

      list.forEach(single => {
        msg += `${index++}. ${single.name} (${single.threadID})\n`;
      });

      return api.sendMessage(`إجمالي عدد المجموعات المحتاجة للموافقة هو: ${list.length} مجموعة \n\n${msg}`, threadID, (error, info) => {
        if (error) {
          console.error("Error sending message:", error);
          return;
        }

        this.handleReply.push({
          name: commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "طلبات",
          unsend: true,
        });
      }, messageID);
    } catch (e) {
      console.error("Error fetching thread list:", e);
      return api.sendMessage("لا يمكن الحصول على قائمة الانتظار", threadID, messageID);
    }
  }

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { senderID, body, threadID, messageID } = event;
    if (String(senderID) !== String(reply.author)) return;

    if (!reply.pending || !Array.isArray(reply.pending)) {
      console.error("Error: reply.pending is not defined or not an array");
      return api.sendMessage("حدث خطأ أثناء معالجة الرد. يرجى المحاولة مرة أخرى لاحقًا.", threadID, messageID);
    }

    const selectedNumber = parseInt(body);
    if (isNaN(selectedNumber) || selectedNumber <= 0 || selectedNumber > reply.pending.length) {
      return api.sendMessage('رقم غير صالح. يرجى الرد برقم مجموعة صحيح من القائمة.', threadID);
    }

    const selectedGroup = reply.pending[selectedNumber - 1];
    const approvedThreadsFile = path.join(process.cwd(), 'approved.json');
    let approvedThreads = {};

    // Load existing approved thread data from the JSON file
    if (fs.existsSync(approvedThreadsFile)) {
      const data = fs.readFileSync(approvedThreadsFile, 'utf8');
      if (data) {
        approvedThreads = JSON.parse(data);
      }
    }

    // Check if the thread exists
    try {
      const threadData = await api.getThreadInfo(selectedGroup.threadID);

      // Store thread ID and name in the approvedThreads object
      approvedThreads[selectedGroup.threadID] = {
        name: threadData.threadName,
        timestamp: Date.now(),
      };

      // Save updated approvedThreads object back to the JSON file
      fs.writeFileSync(approvedThreadsFile, JSON.stringify(approvedThreads, null, 2), 'utf8');

      // Send a message indicating that the thread is approved
      await api.sendMessage(`المجموعة "${threadData.threadName}" (آيدي: ${selectedGroup.threadID}) تمت الموافقة عليها وتخزينها.`, threadID);

      // Send approval message to the group
      await api.sendMessage("✅ |تمت الموافقة على المجموعة من طرف المطور \n----------- \n---------------------\nأكتب *اوامر لترى قائمة الأوامر \n----------------\nرابط حساب المطور : https://www.facebook.com/profile.php?id=100076269693499\n-----------------\nإذا كان هناك أي مشاكل يرجى التواصل معي\nنهاركم سعيد 🤙 !", selectedGroup.threadID);
    } catch (error) {
      console.error("حدث خطأ أثناء الموافقة على المجموعة:", error);
      return api.sendMessage("حدث خطأ أثناء الموافقة على المجموعة.", threadID, messageID);
    }
  }
}

export default new Example();