angular.module('scavengerhunt.login', [])

.controller('LoginCtrl', function($state, $scope, $ionicModal, $timeout, request) {
  // Form data for the login modal
  $scope.loginData = {};
  var userInfo = $scope.loginData;

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered when it's a new users creating a profile.
  $scope.newUserLogin = function() {

    console.log("New user data: ", $scope.loginData);

    request.request('/api/users/newUser', userInfo, function(response) {
      console.log('made a new user! ', response);
      if(response === 'userCode'){
        $scope.closeLogin(); 
      }
    });
  };



  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log("accessed doLogin function");
    request.request('api/users/loginUser', userInfo, function(response) {
      console.log('Welcome back User: ', response[0].username);
      if(response[0].username === userInfo.username) {
        $scope.closeLogin();
      }
    });
  };

  //triggered when the user logs in thru facebook
  $scope.fbLogin = function() {
    openFB.login(function(response) {
          if (response.status === 'connected') {
            console.log('Facebook login succeeded');
            $scope.closeLogin();
          } else {
            alert('Facebook login failed');
          }
        },
    {scope: 'email,publish_actions'});
  };

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $state.go('home');
  };

});



