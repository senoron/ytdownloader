module.exports = (url) => {
    if(url.includes("youtu.be")) return url.slice(url.indexOf('/', 9) + 1);
    else{
        let firstIndex = url.indexOf('?v=');
        let lastIndex = url.indexOf('&', firstIndex + 4);
        if(lastIndex !== -1) return url.slice(firstIndex + 3, lastIndex);
        else return url.slice(firstIndex + 3);
    }
};