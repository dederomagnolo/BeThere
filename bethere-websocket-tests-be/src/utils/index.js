function minutesToMilliseconds(time) {
    return time*60*1000;
}

function secondsToMilliseconds(time) {
    return time*1000;
}

module.exports = {
    secondsToMilliseconds,
    minutesToMilliseconds
};