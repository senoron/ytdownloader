const logfileName = './logs.log';
const fs = require('fs');

module.exports = (data) => {
    fs.appendFile(logfileName, data, err => {
        if(err) console.log(err);
    });
};
