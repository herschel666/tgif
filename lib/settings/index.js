exports.getValidatedParams = ({ sessionId, ...pathParameters }) => {
  const userId = parseInt(pathParameters.userId, 10);

  if (Number.isNaN(userId)) {
    throw Error('The given user ID is invalid.');
  }

  if (!Boolean(sessionId.match(/^[0-9a-f]{48}/))) {
    throw Error('The given session ID is invalid.');
  }

  return { userId, sessionId };
};

exports.isValidSession = async ({ userId, sessionId }, ddb) => {
  const sessionEntry = await ddb.getSettingsSession(userId);

  return sessionEntry && sessionEntry.SessionId === sessionId;
};
