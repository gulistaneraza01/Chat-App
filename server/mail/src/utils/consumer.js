import transporter from "../config/connectNodemailer.js";
import kafka from "../config/kafkaClient.js";

async function mailConsumer() {
  try {
    const consumer = kafka.consumer({ groupId: "group-1" });

    await consumer.connect();
    await consumer.subscribe({ topic: "send-otp", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const { to, subject, body } = JSON.parse(message.value.toString());

          const mailData = {
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            text: body,
          };

          transporter.sendMail(mailData);
          console.log(`✉️ Sended mail to ${to}`);
        } catch (error) {
          console.log(`Failed To Send Mail Consumer Kafka: ${error}`);
        }
      },
    });
  } catch (error) {
    console.log(`Error Connection To Kafka: ${error}`);
  }
}

export default mailConsumer;
