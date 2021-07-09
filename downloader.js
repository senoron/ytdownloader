const YTDownloader = require('youtube-mp3-downloader');
const ffmpeg = require('ffmpeg-static');

module.exports = new YTDownloader({
    "ffmpegPath": ffmpeg,
    "outputPath": "./audio",
    "youtubeVideoQuality": "highestaudio",
    "queueParallelism": 2,
    "progressTimeout": 1000,
    "allowWebm": false
});