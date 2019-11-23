import ava from 'ava';
import ninos from 'ninos';
import {
  getValidatedParams,
  isValidSession,
  isValidTimezone,
  sanitizeTimezone,
} from '.';

const VALID_USER_ID_VALUE = '1';
const VALID_SESSION_ID = '5d60911a8424d224e460cc1f0ffbe7964f05aae498d4d6e4';

const test = ninos(ava);

test('#getValidatedParams; invalid user ID', (t) =>
  [
    {},
    { userId: null },
    { userId: /^yolo$/ },
    { userId: { foo: 'bar' } },
    { userId: () => 'swag' },
    { userId: true },
    { userId: 'pefix-12345' },
  ].forEach((args) => {
    const { message } = t.throws(() => getValidatedParams(args));
    t.is(message, 'The given user ID is invalid.');
  }));

test('#getValidatedParams; valid user ID', (t) =>
  [
    { userId: 0, expected: 0 },
    { userId: VALID_USER_ID_VALUE, expected: Number(VALID_USER_ID_VALUE) },
    { userId: 12345, expected: 12345 },
    { userId: '12345', expected: 12345 },
    { userId: '12345-suffix', expected: 12345 },
  ]
    .map((o) => ({ ...o, sessionId: VALID_SESSION_ID }))
    .forEach(({ expected, ...args }) => {
      t.is(getValidatedParams(args).userId, expected);
    }));

test('#getValidatedParams; invalid session ID', (t) =>
  [
    {},
    { sessionId: null },
    { sessionId: /^yolo$/ },
    { sessionId: { foo: 'bar' } },
    { sessionId: () => 'swag' },
    { sessionId: true },
    { sessionId: 'foobar-12345' },
  ]
    .map((o) => ({ ...o, userId: VALID_USER_ID_VALUE }))
    .forEach((args) => {
      const { message } = t.throws(() => getValidatedParams(args));
      t.is(message, 'The given session ID is invalid.');
    }));

test('#getValidatedParams; valid session ID', (t) => {
  const { sessionId } = getValidatedParams({
    userId: VALID_USER_ID_VALUE,
    sessionId: VALID_SESSION_ID,
  });
  t.is(sessionId, VALID_SESSION_ID);
});

test('#isValidSession; missing entry', async (t) => {
  const getSettingsSession = t.context.stub();
  const userId = '1';

  t.false(await isValidSession({ userId }, { getSettingsSession }));
  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], userId);
});

test('#isValidSession; missing session', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({ sessionId: '1' }));
  const userId = '1';
  const sessionId = '2';

  t.false(await isValidSession({ userId, sessionId }, { getSettingsSession }));
  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], userId);
});

test('#isValidSession; valid session', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: VALID_SESSION_ID,
  }));
  const userId = '1';
  const sessionId = VALID_SESSION_ID;

  t.true(await isValidSession({ userId, sessionId }, { getSettingsSession }));
  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], userId);
});

test('#isValidTimezone; invalid timezone', (t) =>
  [
    null,
    /^yolo$/,
    { foo: 'bar' },
    () => 'swag',
    true,
    'foobar-12345',
    `'; alert(1); '`,
    'Eur0pe/Berlin',
    ' Asia/Baku  ',
    'Pacific/Port Moresby',
  ].forEach((tz) => t.false(isValidTimezone(tz))));

test('#isValidTimezone; valid timezone', (t) =>
  [
    'Europe/Berlin',
    'Asia/Baku',
    'Pacific/Port_Moresby',
    'America/Argentina/San_Juan',
    'America/Blanc-Sablon',
  ].forEach((tz) => t.true(isValidTimezone(tz))));

test('#sanitizeTimezone; returns sanitized value', (t) =>
  [
    [null, ''],
    [/^yolo$/, ''],
    [{ foo: 'bar' }, ''],
    [() => 'swag', ''],
    [true, ''],
    ['foobar-12345', ''],
    [`'; alert(1); '`, ''],
    ['Eur0pe/Berlin', ''],
    [' Asia/Baku  ', ''],
    ['Pacific/Port Moresby', ''],

    ['Europe/Berlin'].map((x) => [x, x]).flat(),
    ['Asia/Baku'].map((x) => [x, x]).flat(),
    ['Pacific/Port_Moresby'].map((x) => [x, x]).flat(),
    ['America/Argentina/San_Juan'].map((x) => [x, x]).flat(),
    ['America/Blanc-Sablon'].map((x) => [x, x]).flat(),
  ].forEach(([tz, expected]) => t.is(sanitizeTimezone(tz), expected)));
