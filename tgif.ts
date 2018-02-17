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

const SEARCH_URL =
    'https://api.giphy.com/v1/gifs/search?q=tgif&api_key=dc6zaTOxFJmzC';

const options = {
    platforms: ['telegram'],
};

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

const getTgifGif = async (): Promise<TelegramStickerReply | string> => {
    try {
        const res = await fetch(SEARCH_URL);
        const body = await res.json();
        const { Sticker } = botBuilder.telegramTemplate;
        const imageUrl = shuffle(
            body.data.map((data: Giphy) => data.images.downsized_medium.url)
        ).pop();
        const sticker = new Sticker(imageUrl);

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
    return getTgifGif();
}, options);
