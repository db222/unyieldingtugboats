// Camera factory
//----------

angular.module('scavengerhunt.camera', [])
.factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        //something with camera
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}]);
//Factory to get hunts from the server to display to the user
//----------------------------------------------------

angular.module('scavengerhunt.huntfactory', [])
.factory('HuntFact', function(request) {
  var hunts = []; 
  return {

    //get hunts from the database by making a request to api/hunts
    getHunts: function(zip, callback) {
      var zipCode = '';
      if (zip) {
        zipCode = '?zip='+zip;
      }

      //uses request Factory to send request to back end
      request.request('/api/hunts' + zipCode, null, function(data) {
        callback(data);
      });
    }

  }
});
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
        url: '/api/photos'
      })
      .then(function(response){
        photos = response.data.slice(); 
        //for each photo in the photos, add  src, lon, and lat properties 
        photos.forEach(function(photo) {
          photo.src = '/api/photos/' + photo._id,
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

//app.js
//------------------
 // loads all other controllers and factories onto the page.
 // handles application routing using ui-router
 // asynchronously loads the google maps api
 // defines AppController
 
angular.module('scavengerhunt', ['ionic',
               'ngCordova',
               'requestFactory',
               'scavengerhunt.newhuntFactory',
               'scavengerhunt.photofact', 
               'scavengerhunt.huntfactory',
               'scavengerhunt.camera',
               'scavengerhunt.photos',
               'scavengerhunt.hunts',
               'scavengerhunt.newhunts',
               'uiGmapgoogle-maps'])
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  // hunts view (homepage)
  $stateProvider.state('home', {
    url: '/',
    cache: false,
    reload: true,
    templateUrl: 'templates/hunts.html',
    controller: 'HuntsCtrl'
  })

  // photos view
  .state('pics', {
    url: 'pics',
    templateUrl: 'templates/pics.html',
    controller: 'PhotosCtrl'
  })

  // the first form for creating a new hunt
  .state('newhunt', {
    url: 'newhunt',
    templateUrl: 'templates/newhuntsmodal.html',
    controller: 'NewHuntCtrl'
  })

  // the photo selection view
  .state('newhuntphotos', {
    url: 'newhunt/photoSelect',
    cache: false,
    templateUrl: 'templates/newHuntPhotoSelect.html',
    controller: 'NewHuntCtrl'
  })

  // review and save hunt. shows photo map.
  .state('newhuntreview', {
    url: 'newhunt/review',
    cache: false,
    templateUrl: 'templates/newHuntReview.html',
    controller: 'NewHuntCtrl'
  })

  // add new photo 
  .state('newphoto', {
    url: 'newphoto',
    templateUrl: 'templates/newPhoto.html'
  });

})
.config(function($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.config(function(uiGmapGoogleMapApiProvider) {
  // asynchronously load the google maps api, as instructed by angular-google-maps.
  // (see their docs for reference)
  uiGmapGoogleMapApiProvider.configure({
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
})
.controller('AppCtrl', function($ionicModal, $ionicSideMenuDelegate, $scope, NewHuntFact, Camera, $cordovaFile, PhotoFact) {
  // Main Application Controller.
   
  // Handles showing a modal. Currently unused, but may be used if you want to add a modal later.
  $ionicModal.fromTemplateUrl('templates/newhuntsmodal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });


  // Toggles the side menu (top-right button, used for adding new hunts/photos)
  $scope.toggleMenuRight = function() {
    $ionicSideMenuDelegate.toggleRight();
  }

  // camera
  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
      $scope.lastPhoto = imageURI;
    }, function(err) {
        console.err(err);
    }, { quality: 75, targetWidth: 320, targetHeight: 320, saveToPhotoAlbum: false });
  };


  $scope.uploadPhoto = function(tags, info) {
    var params = {};
    params.tags = tags;
    params.info = info;
    var imageURI = $scope.lastPhoto;

    var options = new FileUploadOptions();
    options.fileKey = 'file';
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType = 'image/jpeg';
    options.chunkedMode = false;
    options.params = params;

    PhotoFact.newPhoto(imageURI, options);

  };

})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

//hunts.js, HuntsCtrl
//----------------------
 // gets hunt data from HuntFactory
 // uses modals to show individual hunt views

angular.module('scavengerhunt.hunts', ['uiGmapgoogle-maps'])
.controller('HuntsCtrl', function($scope, $ionicModal, HuntFact) {
  // hunt data from database
  HuntFact.getHunts(null, function(hunts) {
    $scope.hunts = hunts
  });


  // Get all hunts from certain zip code
  $scope.filterByZip = function(zip) {
    if (String(zip).match(/^[0-9]{5}$/)) {
      HuntFact.getHunts(Number(zip), function(hunts) {
        $scope.hunts = hunts;
        console.log("scope.hunts: ", $scope.hunts);
      });
    } else {
      console.log('please enter valid zip code');
    }
  };

  // modal for individual views
  $ionicModal.fromTemplateUrl('templates/huntInfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // selectedHunt is set when modal is opened
  $scope.selectedHunt = null;

  $scope.openModal = function(index) {
    $scope.selectedHunt = $scope.hunts[index];
    $scope.setMap($scope.selectedHunt.cover.lat, $scope.selectedHunt.cover.lon);
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //initializes the map and its markers
  $scope.map = {zoom: 14};
  $scope.map.markers = [];

  //adds markers for each photo selected based on their location data; auto centers and fits the 
  //map based on the markers
  $scope.setMap = function(lat, lon) {
    //set markers
    for(var i = 0; i < $scope.selectedHunt.photos.length; i++) {
      var marker = {
            id: i,
            latitude: $scope.selectedHunt.photos[i].lat,
            longitude: $scope.selectedHunt.photos[i].lon,
            options: {},
            fit : true
      };
      $scope.map.markers.push(marker);
    }

    var bounds = new google.maps.LatLngBounds();
    $scope.map.markers.forEach(function(marker){
      var position = new google.maps.LatLng(marker.latitude, marker.longitude)
      bounds.extend(position)
    });

    var centerHolder = bounds.getCenter(); 

    $scope.map.center = {
      longitude: centerHolder.F,
      latitude: centerHolder.A
    };
  };  
})
.directive('rotate', function() {
    return {
            restrict: 'A',
            link: function (scope, element, attrs) {
              var r = 'rotate(0deg)'
              if (attrs.orientation === '6'){
                r = 'rotate(90deg)'; 
                element.css({
                  '-moz-transform': r,
                  '-webkit-transform': r,
                  '-o-transform': r,
                  '-ms-transform': r,
                });
              } 
            }
        }
});
//Controller for views that allow users to create hunts in a certain zipcode
//---------------------------------------------------------------------------

angular.module('scavengerhunt.newhunts', [])
.controller('NewHuntCtrl', function($scope, $state, $window, NewHuntFact, PhotoFact, request) {
  $scope.zipcode = NewHuntFact.newHunt.zipcode;

  //initializes the hunt by setting the zipcode
  $scope.makeHunt = function(zip) {
    NewHuntFact.setZipCode(zip)
  };

  //gets the photos from the entered zipcode and assigns them to a scope variable for display
  NewHuntFact.getPhotos(function(photos) {
    $scope.photos = photos; 
  });

  //resents the hunt object to abort hunt creation
  $scope.resetHunt = function() {
    NewHuntFact.resetHunt(); 
  };

  //adds photos to the hunt
  $scope.addPhoto = function(index) {
    NewHuntFact.addPhoto($scope.photos[index]);
    //sets cover to be first photo added
    if(!NewHuntFact.newHunt.cover) { 
      NewHuntFact.newHunt.cover = $scope.photos[index];
    }
    console.log('added!');
    console.log(NewHuntFact.newHunt);
  };

  // Transfer relevant hunt data to new, properly
  // formatted object, then send to server
  $scope.addHunt = function(info) {
    var newHunt = {};

    newHunt.region = NewHuntFact.newHunt.zipcode;
    newHunt.cover = NewHuntFact.newHunt.cover;
    newHunt.photos = []; 
    NewHuntFact.newHunt.photos.forEach(function(photo) {
      newHunt.photos.push(photo);
    });
    newHunt.info = info || 'An awesome scavenger hunt!'; // store info/description about the hunt
    console.log('info', info);
    newHunt.tags = []; // store tags about the hunt

    request.request('/api/hunts/new', newHunt, function(response) {
      console.log('successfully added hunt? ', response);
      $state.reload(); 
    });
  };

  
  $scope.setZip = function() {
    $scope.zipcode = NewHuntFact.newHunt.zipcode || null;
  }

  $scope.map = { center: { latitude: 37, longitude: -122 }, zoom: 19 };

  $scope.map.markers = [];

  //adds markers for each photo selected based on their location data; auto centers and fits the 
  //map based on the markers
  $scope.setMap = function() {
    if(NewHuntFact.newHunt.photos) {
      //set markers
      for(var i = 0; i < NewHuntFact.newHunt.photos.length; i++) {
        var marker = {
              id: i,
              latitude: NewHuntFact.newHunt.photos[i].lat,
              longitude: NewHuntFact.newHunt.photos[i].lon,
              options: {}
        };
        $scope.map.markers.push(marker);
      }
      var bounds = new google.maps.LatLngBounds();
      $scope.map.markers.forEach(function(marker){
        var position = new google.maps.LatLng(marker.latitude, marker.longitude)
        bounds.extend(position)
      });

      var centerHolder = bounds.getCenter(); 

      $scope.map.center = {
        longitude: centerHolder.F,
        latitude: centerHolder.A
      };
    }
  }; 

  $scope.setMap();
  $scope.setZip();
})
.directive('rotate', function() {
    return {
            restrict: 'A',
            link: function (scope, element, attrs) {
              var r = 'rotate(0deg)'
              if (attrs.orientation === '6'){
                r = 'rotate(90deg)'; 
                element.css({
                  '-moz-transform': r,
                  '-webkit-transform': r,
                  '-o-transform': r,
                  '-ms-transform': r,
                });
              } 
            }
        }
});

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
//photos.js, PhotosCtrl
//----------------------
 //handles functionality for the photo view
 // uses modals to display single photo view
 
angular.module('scavengerhunt.photos', [])
.controller('PhotosCtrl', function($scope, $ionicModal, PhotoFact, $ionicLoading) {
  // get photos from factory
  PhotoFact.getPhotos(function(photos) {
    $scope.photos = photos; 
  })


  // create modal for single photo view  
  $ionicModal.fromTemplateUrl('templates/picInfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(index) {
    //on opening modal, set the selected photo
    $scope.selectedPhoto = $scope.photos[index];
    $scope.setMap($scope.selectedPhoto.lat, $scope.selectedPhoto.lon);
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  }); 

  // create photo map with default locations
  $scope.map = {zoom: 16};

  //selected photo is set when a modal is opened
  $scope.selectedPhoto = null;

  $scope.marker = null;

  //set location map based on selected photo information
  $scope.setMap = function(lat, lon) {
    
    //set marker
    $scope.marker = {
      id: 0,
      coords: {
        latitude: lat,
        longitude: lon
      }
    };

    //determine center of map
    var bounds = new google.maps.LatLngBounds();
    var position = new google.maps.LatLng($scope.marker.coords.latitude, $scope.marker.coords.longitude)
    bounds.extend(position)
    var centerHolder = bounds.getCenter(); 

    //set center of map
    $scope.map.center = {
      longitude: centerHolder.F,
      latitude: centerHolder.A
    };
  }
})
.directive('rotate', function() {
    return {
            restrict: 'A',
            link: function (scope, element, attrs) {
              var r = 'rotate(0deg)'
              if (attrs.orientation === '6'){
                r = 'rotate(90deg)'; 
                element.css({
                  '-moz-transform': r,
                  '-webkit-transform': r,
                  '-o-transform': r,
                  '-ms-transform': r,
                });
              } 
            }
        }
});







//factory to handle requests to the server
//-----------------------------------------
angular.module('requestFactory', [])
.factory('request', function($http) {
  return {
    request: function(url, data, callback) {
      if (data) {
        $http.post(url, data)
        .success(function(response) {
          callback(response);
        })
        .error(function(err) {
          console.log('Error: Unable to post data to server');
        });
      } else {
        $http.get(url)
        .success(function(response) {
          callback(response);
        })
        .error(function(err) {
          console.log('Error: Unable to get data from server');
        });
      }
    }
  }
});
