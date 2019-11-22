const expiredPage = require('./pages/expired');
const formPage = require('./pages/form');

const handler = async ({ userId, sessionId }, ddb) => {
  const sessionEntry = await ddb.getSettingsSession(userId);
  const headers = { 'content-type': 'text/html; charset=utf8' };

  if (!sessionEntry || sessionEntry.SessionId !== sessionId) {
    return {
      statusCode: 403,
      body: expiredPage,
      headers,
    };
  }

  return {
    statusCode: 200,
    body: formPage,
    headers,
  };
};

module.exports = {
  settings: handler,
};
