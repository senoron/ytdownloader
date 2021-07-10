const token = process.env.TOKEN;
const queue = new Map();
const alreadyInProcess = [];

const Bot = require('node-telegram-bot-api');
const YD = require('./downloader.js');
const getID = require('./getID.js');
const fs = require('fs');

let bot;

if(process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token).catch(err => console.log(err));
}
else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on("polling_error", err => {
    console.log(err.code);
});

bot.on('message', (msg) => {
    if(msg.text.includes("https://youtu.be") || msg.text.includes("https://www.youtube.com")){
        //bot.sendMessage(msg.chat.id, "Process...").catch(rej => console.log(rej));
        bot.deleteMessage(msg.chat.id, msg.message_id).catch(rej => console.log(rej));

        let videoID = getID(msg.text);

        if(alreadyInProcess.includes(msg.chat.id))
        {
            bot.sendMessage(msg.chat.id, "You can process only one video at time");
            return;
        }

        let arr = queue.get(videoID) ?? [];
        if(arr.length !== 0){
            if(alreadyInProcess.includes(msg.chat.id)) {bot.sendMessage(msg.chat.id, "You can process only one video at time"); return};
            alreadyInProcess.push(msg.chat.id);
            arr.push(msg.chat.id);
            queue.set(videoID, arr);
        } else {
            alreadyInProcess.push(msg.chat.id);
            arr.push(msg.chat.id);
            queue.set(videoID, arr);
        }
        YD.download(videoID);
    }
});

YD.on("finished", function(err, data) {
    let IdsArray = queue.get(data.videoId);
    let chatId = IdsArray[0];
    IdsArray.splice(0,1);
    queue.set(data.videoId, IdsArray);

    bot.sendAudio(chatId, data.file).then(() => {
        fs.unlink(data.file, (err) => {if(err != null) console.log(err)});
        alreadyInProcess.splice(alreadyInProcess.indexOf(chatId, 1));
    });

    if(queue.get(data.videoId).length === 0){
        queue.delete(data.videoId);
    }

});

module.exports = bot;
