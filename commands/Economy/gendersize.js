import moment from 'moment-timezone';

export default {
  name: 'قبول',
  author: 'kaguya project',
  role: 'member',
  description: 'إدارة طلبات الصداقة من خلال قبول أو حذف الطلبات حسب اختيار المستخدم.',

  execute: async function ({ api, event }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;
      let msg = "";
      let i = 0;

      for (const user of listRequest) {
        i++;
        msg += (`\n${i}. Name: ${user.node.name}`
          + `\nID: ${user.node.id}`
          + `\nUrl: ${user.node.url.replace("www.facebook", "fb")}`
          + `\nTime: ${moment(user.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`);
      }

      api.sendMessage(`${msg}\n 🔖 | رد على الرسالة ب إضافة الرقم او حذف الرقم او إضافة ، حذف الكل`, event.threadID, (e, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "قبول",
          searchResults: listRequest,
          unsend: true
        });
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء جلب طلبات الصداقة.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, reply }) {
    try {
      if (reply.type !== 'pick') return;
      const { author, searchResults } = reply;

      if (event.senderID !== author) return;

      const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");

      clearTimeout(reply.unsendTimeout); // Clear the timeout if the user responds within the countdown duration

      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        variables: {
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3,
          refresh_num: 0
        }
      };

      const success = [];
      const failed = [];

      if (args[0] === "إضافة") {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
        form.doc_id = "3147613905362928";
      }
      else if (args[0] === "حذف") {
        form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
        form.doc_id = "4108254489275063";
      }
      else {
        return api.sendMessage("⚠️ | أرجوك قم بارد على الرسالة ب إضافة رقم أو حذف رقم أو إضافة الكل أو حذف الكل.", event.threadID, event.messageID);
      }

      let targetIDs = args.slice(1);

      if (args[1] === "الكل") {
        targetIDs = [];
        const lengthList = searchResults.length;
        for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
      }

      const newTargetIDs = [];
      const promiseFriends = [];

      for (const stt of targetIDs) {
        const u = searchResults[parseInt(stt) - 1];
        if (!u) {
          failed.push(`لم يتم العثور على الرقم ${stt} في القائمة.`);
          continue;
        }
        form.variables.input.friend_requester_id = u.node.id;
        form.variables = JSON.stringify(form.variables);
        newTargetIDs.push(u);
        promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
        form.variables = JSON.parse(form.variables);
      }

      const lengthTarget = newTargetIDs.length;
      for (let i = 0; i < lengthTarget; i++) {
        try {
          const friendRequest = await promiseFriends[i];
          if (JSON.parse(friendRequest).errors) {
            failed.push(newTargetIDs[i].node.name);
          }
          else {
            success.push(newTargetIDs[i].node.name);
          }
        }
        catch (e) {
          failed.push(newTargetIDs[i].node.name);
        }
      }

      if (success.length > 0) {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        api.sendMessage(`» تم معالجة ${args[0] === 'إضافة' ? 'طلب الصداقة' : 'حذف طلب الصداقة'} بنجاح لـ ${success.length} أشخاص:\n\n${success.join("\n")}${failed.length > 0 ? `\n» تعذر معالجة ${failed.length} أشخاص بسبب أخطاء:\n${failed.join("\n")}` : ""}`, event.threadID, event.messageID);
      } else {
        api.unsendMessage(event.messageID);
        return api.sendMessage("استجابة غير صحيحة. الرجاء تقديم استجابة صالحة.", event.threadID, event.messageID);
      }

      api.unsendMessage(event.messageID); // حذف الرسالة بعد المعالجة
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء معالجة طلب الصداقة.", event.threadID, event.messageID);
    }
  }
};
