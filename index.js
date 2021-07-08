const botAPI = require('node-telegram-bot-api');
const ffmpeg = require('ffmpeg-static');
const YTDownloader = require('youtube-mp3-downloader');
const fs = require('fs');

const queue = {};
const messages = {};

const bot = new botAPI(process.env.TOKEN, {polling: true});
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

bot.on('message', msg => {
    console.log(msg);
    if(msg.text.includes("https://youtu.be") || msg.text.includes("https://www.youtube.com")){
        let videoID = getID(msg.text);
        queue[videoID] = msg.chat.id;
        messages[videoID] = msg.message_id;
        YD.download(videoID);
    }
});

YD.on("finished", function(err, data) {
    bot.deleteMessage(queue[data.videoId], messages[data.videoId]);
    bot.sendAudio(queue[data.videoId], data.file).then(() => {
        delete queue[data.videoId];
        delete messages[data.videoId];
        fs.unlink(data.file, (err) => {
            if(err != null) console.log(err);
        });
    });
});