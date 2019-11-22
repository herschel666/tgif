const { site, html } = require('@herschel666/tgif-html');

const title = 'Session expired';

const bodyContent = html`
  <main class="container mx-auto p-4 my-2">
    <h1
      class="mb-8 pb-2 border-b-2 border-gray-200 text-xl text-gray-900 leading-tight"
    >
      Sorry, your session expired.
    </h1>
    <button
      id="close-window"
      class="bg-blue-500 hover:bg-blue-700 focus:bg-blue-700 text-white font-bold py-2 px-4"
    >
      Close
    </button>
  </main>
`;

const scripts = html`
  <script>
    const button = document.getElementById('close-window');
    const closeWindow = () => {
      button.removeEventListener('click', closeWindow);
      window.close();
    };

    button.addEventListener('click', closeWindow);
  </script>
`;

module.exports = site({ title, bodyContent, scripts });
