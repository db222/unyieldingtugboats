angular.module('scavengerhunt.newhunts', [])
.controller('NewHuntCtrl', function($scope, $state, $window, NewHuntFact, PhotoFact, request) {
  // $scope.zipcode = null;
  $scope.zipcode = NewHuntFact.newHunt.zipcode;

  $scope.makeHunt = function(zip) {
    console.log('make hunt called');
    NewHuntFact.setZipCode(zip)
  };


  NewHuntFact.getPhotos(function(photos) {
    $scope.photos = photos; 
  });

  $scope.resetHunt = function() {
    console.log('$scope.resetHunt called');
    NewHuntFact.resetHunt(); 
  };


  $scope.addPhoto = function(index) {
    NewHuntFact.addPhoto($scope.photos[index]);
    if(!NewHuntFact.newHunt.cover) { //sets cover to be first photo added
      NewHuntFact.newHunt.cover = $scope.photos[index];
    }
    console.log('added!');
    console.log(NewHuntFact.newHunt);
  };

  $scope.addHunt = function(info) {
    var newHunt = {};

    // Transfer relevant hunt data to new, properly
    // formatted object, then send to server
    newHunt.region = NewHuntFact.newHunt.zipcode;
    newHunt.cover = NewHuntFact.newHunt.cover;
    newHunt.photos = []; // ids of all photos
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

