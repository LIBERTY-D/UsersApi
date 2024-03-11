const mongoose = require('mongoose');
const dotenv =  require("dotenv")

async function connectToDatabase() {
    const mongouri = process.env.DB.replace("<%password%>",process.env.PASSWD_MONGODB)
  try {
    await mongoose.connect(mongouri);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function start() {
  try {
    const connection = await connectToDatabase();
    console.log('Connected to database:', connection.name);
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
}

module.exports = start
