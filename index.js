
const request = require('request');
const sample = require('lodash.sample');
const Telebot = require('telebot');

const DEV = process.env.NODE_ENV === 'development';

const TGIF_CMD = DEV ? '/tgif_dev' : '/tgif';

const SATURDAY = 6;

const SEARCH_URL = 'https://api.giphy.com/v1/gifs/search?q=tgif&api_key=dc6zaTOxFJmzC';

const getDaysTillFriday = (timestamp) => {
    const currentDay = (new Date(timestamp)).getDay();
    if (currentDay === SATURDAY) {
        return SATURDAY;
    }
    return 5 - currentDay;
};

const getMessage = (day) => {
    switch (day) {
    case 6:
    case 5:
        return 'What\'s wrong with you? Enjoy your weekend!';
    case 4:
        return 'Not at all. Sorry!';
    case 3:
    case 2:
        return `Still ${day} days to go. Stay strong!`;
    case 1:
        return 'Almost there.';
    default:
        return 'Sorry, my calendar just exploded …!';
    }
};

const getTgifGif = callback => request(SEARCH_URL, (err, res, body) => {
    if (!err && res.statusCode === 200) {
        return callback(null, sample(JSON.parse(body).data).images.downsized_medium.url);
    }
    return callback(err || body);
});

const bot = new Telebot({
    token: process.env.TELEGRAM_BOT_TOKEN,
});

bot.on(TGIF_CMD, (msg) => {
    const remainingDays = getDaysTillFriday(msg.date * 1000);
    if (remainingDays !== 0) {
        msg.reply.text(getMessage(remainingDays));
        return;
    }
    getTgifGif((err, gif) => {
        if (err) {
            msg.reply.text('It\'s friday!!! … but unfortunately I don\'t have a GIF for you. :-(');
            return;
        }
        msg.reply.sticker(gif);
    });
});

bot.start();
