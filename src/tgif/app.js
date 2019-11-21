const ddb = require('@herschel666/tgif-ddb');
const { tgif } = require('./tgif');

exports.tgifHandler = async (event) => {
  console.log('Version: %s', process.env.GIT_SHA);
  console.log(event);
  const { message, edited_message } = JSON.parse(event.body);
  const { text, chat, date, from, message_id: messageId } = {
    ...message,
    ...edited_message,
  };

  return await tgif(
    {
      chatId: chat.id,
      fromId: from.id,
      messageId,
      date,
      text,
    },
    ddb
  );
};
