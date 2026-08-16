    export default {
      "prefix": "*",
      "language": "ar_MA",
      "BOT_NAME": "ⓀⒶⒼⓊⓎⒶ",
      "ADMIN_IDS": [
        "100076269693499",
        "100054133070771",
        "100088067552203"
      ],
      "botEnabled": true,
         "options": {
        "forceLogin": true,
        "listenEvents": true,
        "listenTyping": false,
        "logLevel": "silent",
        "updatePresence": true,
        "selfListen": true
    },
    database: {
        type: "json",
        mongodb: {
            uri: "mongodb://0.0.0.0:27017"
        }
    },
    port: process.env.PORT || 3000,
    mqtt_refresh: 1200000
};
