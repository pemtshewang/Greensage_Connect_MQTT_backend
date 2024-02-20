import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../db/db";

export class MQTTHelper {
  private db: PrismaClient;

  constructor() {
    this.db = getPrismaClient();
  }

  public handleMQTTMessage(topic: string, payload: string) {
    this.identifyTopics(topic, payload);
  }

  public identifyTopics(topic: string, payload: string) {
    const topicFormatted = topic.split('/');
    const identifier = topicFormatted.shift();
    switch (identifier) {
      case "user":
        this.handleUserMessage(topicFormatted, payload)
        break;
      case "system":
        this.handleSystemMessage(topicFormatted, payload);
        break;
      default:
        break;
    }
  }

  private async handleUserMessage(topic: string[], payload: string) {
    const [userBrokerId, controllerId, actionIdentifier, ...action] = topic
    switch (actionIdentifier) {
      case "readings":
        const readings = payload.split('|');
        let temperature, pressure, humidity, soilMoisture;
        for (const item of readings) {
          const [type, value] = item.split(":");
          switch (type) {
            case "temperature":
              temperature = parseFloat(value); // Assuming value is a string representation of temperature
              break;
            case "humidity":
              humidity = parseFloat(value); // Assuming value is a string representation of humidity
              break;
            case "soilMoisture":
              soilMoisture = parseFloat(value); // Assuming value is a string representation of soil moisture
              break;
            case "pressure":
              pressure = parseFloat(value); // Assuming value is a string representation of soil moisture
              break;
            default:
              break;
          }
        }
        await this.db.reading.create({
          data: {
            controllerId: controllerId,
            brokerId: userBrokerId,
            humidity,
            Pressure: pressure,
            temperature,
            soilMoisture,
          }
        })
        console.log('updated')
        break;
      case "threshold":
        const type = action[0];
        console.log("Updated for threshold")
        switch (type) {
          case "temperature":
            await this.db.temperatureThresholdRecord.create({
              data: {
                brokerId: userBrokerId,
                controllerId: controllerId,
                value: parseFloat(payload),
              }
            })
            break;
          case "soilMoisture":
            await this.db.soilMoistureThresholdRecord.create({
              data: {
                brokerId: userBrokerId,
                controllerId: controllerId,
                value: parseFloat(payload),
              }
            })
            break;
          case "humidity":
            await this.db.humidityThresholdRecord.create({
              data: {
                brokerId: userBrokerId,
                controllerId: controllerId,
                value: parseFloat(payload),
              }
            })
            break;
        }
        break;
      case "wschedule":
        const [startTime, endTime, repetitionDays] = payload.split("|")
        await this.db.waterScheduleRecord.create({
          data: {
            brokerId: userBrokerId,
            controllerId: controllerId,
            startTime: startTime,
            endTime: endTime,
            repetitionDays: Number(repetitionDays)
          }
        })
        console.log("wrote wschedule")
        break;
      default:
        break;
    }
  }

  private handleSystemMessage(topic: string[], payload: string) {
  }
}
