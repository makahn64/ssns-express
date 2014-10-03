/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *
 * It initially loads the Loading screen. A $watcher in the controller for the loading screen (loading-controller.js)
 * triggers a call back to this module that segues to the correct opening screen for the app mode.
 */

app.controller("appController", function($scope){

    $scope.incVal = 0;
    $scope.testVar = "This is from the $scope, yo!";

    $scope.counterIncrement = function(){
        $scope.incVal++;
    }

});
