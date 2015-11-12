/*********************************

 File:       videocontroller
 Function:
 Copyright:  AppDelegates LLC
 Date:       10/21/15
 Author:     mkahn

 **********************************/

app.controller("videoController", [
    '$scope', '$log', '$http',
    function ($scope, $log, $http) {

        // Listen for dropped file
        $scope.$on('droppedFile', function (e, droppedFiles) {
            $log.info("File Dropped: " + droppedFiles[0].name);
            uploadFile(droppedFiles[0])

        });

        function uploadFile(file) {

            var fd = new FormData();
            fd.append('video', file);

            //fd.append('id', guestId);
            // Content-Type undefined supposedly required here, transformed elsewhere
            $http.post('/upload/video', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .then(function (d) {
                          refreshFiles();
                      })
                .catch(function (err) {
                           $log.error("Error uploading file: " + err);
                       });

        }

        function refreshFiles() {

            $http.get('/upload/videos')
                .then(function (data) {
                          $scope.videos = data.data;
                      })
                .catch(function (err) {
                           $log.error("Error uploading file: " + err);
                       });

        }

        $scope.select = function(file){

            $http.post('/upload/setvideo?filename='+file)
                .then(function(){
                    $log.info("Attact vid changed");
                    location.reload();
                })

        }

        refreshFiles();

    }]);

