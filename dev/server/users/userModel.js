var mongoose = require('mongoose');

// User Database Schema 
//---------------------

var UserSchema = new mongoose.Schema({

	username: String,
	password: String
		
});

module.exports = mongoose.model('User', UserSchema);