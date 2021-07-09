const botAPI = require('node-telegram-bot-api');
const ffmpeg = require('ffmpeg-static');
const YTDownloader = require('youtube-mp3-downloader');
const fs = require('fs');

const queue = {};

const bot = new botAPI(process.env.TOKEN, {polling: true});
fs.appendFile("./logs.log", "\n[" + Date() + "] Bot STARTED", err => {
    if(err) throw err;
});

const YD = new YTDownloader({
    "ffmpegPath": ffmpeg,
    "outputPath": "./audio",
    "youtubeVideoQuality": "highestaudio",
    "queueParallelism": 2,
    "progressTimeout": 1000,
    "allowWebm": false
});

function getID(url){
    if(url.includes("youtu.be")) return url.slice(url.indexOf('/', 9) + 1);
    else{
        let firstIndex = url.indexOf('?v=');
        let lastIndex = url.indexOf('&', firstIndex + 4);
        if(lastIndex !== -1) return url.slice(firstIndex + 3, lastIndex);
        else return url.slice(firstIndex + 3);
    }
}

bot.on("polling_error", console.log);

bot.on('message', msg => {
    fs.appendFile("./logs.log", "\n[" + Date() + "] chatId: " + msg.chat.id + " usr: " + msg.from.username + " text: " + msg.text, err => {
        if(err) throw err;
    });

    if(msg.text.includes("https://youtu.be") || msg.text.includes("https://www.youtube.com")){
        bot.deleteMessage(msg.chat.id, msg.message_id);
        fs.appendFile("./logs.log", "\n[" + Date() + "] chatId: " + msg.chat.id +  " messageId: " + msg.message_id + " deleted", err => {
            if(err) throw err;
        });
        let videoID = getID(msg.text);
        fs.appendFile("./logs.log", "\n[" + Date() + "] chatId: " + msg.chat.id + " videoID: " + videoID, err => {
            if(err) throw err;
        });

        queue[videoID] = msg.chat.id;
        YD.download(videoID);
    }
});

YD.on("finished", function(err, data) {

    bot.sendAudio(queue[data.videoId], data.file).then(() => {
        fs.appendFile("./logs.log", "\n[" + Date() + "] chatId: " + queue[data.videoId] + " videoId: " + data.videoId + " sent", err => {
            if(err) throw err;
        });

        delete queue[data.videoId];
        fs.unlink(data.file, (err) => {
            if(err) fs.appendFile("./logs.log", "\n[" + Date() + "] videoId: " + data.videoId + " sent", err => {
                if(err) throw err;
            });;
        });
    });
});