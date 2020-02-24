const ava = require('ava');
const ninos = require('ninos');
const nock = require('nock');
const {
  tgif,
  searchUrl,
  FALLBACK_GIF,
  TELEGRAM_BASE_URL,
  MAX_SEARCH_OFFSET,
} = require('./tgif');

const test = ninos(ava);

const MONDAY = Math.round(new Date('2019-07-08 10:35:00').getTime() / 1000);
const TUESDAY = Math.round(new Date('2019-07-09 11:36:01').getTime() / 1000);
const WEDNESDAY = Math.round(new Date('2019-07-10 12:37:02').getTime() / 1000);
const THURSDAY = Math.round(new Date('2019-07-11 13:38:03').getTime() / 1000);
const FRIDAY = Math.round(new Date('2019-07-12 14:39:04').getTime() / 1000);
const SATURDAY = Math.round(new Date('2019-07-13 15:40:05').getTime() / 1000);
const SUNDAY = Math.round(new Date('2019-07-14 16:41:06').getTime() / 1000);

const CHAT_ID = 1337;
const FAKE_USER_ID = 1234567;
const SESSION_ID = '1a2b3c4d5e6f7g8h9i0j';
const SESSION_MSG = `Edit your settings here: https://tgif-dev.e5l.de/user/${FAKE_USER_ID}/settings/${SESSION_ID}`;

const TELEGRAM_URL = new URL(TELEGRAM_BASE_URL);
const TELEGRAM_HOSTNAME = `${TELEGRAM_URL.protocol}//${TELEGRAM_URL.hostname}`;
const TELEGRAM_BASE_PATHNAME = TELEGRAM_URL.pathname;

const GIFS = [
  { images: { downsized_medium: { url: 'gif-one' } } },
  { images: { downsized_medium: { url: 'gif-two' } } },
  { images: { downsized_medium: { url: 'gif-three' } } },
];

const SEARCH_HOSTNAME = `${searchUrl.protocol}//${searchUrl.hostname}`;
const SEARCH_PATHNAME = searchUrl.pathname;

const event = (message) => ({
  ...message,
  chatId: CHAT_ID,
});
const defaultResponse = {
  body: '',
  statusCode: 202,
};

const isSearchQuery = ({ q, api_key: apiKey, offset: offsetString }) => {
  const offset = Number(offsetString);

  return (
    q === 'tgif' &&
    apiKey === 'giphy-api-key' &&
    offset >= 0 &&
    offset <= MAX_SEARCH_OFFSET
  );
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
    const fromId = FAKE_USER_ID;
    const getUser = t.context.stub();
    const scope = nock(TELEGRAM_HOSTNAME)
      .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
      .query({
        text: `What's wrong with you? Enjoy your weekend!`,
        chat_id: CHAT_ID,
        disable_notification: true,
      })
      .reply(200, {});
    const result = await tgif(event({ text: '/tgif', date, fromId }), {
      getUser,
    });

    t.true(scope.isDone());
    t.is(result.statusCode, 202);
    t.is(getUser.calls.length, 1);
    t.is(getUser.calls[0].arguments[0], fromId);
  })
);

test('handling mondays', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Not at all. Sorry!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: MONDAY, fromId }), {
    getUser,
  });

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test('handling tuesdays', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Still 3 days to go. Stay strong!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: TUESDAY, fromId }), {
    getUser,
  });

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test('handling wednesdays', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Still 2 days to go. Stay strong!',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: WEDNESDAY, fromId }), {
    getUser,
  });

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test('handling thursdays', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: 'Almost there.',
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: THURSDAY, fromId }), {
    getUser,
  });

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test('handling fridays', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const giphyScope = nock(SEARCH_HOSTNAME)
    .get(SEARCH_PATHNAME)
    .query(isSearchQuery)
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
  const result = await tgif(event({ text: '/tgif', date: FRIDAY, fromId }), {
    getUser,
  });

  t.true(giphyScope.isDone());
  t.true(telegramScope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test.todo('Handle equal requests in parallel test runs.');

test.skip('handling fridays with empty Giphy response', async (t) => {
  const fromId = FAKE_USER_ID;
  const getUser = t.context.stub();
  const giphyScope = nock(SEARCH_HOSTNAME)
    .get(SEARCH_PATHNAME)
    .query(isSearchQuery)
    .reply(200, { data: [] });
  const telegramScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendSticker`)
    .query({
      sticker: FALLBACK_GIF,
      chat_id: CHAT_ID,
      disable_notification: true,
    })
    .reply(200, {});
  const result = await tgif(event({ text: '/tgif', date: FRIDAY, fromId }), {
    getUser,
  });

  t.true(giphyScope.isDone());
  t.true(telegramScope.isDone());
  t.is(result.statusCode, 202);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], fromId);
});

test('wrong settings call', async (t) => {
  t.deepEqual(await tgif(event({ text: '/tgif setings ' })), defaultResponse);
});

test('bot is blocked by user', async (t) => {
  const fromId = FAKE_USER_ID;
  const messageId = 23;
  const firstScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: SESSION_MSG,
      chat_id: fromId,
    })
    .reply(200, {
      error_code: 403,
    });
  const secondScope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query(
      (query) =>
        query.text.includes(
          'Sorry, but you have to start a conversation with me first.'
        ) &&
        query.text.includes(
          'Follow the link https://t.me/ek_tgif_dev_bot to do this. Then try again.'
        ) &&
        query.text.includes('Cheers!') &&
        query.chat_id === String(CHAT_ID) &&
        query.reply_to_message_id === String(messageId)
    )
    .reply(200, {});
  const ddb = {
    getSettingsSession: async () => ({ SessionId: SESSION_ID }),
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
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: SESSION_MSG,
      chat_id: fromId,
    })
    .reply(200, {});
  const ddb = {
    getSettingsSession: async () => ({ SessionId: SESSION_ID }),
    updateSettingsSession: async () => void 0,
  };
  const result = await tgif(event({ text: '/tgif  settings', fromId }), ddb);

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
});

test('updating an existing session', async (t) => {
  const fromId = FAKE_USER_ID;
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: SESSION_MSG,
      chat_id: fromId,
    })
    .reply(200, {});
  const ddb = {
    getSettingsSession: t.context.stub(async () => ({ SessionId: SESSION_ID })),
    updateSettingsSession: t.context.stub(),
  };
  const result = await tgif(event({ text: '/tgif  settings', fromId }), ddb);

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(ddb.getSettingsSession.calls.length, 1);
  t.is(ddb.getSettingsSession.calls[0].arguments[0], fromId);
  t.is(ddb.updateSettingsSession.calls.length, 1);
  t.is(ddb.updateSettingsSession.calls[0].arguments[0], fromId);
});

test('creating a new existing session', async (t) => {
  const fromId = FAKE_USER_ID;
  const scope = nock(TELEGRAM_HOSTNAME)
    .get(`${TELEGRAM_BASE_PATHNAME}sendMessage`)
    .query({
      text: SESSION_MSG,
      chat_id: fromId,
    })
    .reply(200, {});
  const ddb = {
    getSettingsSession: t.context.stub(async () => void 0),
    createSettingsSession: t.context.stub(async () => SESSION_ID),
  };
  const result = await tgif(event({ text: '/tgif  settings', fromId }), ddb);

  t.true(scope.isDone());
  t.is(result.statusCode, 202);
  t.is(ddb.getSettingsSession.calls.length, 1);
  t.is(ddb.getSettingsSession.calls[0].arguments[0], fromId);
  t.is(ddb.createSettingsSession.calls.length, 1);
  t.is(ddb.createSettingsSession.calls[0].arguments[0], fromId);
});
