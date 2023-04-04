import { createClient } from 'redis';


//Create class containing the RedisClient

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.error(`Redis error: ${err}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          return reject(err);
        }
        resolve(value);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
