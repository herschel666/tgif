const { site, html } = require('@herschel666/tgif-html');

const title = 'Settings';

const bodyContent = html`
  <main class="container mx-auto p-4 my-2">
    <h1
      class="mb-8 pb-2 border-b-2 border-gray-200 text-xl text-gray-900 leading-tight"
    >
      tgif Settings
    </h1>
    <form action="" method="post" class="mb-4">
      <fieldset>
        <legend class="text-base leading-normal">
          Edit your settings…
        </legend>
        <div class="p-4 my-4 bg-gray-100">
          <label class="block text-base leading-normal" for="timezone_offset">
            Your timezone
          </label>
          <select
            name="timezone_offset"
            id="timezone_offset"
            class="mt-2 shadow opacity-50"
            disabled
          >
            <option value="">Loading timezones…</option>
          </select>
        </div>
        <button
          class="bg-blue-500 hover:bg-blue-700 focus:bg-blue-700 text-white font-bold py-2 px-4"
        >
          Submit
        </button>
      </fieldset>
    </form>
  </main>
`;

const scripts = html`
  <script>
    const select = document.getElementById('timezone_offset');

    const sortData = (data) => {
      const list = data
        .reduce(
          (acc, value) =>
            acc.concat(
              value.utc
                .filter((name) => !name.startsWith('Etc/'))
                .filter((name) => name.includes('/'))
                .map((name) => ({ offset: value.offset, name }))
            ),
          []
        )
        .reduce((acc, item, i, arr) => {
          const index = arr.findIndex(({ name }) => item.name === name);
          if (index < i) {
            return acc;
          }
          return acc.concat(item);
        }, [])
        .sort((a, b) => a.name.localeCompare(b.name));
      const europe = list.filter(({ name }) => name.startsWith('Europe/'));
      const otherWorld = list.filter(({ name }) => !name.startsWith('Europe/'));

      return europe.concat(otherWorld);
    };

    const init = (timezones) => {
      const frag = document.createDocumentFragment();

      timezones.forEach(({ name: textContent }) =>
        frag.appendChild(
          Object.assign(document.createElement('option'), {
            textContent,
          })
        )
      );

      select.removeAttribute('disabled');
      select.classList.remove('opacity-50');
      select.firstElementChild.textContent = 'Select your timezone…';
      select.appendChild(frag);
    };

    const handleError = (err) => {
      console.error(err);

      select.parentNode.appendChild(
        Object.assign(document.createElement('p'), {
          textContent: 'Failed to load the timezones. Try reloading the page.',
          className: 'mt-2 text-sm text-red-700',
        })
      );
    };

    fetch('https://unpkg.com/timezones.json@1.5.0/timezones.json').then(
      (response) =>
        response
          .json()
          .then(sortData)
          .then(init),
      handleError
    );
  </script>
`;

module.exports = site({ title, bodyContent, scripts });
