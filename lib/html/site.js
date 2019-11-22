const defaultOptions = {
  title: null,
  htmlClass: '',
  bodyClass: '',
  styles: '',
  headContent: '',
  bodyContent: '',
  scripts: '',
};

module.exports = (html) => (args) => {
  const options = { ...defaultOptions, ...args };

  return html`
    <!DOCTYPE html>
    <html lang="en" class="text-gray-900 antialiased ${options.htmlClass}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/1.1.2/tailwind.min.css"
          integrity="sha256-bCQF5OufWlWM/MW9mCb/eDibvff1W8BNq9ZK69C8FSI="
          crossorigin="anonymous"
        />
        ${options.styles}
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <title>
          ${options.title ? `${options.title} | ` : ''}tgif Telegram bot
        </title>
        ${options.headContent}
      </head>
      <body class="bg-white ${options.htmlClass}">
        ${options.bodyContent}
        <footer class="container mx-auto p-4 my-2 text-gray-600">
          <p>
            &copy;
            <a
              href="https://twitter.com/Herschel_R"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-blue-600 focus:text-blue-600 hover:underline focus:underline"
            >
              Emanuel Kluge
            </a>
            ${new Date().getFullYear()}
          </p>
        </footer>
        ${options.scripts}
      </body>
    </html>
  `.trim();
};
