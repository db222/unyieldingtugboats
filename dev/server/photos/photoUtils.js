//Helper Functions for Photo route middleware
//-------------------------------------------------

var shortid = require('shortid');
var Photo = require('./photoModel');
var Zipcode = require('./zipcodeModel');
var rp = require('request-promise');
var multer = require('multer');
var ExifImage = require('exif').ExifImage;
var fs = require('fs');

module.exports = {
	//generates a shortId which associates the filename of the photo with its document in the database
	generateShortId : function () {
		return shortid.generate();
	},

	//exif data is extracted in degree-minute-second format; this function converts d-m-s to decimal degree
	convertDMStoDeg: function(dmsArray){
		var deg = dmsArray[0];
		var min = dmsArray[1];
		var sec = dmsArray[2];

		return deg + (((min * 60) + sec)/3600);
	},

	//creates the [lng, lat] array to be stored in the loc field of the photo document
	makeDecDeg: function(gps){
		var lat = this.convertDMStoDeg(gps.GPSLatitude);
		if (gps.GPSLatitudeRef === 'S'){
			lat *= -1;
		}
		var lng = this.convertDMStoDeg(gps.GPSLongitude);
		if (gps.GPSLongitudeRef === 'W'){
			lng *= -1; 
		}

		return [ lng.toFixed(6), lat.toFixed(6) ];
	},

	//creates a document in the db that represents the photo
	addPhotoToDb : function(filename, gps, orientation, reqBody){
		var tags = reqBody.tags.split(',');
		var info = reqBody.info;
		Photo.create({
			_id: filename.substring(0, filename.indexOf('.')),
			loc: gps,
			orientation: orientation,
			tags: tags,
			info: info
		}, function(error, photo) {
			if (error) {
				console.log ('error');
			}
		});
	},

	//this function will turn the zipcode on the request body
	//into a json object and pass that object to get '/'
	getZipGPS: function(zip, radius, req, res, next) {
		fetchPhotosByLoc = this.fetchPhotosByLoc;
		console.log('Address',zip);
		console.log('Radius', req.body);

		
			
				//if it isnt, request it and store it then fetchPhotosByLoc
				console.log('zip not in db, grabbing it from goog');
				rp('http://maps.googleapis.com/maps/api/geocode/json?address=' + zip)
				.then(function(body){
					var result = JSON.parse(body);
			    lat = result.results[0].geometry.location.lat;
			    lng = result.results[0].geometry.location.lng;
			    console.log('google answered ',lat,' - ',lng);
					var zipLoc = {
			                   "lat" : lat,
			             			 "lng" : lng
					              };
					Zipcode.create({
						zipcode: zip,
						loc: zipLoc
					});
				  fetchPhotosByLoc(zipLoc, radius, req, res, next);
				});
			
		

	},

	//sends a response with JSON representation of the 30 closest photos to the location of the zipcode
	fetchPhotosByLoc: function(zipLoc, radius, req, res, next) {
		//set limit to be used to determine number of photos returned to 30
		var limit = 30; 
		//set maxDistance in decimal degrees to determine the max distance of photos returned
		
        console.log('searching at',zipLoc.lng,zipLoc.lat);
		//create an array of the longitude and latitude of the location of the zipcode 
		//(which was determined from google geocode and passed in)
		var zipCoords = []; 
		zipCoords.push(zipLoc.lng); 
		zipCoords.push(zipLoc.lat);

		//query the database using the $near geospatial query
		Photo.find({
			loc: {

                $nearSphere: {
                  $geometry: {
                    type : "Point",
                    coordinates : zipCoords
                  },
                  $maxDistance: radius
                }

			}
		}).limit(limit).exec(function(err, photos) {
			if (err) {
				return res.status(500).json(err);
			}
			console.log('found',photos.length);
			res.status(200).json(photos);
		})
	},


	//sends a response with JSON representation of the 30 most recently added photos
	fetchPhotosByDate: function(req, res, next) {
		var limit = 30; 
		Photo.find({}).limit(limit).sort({date: -1}).exec(function(err, photos) {
			if (err) {
				return res.status(500).json(err);
			}
			res.status(200).json(photos);
		});
	},

	//create a filepath based on the filename parameter of the URL and see if that photo exists
	createFilePath: function(req, res, next, filename) {
		//add .jpg to that filename and see if file exists
		fs.exists('./uploads/' + filename + '.jpg', function(exists) {
			if (exists){
				req.url = filename + '.jpg';
				next(); 
			} else {
				fs.exists('./uploads/' + filename + '.JPG', function (exists) {
					if (exists) {
						req.url = filename + '.JPG';
						next();
					}
					else {
						res.writeHead(404);
						res.end('fs exists error');
					}
				});
			}
		});
	},
	
	fns : function (req, res, next){
		res.writeHead(300);
		res.end('you uploaded a photo');
	}

}

