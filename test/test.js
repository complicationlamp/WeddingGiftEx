var mongoose = require('mongoose');


//==========================================================================
// to avoid passport, lets make some module for the local Test db===========
//==========================================================================

var testUserSchema = mongoose.Schema({

    // local            : {
        email               : {type: String, required: true},
        password            : {type: String, required: true},
        firstnamelastname   : String,
        whereareyoufrom     : String,
        relationship        : String,
        giftforex           : String, 
    // }
});

module.exports = mongoose.model('TestUser', testUserSchema);