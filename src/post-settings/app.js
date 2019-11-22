const { parse } = require('querystring');
const ddb = require('@herschel666/tgif-ddb');
const { getValidatedParams } = require('@herschel666/tgif-settings');
const { settings } = require('./settings');

exports.postSettingsHandler = async (event) => {
  console.log('Version: %s', process.env.GIT_SHA);
  console.log(event);
  const { path, pathParameters, body } = event;
  const { userId, sessionId } = getValidatedParams(pathParameters);
  const { timezone } = parse(body);

  return await settings({ userId, sessionId, timezone, path }, ddb);
};
