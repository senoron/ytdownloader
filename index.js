const botAPI = require('node-telegram-bot-api');
const YD = require('./downloader.js');
const log = require('./log.js');
const getID = require('./getID.js');
const fs = require('fs');

const queue = {};
const messages = {};

const bot = new botAPI(process.env.TOKEN, {webHook: {port: process.env.PORT, host: '0.0.0.0'}});
bot.setWebHook('https://senoron-ytdownloader.herokuapp.com:443/bot' + process.env.TOKEN).catch(err => console.log(err));

log("\n[" + Date() + "] Bot STARTED Token: " + process.env.TOKEN);

bot.on("polling_error", err => {
    console.log(err.code);
});

bot.on('message', msg => {
    log("\n[" + Date() + "] chatId: " + msg.chat.id + " usr: " + msg.from.username + " text: " + msg.text);

    if(msg.text.includes("https://youtu.be") || msg.text.includes("https://www.youtube.com")){
        //bot.sendMessage(msg.chat.id, "Process...").catch(rej => console.log(rej));
        bot.deleteMessage(msg.chat.id, msg.message_id).catch(rej => console.log(rej));
        // log("\n[" + Date() + "] chatId: " + msg.chat.id +  " messageId: " + msg.message_id + " deleted");

        let videoID = getID(msg.text);
        messages[videoID] = msg.message_id + 1;

        log("\n[" + Date() + "] chatId: " + msg.chat.id + " videoID: " + videoID);

        queue[videoID] = msg.chat.id;
        YD.download(videoID);
    }
    else if(msg.text === "/start"){
        bot.sendMessage(msg.chat.id, "\u{1F47E} Send the video link and wait a little to get your audio \u{1F47E}").catch(rej => console.log(rej));
    }
});

YD.on("finished", function(err, data) {
    bot.sendAudio(queue[data.videoId], data.file).then(() => {
        log("\n[" + Date() + "] chatId: " + queue[data.videoId] + " videoId: " + data.videoId + " sent");
        bot.deleteMessage(queue[data.videoId], messages[data.videoId]).catch(rej => console.log(rej));
        delete messages[data.videoId];
        delete queue[data.videoId];
        fs.unlink(data.file, (err) => {if(err != null) console.log(err)});
    });
});