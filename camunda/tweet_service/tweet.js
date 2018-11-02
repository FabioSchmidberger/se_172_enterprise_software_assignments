const OAuth = require('oauth');
const config = require('config');
const {Client, logger} = require('camunda-external-task-client-js');
const camunda_config = {baseUrl: 'http://localhost:8080/engine-rest', use: logger};

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
    (isGet ? oauth.get : oauth.post)(
      url,
      twitter_user_access_token,
      twitter_user_secret,
      params,
      '',
      (err, data, res) => {
        if (err) {
          console.log(`${taskName} failed`, err);
          onError && onError(err);
        } else {
          console.log(`${taskName} success`, params, data, res);
          onSuccess && onSuccess(task.variables, res);
        }
      });
    await taskService.complete(task);
  });

subscribe(
  'post-tweet',
  () => 'https://api.twitter.com/1.1/statuses/update.json',
  ctx => ({status: ctx.get('text')}),
  (ctx, res) => ctx.set('tweet-Id', res.id)
);

subscribe(
  'destroy-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/destroy/${ctx.get('tweet-Id')}.json`,
  ctx => ({id: ctx.get('tweet-Id')})
);

subscribe(
  'reply-tweet',
  () => `https://api.twitter.com/1.1/statuses/update.json`,
  ctx => ({status: ctx.get('text'), 'in_reply_to_status_id': ctx.get('tweet-Id')})
);

subscribe(
  'retweet-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/retweet/${ctx.get('tweet-Id')}.json`,
  ctx => ({id: ctx.get('tweet-Id')}),
  (ctx, res) => ctx.set('retweet-Id', res.id)
);

subscribe(
  'unretweet-tweet',
  ctx => `https://api.twitter.com/1.1/statuses/unretweet/${ctx.get('retweet-Id')}.json`,
  ctx => ({id: ctx.get('tweet-Id')})
);

subscribe(
  'favorite-tweet',
  () => `https://api.twitter.com/1.1/statuses/favorties/create.json`,
  ctx => ({id: ctx.get('tweet-Id')})
);

subscribe(
  'unfavorite-tweet',
  () => `https://api.twitter.com/1.1/statuses/favorties/destroy.json`,
  ctx => ({id: ctx.get('tweet-Id')})
);

subscribe(
  'show-tweet',
  () => `https://api.twitter.com/1.1/statuses/show.json`,
  ctx => ({id: ctx.get('tweet-Id')}),
  (ctx, res) => {
    ctx.set('favorited', res.favorited);
    ctx.set('retweeted', res.retweeted);
    ctx.set('in_reply_to_status_id', res.in_reply_to_status_id);
  },
  undefined,
  true
);
