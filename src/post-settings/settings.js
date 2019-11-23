const {
  isValidSession,
  isValidTimezone,
} = require('@herschel666/tgif-settings');

const handler = async ({ userId, sessionId, timezone, path }, ddb) => {
  const isSessionValid = await isValidSession({ userId, sessionId }, ddb);
  const headers = { 'content-type': 'text/plain; charset=utf8' };

  if (!isSessionValid) {
    return {
      statusCode: 403,
      body: 'Session expired',
      headers,
    };
  }

  const response = {
    statusCode: 302,
    headers: {
      Location: path,
    },
  };
  let status = 'success';

  if (!isValidTimezone(timezone)) {
    status = 'error';
  } else {
    await ddb.putUser(userId, timezone);
  }
  response.headers.Location += `?${status}`;

  return response;
};

module.exports = {
  settings: handler,
};
