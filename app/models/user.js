'use strict';

// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// allowing us to use promises
mongoose.Promise = global.Promise;

// define the schema for our user model
var userSchema = mongoose.Schema({


  email               : {type: String, required: true},
  password            : {type: String, required: true},
  firstnamelastname   : String,
  whereareyoufrom     : String,
  relationship        : String,
  giftforex           : String, 

});


//=========================================================================
// methods generating a hash===============================================
//=========================================================================

userSchema.methods.generateHash = function(password) {
  //Salting 8, genrally 10 is considered safe and balanced with speed
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};


//==========================================================================
// create the model for users and expose it to our app======================
//==========================================================================

module.exports = mongoose.model('User', userSchema);
