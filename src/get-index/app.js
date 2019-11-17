exports.getIndexHandler = async (event) => {
  console.log(event);
  const headers = { 'content-type': 'text/html; charset=utf8' };
  const body = `<!doctype html>
<html>
  <head lang="en">
    <meta charset="utf-8">
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>`;

  return {
    statusCode: 200,
    headers,
    body,
  };
};
