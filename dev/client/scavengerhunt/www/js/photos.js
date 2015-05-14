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







