const mongoose = require('mongoose');

// Define a schema for the location object containing the user object
const locationSchema = new mongoose.Schema({
  user: {
    userId:String,
    lat: {
      type: Number,
      required: false
    },
    long: {
      type: Number,
      required: false
    }
  }
});


const locationModel = mongoose.model('Location', locationSchema);

module.exports = {locationModel,locationSchema};
