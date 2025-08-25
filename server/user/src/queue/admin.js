import kafka from "../config/kafkaClient.js";

async function adminInit() {
  try {
    const admin = kafka.admin();

    await admin.connect();
    console.log("conneted to kafka");

    await admin.createTopics({
      topics: [{ topic: "send-otp", numPartitions: 1 }],
    });

    await admin.disconnect();
    console.log("✅ Kafka Infrastructure setup Done ");
  } catch (error) {
    console.log("kafka admin Error", error);
  }
}

export default adminInit;
