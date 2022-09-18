// const createHookReceiver = require("npm-hook-receiver");
const kafka = require("./kafka");
const express = require("express");
const app = express();
app.use(express.json());
const producer = kafka.producer();

const main = async () => {
  await producer.connect();
  app.post("/hook", async (req, res) => {
    try {
      const event = req.body;
      console.log(JSON.stringify(req.body));
      const responses = await producer.send({
        topic: process.env.TOPIC,
        messages: [
          {
            // Name of the published package as key, to make sure that we process events in order
            key: event.name,

            // The message value is just bytes to Kafka, so we need to serialize our JavaScript
            // object to a JSON string. Other serialization methods like Avro are available.
            value: JSON.stringify({
              package: event.name,
              version: event.version,
            }),
          },
        ],
      });

      console.log("Published message", { responses });
    } catch (error) {
      console.error("Error publishing message", error);
    }
    res.send("hello");
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
