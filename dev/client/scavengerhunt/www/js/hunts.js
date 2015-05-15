
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
console.log("LOGGED");

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
