const { settings } = require('./settings');

const { getValidatedParams } = require('@herschel666/tgif-settings');

exports.getSettingsHandler = async (event) => {
  console.log(event);
  const { userId, sessionId } = getValidatedParams(event.pathParameters);

  return await settings({ userId, sessionId });
};
