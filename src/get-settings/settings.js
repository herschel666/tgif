const expiredPage = require('./pages/expired');
const successPage = require('./pages/success');
const formPage = require('./pages/form');

const handler = async ({ userId, sessionId, erroneous, successful }, ddb) => {
  const sessionEntry = await ddb.getSettingsSession(userId);
  const headers = { 'content-type': 'text/html; charset=utf8' };

  if (!sessionEntry || sessionEntry.SessionId !== sessionId) {
    return {
      statusCode: 403,
      body: expiredPage,
      headers,
    };
  }

  const body = successful ? successPage : formPage(erroneous);

  return {
    statusCode: 200,
    body,
    headers,
  };
};

module.exports = {
  settings: handler,
};
