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

const RE_TIMEZONE = /^(?:Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Za-z/_-]+$/;

exports.isValidTimezone = (value) => Boolean(String(value).match(RE_TIMEZONE));

exports.sanitizeTimezone = (value) => {
  const [sanitizedValue = ''] = RE_TIMEZONE.exec(value) || [];
  return sanitizedValue;
};
