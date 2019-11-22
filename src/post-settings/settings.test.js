import ninos from 'ninos';
import ava from 'ava';

import { settings } from './settings';

const FAKE_USER_ID = 1234567;
const SESSION_ID = '1a2b3c4d5e6f7g8h9i0j';
const TIMEZONE = 'Indian/Christmas';
const PATHNAME = '/lorem/ipsum';

const test = ninos(ava);

test('invalid session', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: 'whaddup',
  }));
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
    },
    { getSettingsSession }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 403);
  t.true(result.headers['content-type'].includes('text/plain'));
  t.true(result.body.includes('Session expired'));
});

test('missing timezone', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
  }));
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
      timezone: '',
      path: PATHNAME,
    },
    { getSettingsSession }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 302);
  t.is(result.headers.Location, `${PATHNAME}?error`);
});

test('valid form submit', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
  }));
  const putUser = t.context.stub();
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
      timezone: TIMEZONE,
      path: PATHNAME,
    },
    { getSettingsSession, putUser }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(putUser.calls.length, 1);
  t.is(putUser.calls[0].arguments[0], FAKE_USER_ID);
  t.is(putUser.calls[0].arguments[1], TIMEZONE);
  t.is(result.statusCode, 302);
  t.is(result.headers.Location, `${PATHNAME}?success`);
});
