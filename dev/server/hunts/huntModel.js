var mongoose = require('mongoose');

// Hunt Database Schema
// --------------------

//hunts collection will store hunts created by users; cover object is photo shown on home page; region is zipcode
var HuntSchema = new mongoose.Schema({
  cover: Object,
	photos: Array,
	info: String, 
	tags: Array, 
	region: Number,
	date: { type: Date, default: Date.now },
    comments: [],
    totalReviews : Number,
    accumulatedScore : Number,
    averageScore : Number
});

module.exports = mongoose.model('Hunt', HuntSchema);