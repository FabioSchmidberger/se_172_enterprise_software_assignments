const OAuth = require('oauth');
const config = require('config');
const {Client, Variables, logger} = require('camunda-external-task-client-js');

const base_url = config.get('camunda.url');

const camunda_config = {baseUrl: base_url, use: logger};

// create a Client instance with custom configuration
const client = new Client(camunda_config);

const twitter_application_consumer_key = config.get('twitter.application_consumer_key');  // API Key
const twitter_application_secret = config.get('twitter.application_secret');  // API Secret
const twitter_user_access_token = config.get('twitter.user_access_token');  // Access Token
const twitter_user_secret = config.get('twitter.user_secret');  // Access Token Secret

const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  twitter_application_consumer_key,
  twitter_application_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

const subscribe = (taskName, urlGetter, paramGetter, onSuccess, onError, isGet) =>
  client.subscribe(taskName, async ({task, taskService}) => {
    const url = urlGetter(task.variables);
    const params = paramGetter(task.variables);

    const resultVariables = new Variables();

    await new Promise((resolve, reject) => {
      oauth.post(
      url,
      twitter_user_access_token,
      twitter_user_secret,
      params,
      '',
      (err, data, res) => {
        if (err) {
          console.log(`${taskName} failed`, err);
          onError && onError(err);
          reject();
        } else {
          console.log(`${taskName} success`, `params\n\n\n:`, params, `data\n\n`, data, `res\n\n:`, res);
          onSuccess && onSuccess(resultVariables, data);
          resolve();
        }
      });
    });
    await taskService.complete(task, resultVariables);
  });

subscribe(
  'post-tweet',
  () => 'https://api.twitter.com/1.1/statuses/update.json',
  ctx => ({status: ctx.get('text')}),
  (ctx, data) => { 
    const tweetid = JSON.parse(data).id_str;
    console.log('post-tweet with ID: ' + tweetid); 
    ctx.setAll({tweetid});
  }
);

client.subscribe('print-id', async ({task, taskService}) => {
  const text = task.variables.get('tweetid');
  console.log("print-id: " + text);
  await taskService.complete(task);
});

subscribe(
  'destroy-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/destroy/${ctx.get('tweetid')}.json`,
  ctx => {console.log(ctx.get('tweetid')); return {id: ctx.get('tweetid')}}
);

subscribe(
  'reply-tweet',
  () => `https://api.twitter.com/1.1/statuses/update.json`,
  ctx => ({status: ctx.get('text'), 'in_reply_to_status_id': ctx.get('tweetid')})
);

subscribe(
  'retweet-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/retweet/${ctx.get('tweetid')}.json`,
  ctx => ({id: ctx.get('tweetid')}),
  (ctx, res) => ctx.set('retweet-Id', res.id)
);

subscribe(
  'unretweet-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/unretweet/${ctx.get('retweet-Id')}.json`,
  ctx => ({id: ctx.get('tweetid')})
);

subscribe(
  'favorite-tweet',
  () => `https://api.twitter.com/1.1/favorties/create.json`,
  ctx => ({id: ctx.get('tweetid')})
);

subscribe(
  'unfavorite-tweet',
  () => `https://api.twitter.com/1.1/favorties/destroy.json`,
  ctx => ({id: ctx.get('tweetid')})
);

subscribe(
  'show-tweet',
  () => `https://api.twitter.com/1.1/statuses/show.json`,
  ctx => ({id: ctx.get('tweetid')}),
  (ctx, res) => {
    ctx.set('favorited', res.favorited);
    ctx.set('retweeted', res.retweeted);
    ctx.set('in_reply_to_status_id', res.in_reply_to_status_id);
  },
  undefined,
  true
);
