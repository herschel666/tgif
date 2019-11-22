const ddb = require('@herschel666/tgif-ddb');
const { getValidatedParams } = require('@herschel666/tgif-settings');
const { settings } = require('./settings');

exports.getSettingsHandler = async (event) => {
  console.log('Version: %s', process.env.GIT_SHA);
  console.log(event);
  const { userId, sessionId } = getValidatedParams(event.pathParameters);
  const { error, success } = event.queryStringParameters || {};
  const erroneous = error === '';
  const successful = success === '';

  return await settings({ userId, sessionId, erroneous, successful }, ddb);
};
