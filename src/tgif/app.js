const { tgif } = require('./tgif');

exports.lambdaHandler = async (event) => {
  console.log('Version: %s', process.env.GIT_SHA);
  console.log(event);
  const { message } = JSON.parse(event.body);

  return await tgif({
    text: message.text,
    chatId: message.chat.id,
    date: message.date,
  });
};
