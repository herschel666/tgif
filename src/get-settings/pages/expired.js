const { site, html } = require('@herschel666/tgif-html');

const title = 'Session expired';

const bodyContent = html`
  <main class="container mx-auto p-4 my-2">
    <h1
      class="mb-8 pb-2 border-b-2 border-gray-200 text-xl text-gray-900 leading-tight"
    >
      Sorry, your session expired.
    </h1>
  </main>
`;

module.exports = site({ title, bodyContent });
