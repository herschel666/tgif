const { get: request } = require('https');
const sample = require('lodash.sample');

const { TELEGRAM_BOT_TOKEN, GIPHY_API_KEY } = process.env;

const SEARCH_URL = `https://api.giphy.com/v1/gifs/search?q=tgif&api_key=${GIPHY_API_KEY}`;

const SATURDAY = 6;

const FALLBACK_GIF =
  'https://media.giphy.com/media/xT0BKFyZt9MMx9xkpW/giphy.gif';

const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

const getStickerUrl = (chatId, sticker) =>
  `${TELEGRAM_BASE_URL}sendSticker?sticker=${encodeURIComponent(
    sticker
  )}&chat_id=${chatId}`;

const getMessageUrl = (chatId, text) =>
  `${TELEGRAM_BASE_URL}sendMessage?text=${encodeURIComponent(
    text
  )}&chat_id=${chatId}`;

const getDaysTillFriday = (timestamp) => {
  const currentDay = new Date(timestamp).getDay();
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

exports.lambdaHandler = async (event) => {
  console.log(event);
  const { message } = JSON.parse(event.body);
  const chatId = message.chat.id;
  const remainingDays = getDaysTillFriday(message.date * 1000);
  let response = {
    statusCode: 500,
    body: '',
  };

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
