const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);

const getValidatedParams = ({ sessionId, ...pathParameters }) => {
  const userId = parseInt(pathParameters.userId, 10);

  if (Number.isNaN(userId)) {
    throw Error('The given user ID is invalid.');
  }

  if (!Boolean(sessionId.match(/^[0-9a-f]{48}/))) {
    throw Error('The given session ID is invalid.');
  }

  return { userId, sessionId };
};

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
