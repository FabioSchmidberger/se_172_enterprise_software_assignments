const OAuth = require('oauth');
const config = require('config');
const { Client, logger } = require("camunda-external-task-client-js");
const camunda_config = { baseUrl: "http://192.168.99.100:8080/engine-rest", use: logger };

// create a Client instance with custom configuration
const client = new Client(camunda_config);

const twitter_application_consumer_key = config.get('twitter.application_consumer_key');  // API Key
const twitter_application_secret = config.get('twitter.application_secret');  // API Secret
const twitter_user_access_token = config.get('twitter.user_access_token');  // Access Token
const twitter_user_secret = config.get('twitter.user_secret');  // Access Token Secret

var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	twitter_application_consumer_key,
	twitter_application_secret,
	'1.0A',
	null,
	'HMAC-SHA1'
);

// susbscribe to the topic: 'creditScoreChecker'
client.subscribe("post-tweet", async function({ task, taskService }) {
  // Put your business logic

  const text = task.variables.get('text');

  const tweet = {
    status: text
  }

  console.log(`You tweeted: ${text}`);

  oauth.post('https://api.twitter.com/1.1/statuses/update.json',
	twitter_user_access_token,  // oauth_token (user access token)
    twitter_user_secret,  // oauth_secret (user secret)
    tweet,  // post body
    '',  // post content type ?
	function(err, data, res) {
		if (err) {
			console.log(err);
		} else {
			console.log("No Error");
		}
	});

  // complete the task
  await taskService.complete(task);
});


