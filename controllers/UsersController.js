const sha1 = require("sha1");
const { v4: uuidv4 } = require("uuid");
const redisClient = require("../utils/redis");
const { dbClient, dbName } = require("../utils/db");

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }

    const usersCollection = dbClient.db(dbName).collection("users");
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Already exist" });
    }

    const hashedPassword = sha1(password);

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: result.insertedId,
      email,
    });
  }

  static async getMe(req, res) {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const usersCollection = dbClient.db(dbName).collection("users");
    const user = await usersCollection.findOne(
      { _id: dbClient.ObjectId(userId) },
      { projection: { email: 1 } }
    );

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json(user);
  }
}

module.exports = UsersController;
