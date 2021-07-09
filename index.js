const botAPI = require('node-telegram-bot-api');
const YD = require('./downloader.js');
const log = require('./log.js');
const getID = require('./getID.js');
const fs = require('fs');

const queue = {};

const bot = new botAPI(process.env.TOKEN, {polling: true});
log("\n[" + Date() + "] Bot STARTED Token: " + process.env.TOKEN);

bot.on("polling_error", err => {
    console.log(err.code);
});

bot.on('message', msg => {
    log("\n[" + Date() + "] chatId: " + msg.chat.id + " usr: " + msg.from.username + " text: " + msg.text);

    if(msg.text.includes("https://youtu.be") || msg.text.includes("https://www.youtube.com")){
        bot.deleteMessage(msg.chat.id, msg.message_id).catch(rej => console.log(rej));
        log("\n[" + Date() + "] chatId: " + msg.chat.id +  " messageId: " + msg.message_id + " deleted");

        let videoID = getID(msg.text);
        log("\n[" + Date() + "] chatId: " + msg.chat.id + " videoID: " + videoID);

        queue[videoID] = msg.chat.id;
        YD.download(videoID);
    }
    else if(msg.text === "/start"){
        bot.sendMessage(msg.chat.id, "Send video link and wait a little to get your audio \u{1F47E}").catch(rej => console.log(rej));
    }
});

YD.on("finished", function(err, data) {
    bot.sendAudio(queue[data.videoId], data.file).then(() => {
        log("\n[" + Date() + "] chatId: " + queue[data.videoId] + " videoId: " + data.videoId + " sent");

        delete queue[data.videoId];
        fs.unlink(data.file, (err) => {if(err != null) console.log(err)});
    });
});