export default {
  name: "اكس_او",
  author: "محمد الشاوني",
  role: "member",
  description: "لعبة اكس او باستخدام الرد",

  async execute({ event, api, args }) {
    const mention = Object.keys(event.mentions);

    if (args[0] == "إغلاق") {
      if (!global.game || !global.game.hasOwnProperty(event.threadID) || global.game[event.threadID].on == false) {
        api.sendMessage("لا توجد مباراة قيد التشغيل في هذه المجموعة", event.threadID);
      } else {
        if (event.senderID == global.game[event.threadID].player1.id || event.senderID == global.game[event.threadID].player2.id) {
          if (event.senderID == global.game[event.threadID].player1.id) {
            api.sendMessage({
              body: `يا له من طفل بكاء 🙂. ${global.game[event.threadID].player1.name} لقد ترك اللعبة.\nوبذلك يكون الفائز هو ${global.game[event.threadID].player2.name}.`,
              mentions: [{
                tag: global.game[event.threadID].player1.name,
                id: global.game[event.threadID].player1.id,
              }, {
                tag: global.game[event.threadID].player2.name,
                id: global.game[event.threadID].player2.id,
              }]
            }, event.threadID);
          } else {
            api.sendMessage({
              body: `يا له من طفل بكاء 🙂. ${global.game[event.threadID].player2.name} لقد ترك اللعبة.\nوبذلك يكون الرابح هو ${global.game[event.threadID].player1.name}.`,
              mentions: [{
                tag: global.game[event.threadID].player1.name,
                id: global.game[event.threadID].player1.id,
              }, {
                tag: global.game[event.threadID].player2.name,
                id: global.game[event.threadID].player2.id,
              }]
            }, event.threadID);
          }
          global.game[event.threadID].on = false;
        } else {
          api.sendMessage("ليس لديك أي لعبة قيد التشغيل في هذه المجموعة", event.threadID);
        }
      }
    } else {
      if (mention.length == 0) return api.sendMessage("يرجى عمل منشن لشخص ما أو قول إغلاق اللعبة لإغلاق أي لعبة موجودة", event.threadID);

      if (!global.game || !global.game.hasOwnProperty(event.threadID) || !global.game[event.threadID] || global.game[event.threadID].on === false) {
        if (!global.game) {
          global.game = {};
        }

        const player1Info = await api.getUserInfo(mention[0]);
        const player2Info = await api.getUserInfo(event.senderID);

        global.game[event.threadID] = {
          on: true,
          board: "🔲🔲🔲\n🔲🔲🔲\n🔲🔲🔲",
          bid: "",
          board2: "123456789",
          avcell: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          turn: mention[0],
          player1: { id: mention[0], name: player1Info[mention[0]].name },
          player2: { id: event.senderID, name: player2Info[event.senderID].name },
          bidd: "❌",
          bid: "",
          ttrns: [],
          counting: 0
        };

        api.sendMessage(global.game[event.threadID].board, event.threadID, (err, info) => {
          global.game[event.threadID].bid = info.messageID;
        });
      } else {
        api.sendMessage("هناك لعبة موجودة بالفعل في هذه المجموعة", event.threadID);
      }
    }

    api.listenMqtt((err, event) => {
      if (err) return console.error(err);

      if (event.type === "message_reply" && global.game[event.threadID] && global.game[event.threadID].on === true) {
        if (event.messageReply.messageID === global.game[event.threadID].bid) {
          if (global.game[event.threadID].turn === event.senderID) {
            if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.body)) {
              if (global.game[event.threadID].avcell.includes(event.body)) {
                global.game[event.threadID].avcell.splice(global.game[event.threadID].avcell.indexOf(event.body), 1);

                let input2 = event.body * 2;
                global.game[event.threadID].ttrns.map(e => {
                  if (e < event.body) {
                    input2--;
                  }
                });

                if (["4", "5", "6"].includes(event.body)) {
                  input2++;
                } else if (["7", "8", "9"].includes(event.body)) {
                  input2 += 2;
                }

                global.game[event.threadID].board = global.game[event.threadID].board.replaceAt("🔲", global.game[event.threadID].bidd, input2 - 2);
                global.game[event.threadID].board2 = global.game[event.threadID].board2.replace(event.body, global.game[event.threadID].bidd);

                api.sendMessage(global.game[event.threadID].board, event.threadID, (err, infos) => {
                  global.game[event.threadID].bid = infos.messageID;
                });
                let winncomb = [
                  (global.game[event.threadID].board2[0] === global.game[event.threadID].bidd && global.game[event.threadID].board2[1] === global.game[event.threadID].bidd && global.game[event.threadID].board2[2] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[3] === global.game[event.threadID].bidd && global.game[event.threadID].board2[4] === global.game[event.threadID].bidd && global.game[event.threadID].board2[5] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[6] === global.game[event.threadID].bidd && global.game[event.threadID].board2[7] === global.game[event.threadID].bidd && global.game[event.threadID].board2[8] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[0] === global.game[event.threadID].bidd && global.game[event.threadID].board2[3] === global.game[event.threadID].bidd && global.game[event.threadID].board2[6] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[1] === global.game[event.threadID].bidd && global.game[event.threadID].board2[4] === global.game[event.threadID].bidd && global.game[event.threadID].board2[7] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[2] === global.game[event.threadID].bidd && global.game[event.threadID].board2[5] === global.game[event.threadID].bidd && global.game[event.threadID].board2[8] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[0] === global.game[event.threadID].bidd && global.game[event.threadID].board2[4] === global.game[event.threadID].bidd && global.game[event.threadID].board2[8] === global.game[event.threadID].bidd),
                  (global.game[event.threadID].board2[2] === global.game[event.threadID].bidd && global.game[event.threadID].board2[4] === global.game[event.threadID].bidd && global.game[event.threadID].board2[6] === global.game[event.threadID].bidd)
                ];

                let winncomb2 = [
                  [1, 2, 3],
                  [4, 5, 6],
                  [7, 8, 9],
                  [1, 4, 7],
                  [2, 5, 8],
                  [3, 6, 9],
                  [1, 5, 9],
                  [3, 5, 7]
                ];

                if (winncomb.includes(true)) {
                  api.unsendMessage(event.messageReply.messageID);

                  let winl = winncomb2[winncomb.indexOf(true)];
                  winl.forEach(fn => {
                    let input2 = fn * 2;
                    global.game[event.threadID].ttrns.map(e => {
                      if (e < fn) {
                        input2--;
                      }
                    });

                    if (["4", "5", "6"].includes(fn)) {
                      input2++;
                    } else if (["7", "8", "9"].includes(fn)) {
                      input2 += 2;
                    }

                    global.game[event.threadID].board = global.game[event.threadID].board.replaceAt(global.game[event.threadID].bidd, "✅", input2 - 2);
                  });

                  api.sendMessage(global.game[event.threadID].board, event.threadID);

                  if (global.game[event.threadID].turn === global.game[event.threadID].player1.id) {
                    setTimeout(() => {
                      api.sendMessage({
                        body: `تهانينا 🥳 ${global.game[event.threadID].player1.name} , أنت الفائز في هذه المباراة..`,
                        mentions: [{
                          tag: global.game[event.threadID].player1.name,
                          id: global.game[event.threadID].player1.id,
                        }]
                      }, event.threadID);
                    }, 1000);
                  } else {
                    setTimeout(() => {
                      api.sendMessage({
                        body: `تهانينا 🥳 ${global.game[event.threadID].player2.name} , أنت الفائز في هذه المباراة..`,
                        mentions: [{
                          tag: global.game[event.threadID].player2.name,
                          id: global.game[event.threadID].player2.id,
                        }]
                      }, event.threadID);
                    }, 1000);
                  }
                  global.game[event.threadID].on = false;
                } else if (global.game[event.threadID].counting === 8) {
                  setTimeout(() => {
                    api.sendMessage("إنتهت المباراة بالتعادل.....", event.threadID);
                  }, 1000);
                  global.game[event.threadID].on = false;
                } else {
                  global.game[event.threadID].counting += 1;
                  api.unsendMessage(event.messageReply.messageID);
                  global.game[event.threadID].ttrns.push(event.body);
                  if (global.game[event.threadID].turn === global.game[event.threadID].player1.id) {
                    global.game[event.threadID].turn = global.game[event.threadID].player2.id;
                    global.game[event.threadID].bidd = "⭕";
                  } else {
                    global.game[event.threadID].turn = global.game[event.threadID].player1.id;
                    global.game[event.threadID].bidd = "❌";
                  }
                }
                } else {
                api.sendMessage("تم حظر هذا بالفعل", event.threadID);
                }
                } else {
                api.sendMessage("قم بالرد من 1 -9", event.threadID);
                }
                } else {
                api.sendMessage("ليس دورك يا غبي 🌝", event.threadID);
                }
                }
                }
                });
                }
                }

                String.prototype.replaceAt = function (search, replace, from) {
                if (this.length > from) {
                return this.slice(0, from) + this.slice(from).replace(search, replace);
                }
                return this;
                }
