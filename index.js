
const request = require('request');
const shuffle = require('lodash.shuffle');
const Telebot = require('telebot');

const DEV = process.env.NODE_ENV === 'development';

const TGIF_CMD_SUFFIX = DEV ? '_dev' : '';

const TGIF_CMD = new RegExp(`^/(tgr?if|tgirf)${TGIF_CMD_SUFFIX}$`, 'i');

const SATURDAY = 6;

const SEARCH_URL = 'https://api.giphy.com/v1/gifs/search?q=tgif&api_key=dc6zaTOxFJmzC';

let gifs = null;

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

const getTgifGif = (callback) => {
    if (gifs) {
        callback(null, gifs.pop());
        return;
    }
    request(SEARCH_URL, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            gifs = shuffle(JSON.parse(body).data.map(({ images }) =>
                images.downsized_medium.url));
            return callback(null, gifs.pop());
        }
        return callback(err || body);
    });
};

const bot = new Telebot({
    token: process.env.TELEGRAM_BOT_TOKEN,
});

bot.on(TGIF_CMD, (msg) => {
    const remainingDays = getDaysTillFriday(msg.date * 1000);
    if (remainingDays !== 0) {
        msg.reply.text(getMessage(remainingDays));
        gifs = null;
        return;
    }
    getTgifGif((err, gif) => {
        if (err) {
            console.error(err); // eslint-disable-line no-console
            msg.reply.text('It\'s friday!!! … but unfortunately I don\'t have a GIF for you. :-(');
            return;
        }
        if (!gif) {
            msg.reply.text('You\'ve consumed your weekly contingent of GIFs. Try again next week!');
            return;
        }
        msg.reply.sticker(gif);
    });
});

bot.start();

process.on('unhandledRejection', console.error);  // eslint-disable-line no-console

module.exports = () => 'TGIF';
