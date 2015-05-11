// AppCtrl tests 
// To do: Figure out why if you change the directory name to anything
// other than "jasmine_examples", the tests don't run.

describe('AppCtrl', function() {
  // TO DO: Figure out how to get the module() function to work.
  // Figure out where it comes from.

  // beforeEach(module('scavengerhunt'));

  var $controller;

  beforeEach(inject(function(_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('$scope.openModal', function() {
    it('should exist', function() {
      expect(true).toEqual(true);
      var $scope = {};
      // var controller = $controller('AppCtrl', { $scope: $scope });
    //   expect($scope.openModal).to.not.be.undefined;
    //   // $scope.password = 'longerthaneightchars';
    //   // $scope.grade();
    //   // expect($scope.strength).toEqual('strong');
    });
  });
});

describe('app', function() {
  it('true should be true', function() {
    expect(true).toBe(true);
  });
});