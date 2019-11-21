const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getValidatedParams } = require('@herschel666/tgif-settings');

const readFile = promisify(fs.readFile);

exports.getSettingsHandler = async (event) => {
  console.log(event);
  const { userId, sessionId } = getValidatedParams(event.pathParameters);
  console.log('userId, sessionId', userId, sessionId);

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
