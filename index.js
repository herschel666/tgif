
const request = require('request');
const sample = require('lodash.sample');
const Telebot = require('telebot');

const SATURDAY = 6;

const SEARCH_URL = 'https://api.giphy.com/v1/gifs/search?q=tgif&api_key=dc6zaTOxFJmzC';

const getDaysTillFriday = () => {
    const currentDay = (new Date()).getDay();
    if (currentDay === SATURDAY) {
        return SATURDAY;
    }
    return 5 - currentDay;
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

bot.on('/tgif', (msg) => {
    const remainingDays = getDaysTillFriday();
    if (remainingDays !== 0) {
        msg.reply.text(`Still ${remainingDays} days to go. Stay strong!`);
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
