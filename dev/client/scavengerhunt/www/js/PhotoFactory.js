// PhotoFactory.js, PhotoFact
//---------------------------
  // handles photo data
  // communicates with RequestFactory to grab photos from the database
 
angular.module('scavengerhunt.photofact', [])
.factory('PhotoFact', function($http, $cordovaFile) {
  var photos = []; 
  return {
  // retrieve most recently added photos from the server
    getPhotos: function(callback) {
      $http({
        method:'GET', 
        url: 'http://johnpizzo.me:3000/api/photos'
      })
      .then(function(response){
        photos = response.data.slice(); 
        //for each photo in the photos, add  src, lon, and lat properties 
        photos.forEach(function(photo) {
          photo.src = 'http://johnpizzo.me:3000/api/photos/' + photo._id,
          photo.lon = photo.loc[0],
          photo.lat = photo.loc[1]
        })
        callback(photos);
      })
    },

    newPhoto: function(image, options, callback) {
      $cordovaFile.uploadFile('http://localhost:3000/api/photos/new', image, options)
      .success(function(response) {
        console.log('photo sent!');
      })
      .error(function(err) {
        console.log('invalid request');
      });
    }
  }
});

