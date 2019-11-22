const html = require('./html');
const site = require('./site');

module.exports = { html, site: site(html) };
