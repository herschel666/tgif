const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);

const handler = async ({ userId, sessionId }, ddb) => {
  const sessionEntry = await ddb.getSettingsSession(userId);

  if (!sessionEntry || sessionEntry.SessionId !== sessionId) {
    const headers = { 'content-type': 'text/plain; charset=utf8' };
    const body = 'Session expired';
    return {
      statusCode: 403,
      headers,
      body,
    };
  }

  const headers = { 'content-type': 'text/html; charset=utf8' };
  const content = await readFile(path.join(__dirname, 'index.html'), 'utf8');
  const currentYear = new Date().getFullYear();
  const body = content.replace('{{year}}', currentYear);

  return {
    statusCode: 200,
    headers,
    body,
  };
};

module.exports = {
  settings: handler,
};
