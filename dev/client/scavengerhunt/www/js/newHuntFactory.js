//New Hunt Factory
//----------------

angular.module('scavengerhunt.newhuntFactory', [])
.factory('NewHuntFact', function($http) {
  var photos = []; 
  return {
    newHunt: {},

    //adds a photo to the hunt
    addPhoto: function(photo) {
      this.newHunt.photos = this.newHunt.photos || [];
      this.newHunt.photos.push(photo);
    },

    //sets the zipcode of the hunt
    setZipCode: function(zip) {
      this.newHunt = {};
      this.newHunt.zipcode = zip;
    },


    //gets the appropriate photos near the hunt zipcode from the server
    getPhotos: function(callback){
      if (this.newHunt.zipcode){
        $http({
          method:'POST', 
          url: '/api/photos',
          data: { zipcode: this.newHunt.zipcode}
        })
        .then(function(response){
          photos = response.data.slice(); 
          //for each photo in the photos, add  src, lon, and lat properties 
          photos.forEach(function(photo) {
            photo.src = '/api/photos/' + photo._id,
            photo.lon = photo.loc[0],
            photo.lat = photo.loc[1]
          })
          callback(photos)
        })
      }
    },

    //resets the hunt object and photos array
    resetHunt: function() {
      this.newHunt = {};
      photos = [];
    }
  }  
});
