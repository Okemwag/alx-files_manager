const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    // get connection parameters from environment variables, or use default values
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // create a connection URL using the parameters
    const url = `mongodb://${host}:${port}/${database}`;

    // create a new MongoDB client instance with the connection URL
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async isAlive() {
    try {
      // try to connect to the MongoDB server
      await this.client.connect();
      return true;
    } catch (err) {
      // if an error occurs, return false
      return false;
    }
  }

  async nbUsers() {
    try {
      // try to connect to the MongoDB server
      await this.client.connect();

      // get a reference to the 'users' collection
      const collection = this.client.db().collection('users');

      // count the number of documents in the collection
      const count = await collection.countDocuments();

      return count;
    } catch (err) {
      // if an error occurs, log it and return -1
      console.error(`Error getting number of users: ${err}`);
      return -1;
    }
  }

  async nbFiles() {
    try {
      // try to connect to the MongoDB server
      await this.client.connect();

      // get a reference to the 'files' collection
      const collection = this.client.db().collection('files');

      // count the number of documents in the collection
      const count = await collection.countDocuments();

      return count;
    } catch (err) {
      // if an error occurs, log it and return -1
      console.error(`Error getting number of files: ${err}`);
      return -1;
    }
  }
}

// create a new instance of the DBClient class
const dbClient = new DBClient();

// export the instance so it can be used by other modules
module.exports = dbClient;
