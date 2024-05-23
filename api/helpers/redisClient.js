const { createClient } = require('redis');

/**
 * @type {import('redis').RedisClientType}
 */
let client;

const connectRedis = async () => {
  if (client && client.isOpen) return client;

  client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => {
      console.error('Redis error:', err);
  });

  await client.connect();
  console.log('Connected to Redis');
  return client;
};

// Key for the list
const listKey = 'chat-ai-questions';


/**
 * to add item to list and save to redis
 * @param {*} item data to save
 * @param {*} key key of redis
 */
const add = async (item, key) => {
  try {
    const getClient = await connectRedis();
    await getClient.lPush(key, item)
  } catch (err) {
    console.error('Error adding item:', err);
  }
}


/**
 * Function to get all items
 * @param {*} key key of redis
 */
const list = async (key) => {
  try {
    const getClient = await connectRedis();
    const items = getClient.lRange(key, 0, -1);
    return items;
  } catch (error) {
    console.error('Error retrieving questions:', err);
    return [];
  }
}


module.exports = { listKey, add, list };