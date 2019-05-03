import fetch from 'node-fetch';
import shuffle = require('lodash.shuffle');
import botBuilder = require('claudia-bot-builder');

interface Giphy {
    images: {
        downsized_medium: { url: string };
    };
}

interface TelegramStickerReply {
    method: 'sendSticker';
    body: string;
}

const TGIF_CMD = /^\/(tgr?if|tgirf)$/i;

const SATURDAY = 6;

const { GIPHY_API_KEY = '' } = process.env;

const SEARCH_URL =
    `https://api.giphy.com/v1/gifs/search?q=tgif&api_key=${GIPHY_API_KEY}`;

const FALLBACK_GIF =
    'https://media.giphy.com/media/xT0BKFyZt9MMx9xkpW/giphy.gif';

const options = {
    platforms: ['telegram'],
};

global.dschiffCache = global.dschiffCache || [];

const getDaysTillFriday = (timestamp: number): number => {
    const currentDay = new Date(timestamp).getDay();
    if (currentDay === SATURDAY) {
        return SATURDAY;
    }
    return 5 - currentDay;
};

const getMessage = (day: number): string => {
    switch (day) {
        case 6:
        case 5:
            return `What's wrong with you? Enjoy your weekend!`;
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

const getDschiff = async (): Promise<string> => {
    if (global.dschiffCache.length === 0) {
        const res = await fetch(SEARCH_URL);
        const body = await res.json();

        global.dschiffCache = global.dschiffCache.concat(
            shuffle(
                body.data.map((data: Giphy) => data.images.downsized_medium.url)
            )
        );
    }

    return global.dschiffCache.pop();
};

const getTgifDschiff = async (): Promise<TelegramStickerReply | string> => {
    try {
        const { Sticker } = botBuilder.telegramTemplate;
        const imageUrl = await getDschiff();
        const sticker = new Sticker(imageUrl || FALLBACK_GIF);

        return sticker.get();
    } catch {
        return `Sorry, I failed … ;-(`;
    }
};

module.exports = botBuilder(async msg => {
    console.log(JSON.stringify(msg)); // tslint:disable-line no-console
    if (!TGIF_CMD.test(msg.text.trim())) {
        return null;
    }

    const remainingDays = getDaysTillFriday(
        msg.originalRequest.message.date * 1000
    );
    if (remainingDays !== 0) {
        return Promise.resolve(getMessage(remainingDays));
    }
    return getTgifDschiff();
}, options);
