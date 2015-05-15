angular.module('scavengerhunt.newPhoto', [])
.controller('NewPhotoCtrl', function () {
  console.log('Camera Controller');
  console.log(navigator.camera);
  var options = {
    quality: 50,
    destinationType: navigator.camera.DestinationType.DATA_URI
  };
  var fail = function () {
    console.log('fail');
  };
  var pass = function () {
    console.log('PIC taken');
  };
  
  navigator.camera.getPicture(pass, fail, options);
});