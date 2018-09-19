Camunda Test
============

Follow this online guide: https://docs.camunda.org/get-started/quick-start

docker run -d -p 8080:8080 camunda/camunda-bpm-platform:latest

install modeler as desktop application

- yarn init to create new service
- yarn add camunda-external-task-client-js
- start service with `node index.js`

build services with 

- use modeler to deploy
- configure deployment endpoint to url of container
- start process through the tasklist




What is camunda workbench?



docker run --name workbench -p 8080:8080 -p 8090:8090 -p 9090:9090 \
           camunda/camunda-bpm-workbench