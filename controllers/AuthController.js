const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('..utils/redis')

export default class AuthController {
  constructor(dbClient, redisClient) {
    this.dbClient = dbClient;
    this.redisClient = redisClient;
  }

  async getConnect(req, res) {
    // Get authorization header and decode the basic auth string
    const authHeader = req.headers.authorization;
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
    const [email, password] = decodedCredentials.split(':');

    // Find user with given email and password hash
    const user = await this.dbClient.getUserByEmailAndPassword(email, password);

    // If no user is found, return unauthorized
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token
    const token = uuidv4();

    // Store the user ID in Redis using the generated token as key
    await this.redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

    // Return the token to the client
    return res.status(200).json({ token });
  }

  async getDisconnect(req, res) {
    // Get token from header
    const token = req.headers['x-token'];

    // If no token is provided, return unauthorized
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete token from Redis
    await this.redisClient.del(`auth_${token}`);

    // Return success
    return res.sendStatus(204);
  }
}

