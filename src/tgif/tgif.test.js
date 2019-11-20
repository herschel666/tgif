import test from 'ava';
import querystring from 'querystring';
import nock from 'nock';
import {
  tgif,
  SEARCH_URL as SEARCH_URL_STRING,
  FALLBACK_GIF,
  TELEGRAM_BASE_URL,
  BLOCKED_BY_USER_MSG,
} from './tgif';

const MONDAY = Math.round(new Date('2019-07-08 10:35:00').getTime() / 1000);
const TUESDAY = Math.round(new Date('2019-07-09 11:36:01').getTime() / 1000);
const WEDNESDAY = Math.round(new Date('2019-07-10 12:37:02').getTime() / 1000);
const THURSDAY = Math.round(new Date('2019-07-11 13:38:03').getTime() / 1000);
const FRIDAY = Math.round(new Date('2019-07-12 14:39:04').getTime() / 1000);
const SATURDAY = Math.round(new Date('2019-07-13 15:40:05').getTime() / 1000);
const SUNDAY = Math.round(new Date('2019-07-14 16:41:06').getTime() / 1000);

const CHAT_ID = 1337;
const FAKE_USER_ID = 1234567;

const TELEGRAM_URL = new URL(TELEGRAM_BASE_URL);
const TELEGRAM_HOSTNAME = `${TELEGRAM_URL.protocol}//${TELEGRAM_URL.hostname}`;
const TELEGRAM_BASE_PATHNAME = TELEGRAM_URL.pathname;

const GIFS = [
  { images: { downsized_medium: { url: 'gif-one' } } },
  { images: { downsized_medium: { url: 'gif-two' } } },
  { images: { downsized_medium: { url: 'gif-three' } } },
];

const SEARCH_URL = new URL(SEARCH_URL_STRING);
const SEARCH_HOSTNAME = `${SEARCH_URL.protocol}//${SEARCH_URL.hostname}`;
const SEARCH_PATHNAME = SEARCH_URL.pathname;
const SEARCH_QUERY = querystring.parse(SEARCH_URL.search.replace('?', ''));

const event = (message) => ({
  ...message,
  chatId: CHAT_ID,
});
const defaultResponse = {
  body: '',
  statusCode: 202,
};

test.before((t) => {
  t.context.__log = console.log;
  console.log = () => void 0;
});

test.after((t) => {
  console.log = t.context.__log;
  delete t.context.__log;
});

test('wrong command', async (t) => {
  t.deepEqual(await tgif(event({ text: '/yolo ' })), defaultResponse);
  t.deepEqual(await tgif(event({ text: '/tgiff' })), defaultResponse);
  t.deepEqual(await tgif(event({ text: '/tgirff' })), defaultResponse);
});

test('missing text, e.g. channel name update', async (t) => {
  t.deepEqual(await tgif(event({})), defaultResponse);
});

[
  // @prettier-ignore
  ['saturday', SATURDAY],
  ['sunday', SUNDAY],
].forEach(([day, date]) =>
  test(`Handling ${day}`, async (t) => {
    const scope = nock(TELEGRAM_HOSTNAME)
      .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
      .query({
        text: `What's wrong with you? Enjoy your weekend!`,
        chat_id: CHAT_ID,
        disable_notification: true,
      })
      .reply(200, {});
    const result = await tgif(event({ text: '/tgif', date }));

    t.true(scope.isDone());
    t.is(result.statusCode, 202);
  })
);

test('handling mondays', async (t) => {
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Not at all. Sorry!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: MONDAY }));

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});

test('handling tuesdays', async (t) => {
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Still 3 days to go. Stay strong!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: TUESDAY }));

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});

test('handling wednesdays', async (t) => {
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Still 2 days to go. Stay strong!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: WEDNESDAY }));

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});

test('handling thursdays', async (t) => {
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Almost there.',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: THURSDAY }));

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});

test('handling fridays', async (t) => {
  const giphyScope = nock(SEARCH_HOSTNAME)
    .get(SEARCH_PATHNAME)
    .query(SEARCH_QUERY)
    .reply(200, { data: GIFS });
  const telegramScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendSticker`)
    .query(
      (query) =>
        query.sticker &&
        Boolean(query.sticker.match(/^gif-(one|two|three)$/)) &&
        query.chat_id === String(CHAT_ID)
    )
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: FRIDAY }));

  t.true(giphyScope.isDone());
  t.true(telegramScope.isDone());
  t.is(result.statusCode, 202);
});

test('handling fridays with empty Giphy response', async (t) => {
  const giphyScope = nock(SEARCH_HOSTNAME)
    .get(SEARCH_PATHNAME)
    .query(SEARCH_QUERY)
    .reply(200, { data: [] });
  const telegramScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendSticker`)
    .query({
      sticker: FALLBACK_GIF,
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: FRIDAY }));

  t.true(giphyScope.isDone());
  t.true(telegramScope.isDone());
  t.is(result.statusCode, 202);
});

test('invalid settings call', async (t) => {
  const fromId = 1234568;
  t.deepEqual(
    await tgif(event({ text: '/tgrif settings ', fromId })),
    defaultResponse
  );
});

test('wrong settings call', async (t) => {
  const fromId = FAKE_USER_ID;
  t.deepEqual(
    await tgif(event({ text: '/tgif setings ', fromId })),
    defaultResponse
  );
});

test('bot is blocked by user', async (t) => {
  const fromId = FAKE_USER_ID;
  const sessionId = '1a2b3c4d5e6f7g8h9i0j';
  const messageId = 23;
  const firstScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: sessionId,
      chat_id: fromId,
    })
    .reply(403, {
      error_code: 403,
      description: 'Forbidden: bot was blocked by the user.',
    });
  const secondScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query(
      (query) =>
        query.text.includes(
          'Sorry, but you have to start a conversation with me first.'
        ) &&
        query.text.includes(
          'Follow the link https://t.me/ek_tgif_dev_bot to do this.'
        ) &&
        query.text.includes('Cheers!') &&
        query.chat_id === String(CHAT_ID) &&
        query.reply_to_message_id === String(messageId)
    )
    .reply(200, {});
  const ddb = {
    getSettingsSession: async () => ({ SessionId: sessionId }),
    updateSettingsSession: async () => void 0,
  };
  const result = await tgif(
    event({ text: '/tgif  settings', fromId, messageId }),
    ddb
  );

  t.true(firstScope.isDone());
  t.true(secondScope.isDone());
  t.is(result.statusCode, 202);
});

test('successful settings call', async (t) => {
  const fromId = FAKE_USER_ID;
  const sessionId = '1a2b3c4d5e6f7g8h9i0j';
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: sessionId,
      chat_id: fromId,
    })
    .reply(200, {});
  const ddb = {
    getSettingsSession: async () => ({ SessionId: sessionId }),
    updateSettingsSession: async () => void 0,
  };
  const result = await tgif(event({ text: '/tgif  settings', fromId }), ddb);

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});
