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
