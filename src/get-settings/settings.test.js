const ninos = require('ninos');
const ava = require('ava');

const { settings } = require('./settings');

const FAKE_USER_ID = 1234567;
const SESSION_ID = '1a2b3c4d5e6f7g8h9i0j';
const TIMEZONE = 'Indian/Christmas';

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
  t.true(result.headers['content-type'].includes('text/html'));
  t.true(result.body.includes('Sorry, your session expired.'));
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
  t.true(result.headers['content-type'].includes('text/html'));
  t.true(result.body.includes('Sorry, your session expired.'));
});

test('valid session', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
  }));
  const getUser = t.context.stub();
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
    },
    { getSettingsSession, getUser }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 200);
  t.true(result.headers['content-type'].includes('text/html'));
  t.true(result.body.includes('Edit your settings…'));
  t.true(result.body.includes(`const userTimezone = '';`));
  t.false(
    result.body.includes('Successfully saved your settings.'),
    'No success message on initial page.'
  );
  t.false(
    result.body.includes('Please select a timezone.'),
    'No error message on initial page.'
  );
});

test('invalid form submit', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
  }));
  const getUser = t.context.stub(async () => ({ Timezone: TIMEZONE }));
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
      erroneous: true,
    },
    { getSettingsSession, getUser }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(getUser.calls.length, 1);
  t.is(getUser.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 200);
  t.true(result.headers['content-type'].includes('text/html'));
  t.true(result.body.includes('Edit your settings…'));
  t.true(result.body.includes(`const userTimezone = '${TIMEZONE}';`));
  t.true(result.body.includes('Please select a timezone.'));
});

test('valid form submit', async (t) => {
  const getSettingsSession = t.context.stub(async () => ({
    SessionId: SESSION_ID,
  }));
  const result = await settings(
    {
      userId: FAKE_USER_ID,
      sessionId: SESSION_ID,
      successful: true,
    },
    { getSettingsSession }
  );

  t.is(getSettingsSession.calls.length, 1);
  t.is(getSettingsSession.calls[0].arguments[0], FAKE_USER_ID);
  t.is(result.statusCode, 200);
  t.true(result.headers['content-type'].includes('text/html'));
  t.false(result.body.includes('Edit your settings…', 'Form is not present.'));
  t.true(result.body.includes('Successfully saved your settings.'));
});
