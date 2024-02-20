const serverless = require('serverless-http');

let instance = null;

// https://github.com/directus/directus/discussions/15572#discussioncomment-3707336
const setup = async (event, context) => {
  const { createApp } = await import('@directus/api');
  const app = await createApp();
  instance = serverless(app);
  return instance(event, context);
};

const handler = async (event, context) => {
  if (instance) return instance(event, context);
  return setup(event, context);
};

module.exports.handler = handler;
