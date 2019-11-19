const { get: request } = require('https');
const sample = require('lodash.sample');

const { TELEGRAM_BOT_TOKEN, GIPHY_API_KEY, EK_USER_ID } = process.env;

const SEARCH_URL = `https://api.giphy.com/v1/gifs/search?q=tgif&api_key=${GIPHY_API_KEY}`;

const SATURDAY = 6;

const FALLBACK_GIF =
  'https://media.giphy.com/media/xT0BKFyZt9MMx9xkpW/giphy.gif';

const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

const RE_TGIF = '^\\/(tgr?if|tgirf)';
const TGIF_CMD = new RegExp(`${RE_TGIF}$`, 'i');
const TGIF_SETTINGS_CMD = new RegExp(`${RE_TGIF}\\s+settings$`, 'i');

const SETTINGS_ALPHA_USERS = [Number(EK_USER_ID)];

const getStickerUrl = (chatId, sticker) =>
  `${TELEGRAM_BASE_URL}sendSticker?sticker=${encodeURIComponent(
    sticker
  )}&chat_id=${chatId}&disable_notification=true`;

const getMessageUrl = (chatId, text, silent = true) =>
  `${TELEGRAM_BASE_URL}sendMessage?text=${encodeURIComponent(
    text
  )}&chat_id=${chatId}${silent ? '&disable_notification=true' : ''}`;

const getDaysTillFriday = (timestamp) => {
  // Hack a CET date object :-|
  const options = {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const currentDay = new Date(formatter.format(new Date(timestamp))).getDay();
  if (currentDay === SATURDAY) {
    return SATURDAY;
  }
  return 5 - currentDay;
};

const getMessage = (day) => {
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

const get = (url) =>
  new Promise((resolve, reject) =>
    request(url, (res) => {
      let data = '';
      res.on('data', (buf) => {
        data += buf;
      });
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject)
  );

const handler = async (data) => {
  const { text = '', chatId, date, fromId } = data;
  let response = {
    statusCode: 500,
    body: '',
  };

  if (
    SETTINGS_ALPHA_USERS.includes(fromId) &&
    Boolean(text.trim().match(TGIF_SETTINGS_CMD))
  ) {
    await get(getMessageUrl(fromId, 'Hello World!', false));
    response.statusCode = 202;
    return response;
  }

  if (!Boolean(text.trim().match(TGIF_CMD))) {
    return null;
  }

  const remainingDays = getDaysTillFriday(date * 1000);

  try {
    if (remainingDays !== 0) {
      await get(getMessageUrl(chatId, getMessage(remainingDays)));
    } else {
      const result = await get(SEARCH_URL);
      const sticker = result.data.length
        ? sample(result.data).images.downsized_medium.url
        : FALLBACK_GIF;
      await get(getStickerUrl(chatId, sticker));
    }
    response.statusCode = 202;
  } catch (err) {
    console.log(err);
    response.body = JSON.stringify(err);
  }

  return response;
};

module.exports = {
  tgif: handler,
  SEARCH_URL,
  TELEGRAM_BASE_URL,
  FALLBACK_GIF,
};
