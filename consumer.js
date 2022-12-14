const kafka = require("./kafka");

const consumer = kafka.consumer({
  groupId: process.env.GROUP_ID,
});

const main = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: process.env.TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Received message", {
        topic,
        partition,
        key: message.key ? message.key.toString() : "key undefined",
        value: message.value ? message.value.toString() : "value undefined",
      });
    },
  });
};

main().catch(async (error) => {
  console.error(error);
  try {
    await consumer.disconnect();
  } catch (e) {
    console.error("Failed to gracefully disconnect consumer", e);
  }
  process.exit(1);
});
