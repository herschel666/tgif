const { parse } = require('querystring');
const { getValidatedParams } = require('@herschel666/tgif-settings');

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
