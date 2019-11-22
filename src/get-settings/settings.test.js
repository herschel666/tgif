import ninos from 'ninos';
import ava from 'ava';

import { settings } from './settings';

const FAKE_USER_ID = 1234567;
const SESSION_ID = '1a2b3c4d5e6f7g8h9i0j';

const test = ninos(ava);

test('missing session', async (t) => {
  const getSettingsSession = t.context.stub(async () => void 0);
  const result = await settings(
    {
      userId: FAKE_USER_ID,
    },
    { getSettingsSession }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 403);
  t.true(result.headers['content-type'].includes('text/plain'));
  t.is(result.body, 'Session expired');
});

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
  t.is(result.body, 'Session expired');
});

test('valid session', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
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
  t.is(result.statusCode, 200);
  t.true(result.headers['content-type'].includes('text/html'));
  t.true(result.body.includes('Edit your settings…'));
});
