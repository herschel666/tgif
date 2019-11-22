const { isValidSession } = require('@herschel666/tgif-settings');
const expiredPage = require('./pages/expired');
const successPage = require('./pages/success');
const formPage = require('./pages/form');

const handler = async ({ userId, sessionId, erroneous, successful }, ddb) => {
  const isSessionValid = await isValidSession({ userId, sessionId }, ddb);
  const headers = { 'content-type': 'text/html; charset=utf8' };

  if (!isSessionValid) {
    return {
      statusCode: 403,
      body: expiredPage,
      headers,
    };
  }

  let body = successPage;

  if (!successful) {
    const user = await ddb.getUser(userId);
    body = formPage(erroneous, user ? user.Timezone : '');
  }

  return {
    statusCode: 200,
    body,
    headers,
  };
};

module.exports = {
  settings: handler,
};
