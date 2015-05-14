var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

//Basic Server Set-up
//-------------------


var app = express();

//connect to database
mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/scavengerhunt';
mongoose.connect(mongoURI);

//include route middleware
require('./config/middleware.js')(app, express);

// listen on port 3000
var port = process.env.PORT || 3000; 
app.listen(port);
console.log('listening on port: ', port);


// serves public folder
app.use(express.static('./dev/client/scavengerhunt/www'));

//Configure Router Middleware
//----------------------------

var bodyParser  = require('body-parser');

module.exports = function (app, express) {

  var huntRouter = express.Router();
  var photoRouter = express.Router();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // Enable localhost to localhost connections (CORS)
  app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "origin, content-type, accept");
    next();
  });
  // use hunt router for all user request
  app.use('/api/hunts', huntRouter); 
  
  // user photo router for link request
  app.use('/api/photos', photoRouter); 

  // inject our routers into their respective route files
  require('../hunts/huntRoutes.js')(huntRouter);
  require('../photos/photoRoutes.js')(photoRouter);

  console.log('loaded middleware');
};


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
	date: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Hunt', HuntSchema);var huntUtils = require('./huntUtils')

// Hunt Routes
// -----------

// app === huntRouter injected from middlware.js
module.exports = function (app) { 

	//post request to api/hunts/new will add a hunt to the database
  app.post('/new', huntUtils.addHunt, huntUtils.fns);
  //get request to api/hunts will retrieve hunts from the database
  app.get('/', huntUtils.getHunts, huntUtils.fns);

  console.log('loaded hunt routes');
};var Hunts = require('./huntModel');

module.exports = {

  // Hunt Helper Functions
  // ---------------------

  // Get a list of hunts from the database, optional zip code, limit 10
  // curl -i http://localhost:3000/api/hunts
  // OR
  // curl -i http://localhost:3000/api/hunts?zip=94536
  getHunts: function(req, res, next) {
    var queryObj = {};
    if (req.query.zip) {
      queryObj = {region: req.query.zip};
      //retrieve hunts in specified zipcode
      Hunts.find(queryObj)
           .limit(10)
           .exec(function(err, results) { 
              if (err) {
                console.log('Error fetching from Hunts DB');
                next(err);
              } else {
                res.queryResults = JSON.stringify(results);
                next();
              }
            });
    } else {
      //retrieve most recently added hunts
      Hunts.find({})
           .limit(10)
           .sort({date: -1})
           .exec(function(err, results) { 
              if (err) {
                console.log('Error fetching from Hunts DB');
                next(err);
              } else {
                res.queryResults = JSON.stringify(results);
                next();
              }
            });
    }

  },

  // Add a new hunt to the database
  // curl -H "Content-Type: application/json" -X POST -d '{"info" : "infos about hunt", "region" : 94536, "tags" : [ "tag", "another tag" ], "photos" : [ "photo1_id", "photo2_id" ]}' http://localhost:3000/api/hunts/new
  addHunt: function(req, res, next) {
    console.log(req.body);
     Hunts.create(req.body, function(err) {
       if (err) {
         console.log('Error creating new hunt');
         next(err);
       } else {
         console.log('hunt was added');
         next();
       }
    });
  },

  // End request with proper code and response data
  fns: function(req, res){

    if (res.queryResults) {

      res.writeHead(200);
      res.end(res.queryResults);

    } else {

      res.writeHead(201);
      res.end('Successfully added your hunt');

    }

  }
}
//Photo Model Setup
//-----------------

var mongoose = require('mongoose');

var PhotoSchema = new mongoose.Schema({
	_id: {
	    type: String,
	    unique: true,
	},
	loc: {
		//[lng, lat]
		type: [Number],  
		//create the geospatial index
		index: '2d' 
	}, 
	//orientation of the photo from exif data
	orientation: Number,
	tags: Array,
	info: String, 
	date: { type: Date, default: Date.now }

});


module.exports = mongoose.model('Photo', PhotoSchema);
//Setup the Photo Routes middleware
//---------------------------------
var photoUtils = require('./photoUtils');
var multer = require('multer');
var ExifImage = require('exif').ExifImage;
var serveStatic = require('serve-static');


