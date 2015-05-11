/* app.js
 * - loads all other controllers and factories onto the page.
 * - handles application routing using ui-router
 * - asynchronously loads the google maps api
 * - defines AppController
 */
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
   
  // Handles showing a modal. Currently unused, but keeping here for later reference.
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


  // Toggles the side menu (top-right button, used for adding new hunts/photos
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
