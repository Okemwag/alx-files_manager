const RedisClient = require('..utils/redis');
const DBClient = require('..utils/db');



class AppController {
  static async getStatus(req, res) {
    const redisStatus = { redis: redisClient.isAlive() };
    const dbStatus = { db: dbClient.isAlive() };
    const status = Object.assign(redisStatus, dbStatus);
    res.status(200).send(status);
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    const stats = { users: nbUsers, files: nbFiles };
    res.status(200).send(stats);
  }
}

module.exports = AppController;