// app === photoRouter injected from middlware.js
module.exports = function (app) {

  //when a request comes in with a shortid, this will convert it into a filepath to the correct photo 
  app.param('filename', photoUtils.createFilePath)

  //on a post to photos/new upload the photo and rename the file with a shortid
  app.post('/new', multer({  dest: './uploads/',
                    //give file a short id for filename which will be also be used in _id field in database
                    rename: function (fieldname, filename, req, res) {
                      return photoUtils.generateShortId();
                    },
                    //as soon as the upload is complete, need to extract the exif data and store in the database
                  	//the extracted exif data has gps info in DMS and the google maps API needs gps info 
                  	//in decimal degrees. This fn first compiles a gpsDMS object which is passed into conversion
                  	//helper functions, and the resulting gps object with lat and lng properties in decimal degrees is
                  	//passed to the addPhotoToDb helper function.
                    onFileUploadComplete: function (file, req, res) {
                      new ExifImage({ image : './uploads/' + file.name }, function (error, exifData) {
                          if (error)
                              console.log('Error: '+error.message);
                          else {
                            var gpsDMS = {
                              GPSLatitudeRef: exifData.gps.GPSLatitudeRef,
                              GPSLatitude: exifData.gps.GPSLatitude,
                              GPSLongitudeRef: exifData.gps.GPSLongitudeRef,
                              GPSLongitude: exifData.gps.GPSLongitude
                            }

                            var gps = photoUtils.makeDecDeg(gpsDMS);
                            var orientation = exifData.image.Orientation;
                            photoUtils.addPhotoToDb(file.name, gps, orientation, req.body)//add to database
                          }
                      });
                    }
                  }), photoUtils.fns);


  //serve the static image assets when url with shortid requested
	app.get('/:filename', serveStatic('./uploads/'));


	//post req to photos/ has zipcode information; return the json of 30 closest photos
  app.post('/', function(req, res, next){
	  photoUtils.getZipGPS(req.body.zipcode, req, res, next)	
  });

  //get req to photos/ returns the json of the 30 most recently added photos 
	app.get('/', function(req, res, next){
		photoUtils.fetchPhotosByDate(req, res, next);
	});

};
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
	getZipGPS: function(zip, req, res, next) {
		fetchPhotosByLoc = this.fetchPhotosByLoc;

		//first see if the zipLoc is already in the database
		Zipcode.find({ 'zipcode': zip }, function(err, result) {
			if (result.length){
				//if it is, retrieve it and then fetchPhotosByLoc
				console.log('zip in db; result: ', result[0].loc);
				fetchPhotosByLoc(result[0].loc, req, res, next);
			} else {
				//if it isnt, request it and store it then fetchPhotosByLoc
				console.log('zip not in db, grabbing it from goog');
				rp('http://maps.googleapis.com/maps/api/geocode/json?address=' + zip).then(function(body){
					var result = JSON.parse(body);
			    lat = result.results[0].geometry.location.lat;
			    lng = result.results[0].geometry.location.lng;
					var zipLoc = {
			                   "lat" : lat,
			             			 "lng" : lng
					              };
					Zipcode.create({
						zipcode: zip,
						loc: zipLoc
					});
				  fetchPhotosByLoc(zipLoc, req, res, next);
				});
			}
		})
	},

	//sends a response with JSON representation of the 30 closest photos to the location of the zipcode
	fetchPhotosByLoc: function(zipLoc, req, res, next) {
		//set limit to be used to determine number of photos returned to 30
		var limit = 30; 
		//set maxDistance in decimal degrees to determine the max distance of photos returned
		var maxDistance = .059;

		//create an array of the longitude and latitude of the location of the zipcode 
		//(which was determined from google geocode and passed in)
		var zipCoords = []; 
		zipCoords.push(zipLoc.lng); 
		zipCoords.push(zipLoc.lat);

		//query the database using the $near geospatial query
		Photo.find({
			loc: {
				$near: zipCoords,
				$maxDistance: maxDistance
			}
		}).limit(limit).exec(function(err, photos) {
			if (err) {
				return res.status(500).json(err);
			}
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

