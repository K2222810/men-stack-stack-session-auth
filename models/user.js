// import mongoose 
const mongoose = require('mongoose');

// define our schema 
const userSchema = new mongoose.Schema({
  // username
  username: {
    type: String,
    required: true, 
  },
  // password 
  password: {
    type: String,
    required: true,
  },
})

// add the schema to the model 
const User = mongoose.model("User", userSchema);

// then export the model 
module.exports = User;