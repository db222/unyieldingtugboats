
//hunts.js, HuntsCtrl
//----------------------
 // gets hunt data from HuntFactory
 // uses modals to show individual hunt views

angular.module('scavengerhunt.hunts', ['uiGmapgoogle-maps', 'ionic.rating'])
.controller('HuntsCtrl', function($scope, $ionicModal, HuntFact, request) {
  // hunt data from database
  HuntFact.getHunts(null, function(hunts) {
    $scope.hunts = hunts
  });

    var resetReviewInfo = function() {
    $scope.score = 3;
    $scope.maxScore = 5;
  };

  resetReviewInfo();

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
  $scope.activeModal = null;

  $scope.openModal = function(index, modalType) {
    switch(modalType) {
      case 'HUNT_DETAILS' : $scope.openHuntDetailsModal(index);
        break;
      default: console.log('WHAT HAVE YOU DONE! ' + modalType + 'does not have an assoicated')
    }
  };

  $scope.openHuntDetailsModal = function(index) {
    $scope.selectedHunt = $scope.hunts[index];
    $scope.score = $scope.selectedHunt.averageScore;
    $scope.setMap($scope.selectedHunt.cover.lat, $scope.selectedHunt.cover.lon);
    $scope.modal.show();
    $scope.activeModal = $scope.modal;
  };

  $scope.submitReview = function(comment,score) {
    var reviewedHunt = {  
              comment : comment,
              rating : { score : score,
                         maxScore : $scope.maxScore
                      },
              hunt : $scope.selectedHunt
            };

    request.request('/api/hunts/review', reviewedHunt, function(response) {
      console.log('successfully added a review!', response);
      for(var i = 0; i < $scope.hunts.length; ++i) {
        if($scope.hunts[i]._id === response._id) {
          $scope.hunts[i] = response;
          return;
        }
      }
    });

    resetReviewInfo();
    $scope.closeModal();
  }
  
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
