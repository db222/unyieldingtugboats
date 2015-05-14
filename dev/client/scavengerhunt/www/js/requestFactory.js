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
