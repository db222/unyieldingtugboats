//Zipcode Model Setup
//--------------------
var mongoose = require('mongoose');

//the zipcodes collection will cache zipcode GPS coordinates retrieved from google
var ZipcodeSchema = new mongoose.Schema({
	zipcode: {
		type: Number,
		unique: true
	},
	loc: {
		lat: Number,
		lng: Number
	}, 
});

module.exports = mongoose.model('Zipcode', ZipcodeSchema);

