const handler = async ({ userId, sessionId, timezone, path }, ddb) => {
  const sessionEntry = await ddb.getSettingsSession(userId);
  const headers = { 'content-type': 'text/plain; charset=utf8' };

  if (!sessionEntry || sessionEntry.SessionId !== sessionId) {
    return {
      statusCode: 403,
      body: 'Session expired',
      headers,
    };
  }

  const response = {
    statusCode: 302,
    headers: {
      Location: path,
    },
  };
  let status = 'success';

  if (!timezone) {
    status = 'error';
  } else {
    await ddb.putUser(userId, timezone);
  }
  response.headers.Location += `?${status}`;

  return response;
};

module.exports = {
  settings: handler,
};
