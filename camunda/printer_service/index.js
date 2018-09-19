const { Client, logger } = require("camunda-external-task-client-js");

// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: "http://192.168.99.100:8080/engine-rest", use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'creditScoreChecker'
client.subscribe("print-tweet", async function({ task, taskService }) {
  // Put your business logic

  const text = task.variables.get('text');

  console.log(`You tweeted: ${text}`);

  // complete the task
  await taskService.complete(task);
});
