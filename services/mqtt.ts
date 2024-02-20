import { PrismaClient } from "@prisma/client";
import mqtt, { MqttClient } from "mqtt";
import { MQTTHelper } from "../helper/mqttHelper";

class MqttService {
  private prisma: PrismaClient;
  private mqttClient: MqttClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.mqttClient = mqtt.connect({
      host: process.env.EMQX_URL,
      port: Number(process.env.EMQX_PORT),
      username: process.env.EMQX_ADMIN_USERNAME,
      password: process.env.EMQX_ADMIN_PASSWORD,
    });

    this.mqttClient.on('connect', () => {
      console.log("Connected to the MQTT broker");
      this.mqttClient.subscribe('user/#');
    });

    this.mqttClient.on('message', this.handleMessage.bind(this));

    this.mqttClient.on('error', (error) => {
      console.log("Failed to connect to the MQTT broker:", error);
    });

  }

  private handleMessage(topic: string, message: Buffer) {
    console.log('recieved message')
    const mqttHelper = new MQTTHelper();
    mqttHelper.handleMQTTMessage(topic, message.toString());
  }

}

export default MqttService;
