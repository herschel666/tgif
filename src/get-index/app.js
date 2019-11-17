const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);

const isProd = process.env.STAGE === 'prod';

exports.getIndexHandler = async (event) => {
  console.log(event);
  const headers = { 'content-type': 'text/html; charset=utf8' };
  const content = await readFile(path.join(__dirname, 'index.html'), 'utf8');
  const currentYear = new Date().getFullYear();
  const botName = isProd ? 'ek_tgif_bot' : 'ek_tgif_dev_bot';
  const body = content
    .replace('{{year}}', currentYear)
    .replace('{{bot_name}}', botName);

  return {
    statusCode: 200,
    headers,
    body,
  };
};
