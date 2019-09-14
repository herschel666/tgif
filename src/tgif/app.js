const { tgif } = require('./tgif');

exports.lambdaHandler = async (event) => {
  console.log('Version: %s', process.env.GIT_SHA);
  console.log(event);
  const { message, edited_message } = JSON.parse(event.body);
  const { text, chat, date } = { ...message, ...edited_message };

  return await tgif({
    chatId: chat.id,
    date,
    text,
  });
};
