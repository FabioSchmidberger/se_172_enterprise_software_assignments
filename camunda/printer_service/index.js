const { Client, logger } = require("camunda-external-task-client-js");

const config = require('config');

const camunda_config = {baseUrl: config.get('camunda.url'), use: logger};

// create a Client instance with custom configuration
const client = new Client(camunda_config);

client.subscribe("print-tweet", async function({ task, taskService }) {
  const text = task.variables.get('text');
  console.log(`You tweeted: ${text}`);
  await taskService.complete(task);
});
