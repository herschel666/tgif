const { get: request } = require('https');
const sample = require('lodash.sample');

const { STAGE, TELEGRAM_BOT_TOKEN, GIPHY_API_KEY, EK_USER_ID } = process.env;

const BOT_NAME = STAGE === 'prod' ? 'ek_tgif_bot' : 'ek_tgif_dev_bot';

const SEARCH_URL = `https://api.giphy.com/v1/gifs/search?q=tgif&api_key=${GIPHY_API_KEY}`;

const SATURDAY = 6;

const FALLBACK_GIF =
  'https://media.giphy.com/media/xT0BKFyZt9MMx9xkpW/giphy.gif';

const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

const RE_TGIF = '^\\/(tgr?if|tgirf)';
const TGIF_CMD = new RegExp(`${RE_TGIF}$`, 'i');
const TGIF_SETTINGS_CMD = new RegExp(`${RE_TGIF}\\s+settings$`, 'i');

const SETTINGS_ALPHA_USERS = [Number(EK_USER_ID)];

const BLOCKED_BY_USER_MSG = `
Sorry, but you have to start a conversation with me first.

Follow the link https://t.me/${BOT_NAME} to do this.

Cheers!
`.trim();

const getStickerUrl = (chatId, sticker) => {
  const qs = new URLSearchParams({
    chat_id: chatId,
    disable_notification: true,
    sticker,
  });

  return `${TELEGRAM_BASE_URL}sendSticker?${qs.toString()}`;
};

const getMessageUrl = (chatId, text, silent = true, messageId) => {
  const qs = new URLSearchParams({
    chat_id: chatId,
    text,
  });

  if (silent) {
    qs.append('disable_notification', true);
  }

  if (messageId) {
    qs.append('reply_to_message_id', messageId);
  }

  return `${TELEGRAM_BASE_URL}sendMessage?${qs.toString()}`;
};

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

const handler = async (data, ddb) => {
  const { text = '', chatId, date, fromId, messageId } = data;
  let response = {
    statusCode: 202,
    body: '',
  };

  if (
    SETTINGS_ALPHA_USERS.includes(fromId) &&
    Boolean(text.trim().match(TGIF_SETTINGS_CMD))
  ) {
    let sessionId;
    const currentSession = await ddb.getSettingsSession(fromId);
    if (currentSession) {
      sessionId = currentSession.SessionId;
      await ddb.updateSettingsSession(fromId);
    } else {
      sessionId = await ddb.createSettingsSession(fromId);
    }
    const { error_code, description } = await get(
      getMessageUrl(fromId, sessionId, false)
    );
    if (
      error_code === 403 &&
      description.includes('bot was blocked by the user')
    ) {
      await get(getMessageUrl(chatId, BLOCKED_BY_USER_MSG, false, messageId));
    }
    return response;
  }

  if (!Boolean(text.trim().match(TGIF_CMD))) {
    return response;
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
  } catch (err) {
    response.statusCode = 500;
    console.log(err);
  }

  return response;
};

module.exports = {
  tgif: handler,
  SEARCH_URL,
  TELEGRAM_BASE_URL,
  FALLBACK_GIF,
};
