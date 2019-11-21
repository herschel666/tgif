const { parse } = require('querystring');

// TODO put into util package
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

exports.postSettingsHandler = async (event) => {
  console.log(event);
  const { userId, sessionId } = getValidatedParams(event.pathParameters);
  const { timezone_offset: timezoneOffset } = parse(event.body);

  console.log(userId, sessionId, timezoneOffset);

  return {
    statusCode: 204,
    body: '',
  };
};
