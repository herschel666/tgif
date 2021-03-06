const crypto = require('crypto');
const AWS = require('aws-sdk');

const { TABLE_NAME } = process.env;

const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  maxRetries: 2,
});

const getExpiryDate = () => Math.round(Date.now() / 1000) + 60 * 15;

const getSettingsSession = async (userId) => {
  const now = Math.round(Date.now() / 1000);
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ItemType: 'SettingsSession',
      ItemId: userId,
    },
  };
  const { Item } = await docClient.get(params).promise();

  return Item && Item.ExpiryDate > now ? Item : void 0;
};

const createSettingsSession = async (userId) => {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ItemType: 'SettingsSession',
      SessionId: sessionId,
      ItemId: userId,
      ExpiryDate: getExpiryDate(),
    },
  };
  await docClient.put(params).promise();
  return sessionId;
};

const updateSettingsSession = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ItemType: 'SettingsSession',
      ItemId: userId,
    },
    ExpressionAttributeValues: {
      ':ExpiryDate': getExpiryDate(),
    },
    UpdateExpression: 'set ExpiryDate = :ExpiryDate',
  };
  await docClient.update(params).promise();
};

const putUser = async (userId, timezone) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ItemType: 'User',
      ItemId: userId,
      Timezone: timezone,
    },
  };
  await docClient.put(params).promise();
};

const getUser = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ItemType: 'User',
      ItemId: userId,
    },
  };
  const { Item } = await docClient.get(params).promise();
  return Item;
};

module.exports = {
  getSettingsSession,
  createSettingsSession,
  updateSettingsSession,
  putUser,
  getUser,
};
