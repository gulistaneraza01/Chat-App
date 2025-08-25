import kafka from "../../config/kafkaClient.js";
import { Partitioners } from "kafkajs";

async function mailPublisher(topic, value) {
  try {
    const producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });

    await producer.connect();
    await producer.send({ topic, messages: [{ value }] });
    console.log("✉️ Message sent to mailConsumer");

    await producer.disconnect();
  } catch (error) {
    console.log("mailpublisher error", error);
  }
}

export default mailPublisher;
