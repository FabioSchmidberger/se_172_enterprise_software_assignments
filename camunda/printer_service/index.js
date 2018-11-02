const { Client, logger } = require("camunda-external-task-client-js");

// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

client.subscribe("print-tweet", async function({ task, taskService }) {
  const text = task.variables.get('text');
  console.log(`You tweeted: ${text}`);
  await taskService.complete(task);
});
