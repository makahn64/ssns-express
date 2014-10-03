/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *
 * It initially loads the Loading screen. A $watcher in the controller for the loading screen (loading-controller.js)
 * triggers a call back to this module that segues to the correct opening screen for the app mode.
 */

app.controller("appController", function($scope,$timeout,$filter,$mediaService, $q,
                                         orderByFilter, $webServerService, $settingsService,
                                         $sharedBus, $http, $eventFarm){


    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
       $scope.myIPAddress = add;
    })

    // Fire up the mediaService which starts playlist and media sync in the background
    $mediaService.init();

    var http = require('http');
    var https = require('https');
    var fs = require('fs');
    var path = require('path');

    var REGION_PICKER_PATH = "partials/region_picker.partial.html";
    var CAT_PICKER_PATH = "partials/category-filter.partial.html";
    var BRAND_PICKER_PATH = "partials/brand-filter.partial.html";
    var PICKER_CHOICE_PATH = "partials/picker-choice.partial.html";
    var MESSAGE_POPUP_PATH = "partials/message-popup.partial.html"
    var SECRET_MENU_PATH = "partials/secret_menu.html";

    // Used to debounce inbound tagIDs though the Java app should do this
    var lastTag = "";

    $scope.popupStack = [];

    // Used in old JQuery CSS animations for the infoModal. May get whacked.
    var countUp;

    /**
     * Methods and data bindings that interface to the Secret Setup Menu
     *
     */

    $scope.secretMenuPath = "";

    $scope.setPartnerIP = function(){
        $settingsService.setPartnerIP($scope.settings.partnerIP);
    }

    //TODO This is probably not necessary and has been commented out of the html
    $scope.evDataSourceChanged = function(){
        $settingsService.setLoadEVDataRemote($scope.settings.loadEVRemote);
    }

    $scope.showSecretMenu = function(show) {
        if(show) {
            $scope.showInfoModal = false;
            $scope.removeAllPopups();
            $scope.secretMenuPath = "partials/secret_menu.html";
        } else {
            $scope.secretMenuPath="";
        }
    }

    $scope.quit = function() {
        gui.App.quit();
    }

    // Show secret menu on escape
    $scope.keyPressed = function(ev){
        switch (ev.which){
            case 27: $scope.showSecretMenu(true);
                break;
        }
    }

    $scope.modalVisible = false;

    //use this array to swap in and out from one ng-include!
    // openingForCurrentMode is used so the bigscreen and touchscreen
    // openings can refer to a field. This field is configured per mode.
    $scope.mainScreens = { loading: "partials/load-screen.partial.html",
                            opening: "partials/opening-screen.partial.html",
                            playback: "partials/playback-screen.partial.html",
                            bigPlayback: "partials/big-screen.partial.html",
                            bigOpening: "partials/big-screen-opening.partial.html",
                            openingForCurrentMode: ""};

    // This forces the mainscreen to Loading when the app starts
    $scope.mainScreenPath =  $scope.mainScreens.loading;

    console.log("\n\n[app-ctrlr]##### BOOT ##### \n\n[app-ctrlr] Main screen now showing: "+$scope.mainScreenPath);

    // No pickers shown at boot
    $scope.filterPickerPath = "";
    $scope.settings = {};

    console.log("[app-ctrlr] Service on port "+$webServerService.port);
    $webServerService.setRequestListener( function(request, response){

        var components = request.url.split("/");

        switch (components[1]){

            case "playlist":
                response.writeHeader(200, {"Content-Type": "application/json"});
                fs.readFile('cache/json/playlists.json', 'utf8', function (err,data) {
                    if (err) {
                        response.write("{}");
                    } else {
                        response.write(data);
                    }
                    response.end();

                });
                break;

            case "play":
                var file = components[2];
                // Grab the IP for the ACK/Sync
                $sharedBus.tsIPAddr = request.connection.remoteAddress;
                response.writeHeader(200, {"Content-Type": "text/plain"});
                response.write("Playing: "+file);
                response.end();
                $scope.bsPlay(file);
                break;

            case "stop":
                // Grab the IP for the ACK/Sync
                $sharedBus.tsIPAddr = request.connection.remoteAddress;
                response.writeHeader(200, {"Content-Type": "text/plain"});
                response.write("Stopping");
                response.end();
                $scope.bsStop();
                break;


            case "vidack":
                var position = components[2];
                $scope.sendBSSync(position);
                response.writeHeader(200, {"Content-Type": "text/plain"});
                response.write("Ack: "+position);
                response.end();
                break;

            case "newuser":
                var tagID = components[2];
                console.log("NewID: "+tagID);
                response.writeHeader(200, {"Content-Type": "text/plain"});

                if (tagID!=lastTag){
                    lastTag = tagID;
                    // Allow this tag again in 15 seconds
                    $timeout(function(){
                        lastTag="";
                    }, 15*1000);
                    response.write("Word to your mama: "+tagID);
                    $scope.startNewUserSession(tagID);
                } else {
                    response.write("Tag already processed, chill a bit: "+tagID);
                    console.log("[app-ctrlr] tag already in use");
                }

                response.end();

                break;

            default:

                response.writeHeader(200, {"Content-Type": "text/plain"});
                response.write("Hello from YTLB service (listener)!");
                response.end();
        }


    });


    // The loading of the settings is asynch, hence the callback
    $settingsService.initWithCallback(function(){
        console.log("[app-ctrlr] Mode is: "+$settingsService.getAppMode());
        $scope.settings.partnerIP = $settingsService.getPartnerIP();
        $scope.settings.loadEVRemote = $settingsService.getLoadEVDataRemote();
        // This next call continues asynch boot process after fetching app mode from disk
        $scope.configureForAppMode();
    });

    $scope.changeAppMode = function (newMode){
        $settingsService.setAppMode(newMode);
        $scope.configureForAppMode();
        console.log("App mode is: "+$settingsService.getAppMode());

    }

    $scope.configureForAppMode = function () {

        // hide the infomodal on mode change
        $scope.showInfoModal = false;

        switch($settingsService.getAppMode()){
            case "TOUCHSCREEN":
                console.log("[app-ctrlr] Configuring for TOUCHSCREEN mode.");
                $scope.mainScreens.openingForCurrentMode = $scope.mainScreens.opening;
                break;
            case "BIGSCREEN":
                console.log("[app-ctrlr] Configuring for BIGSCREEN mode.");
                $scope.mainScreens.openingForCurrentMode = $scope.mainScreens.bigOpening;
                break;

            default :
                console.log("[app-ctrlr] ERROR: Don't know this mode! Forcing TOUCHSCREEN.");
                $scope.mainScreens.openingForCurrentMode = $scope.mainScreens.opening
                $settingsService.setAppMode("TOUCHSCREEN");

        }

        // check if we are currently on the opening screen, and if-so reload it
        // You do not want to do this if you are not on the opening screen when changing modes!!
        if ($scope.mainScreenPath==$scope.mainScreens.opening || $scope.mainScreenPath==$scope.mainScreens.bigOpening)
            $scope.mainScreenPath = $scope.mainScreens.openingForCurrentMode;

    }

   $scope.bsPlay = function(file_url){
       //TODO should check existence before switching

       $sharedBus.bsVideo = file_url;
       $scope.mainScreenPath = $scope.mainScreens.bigPlayback;
       $scope.$apply();
       $scope.$broadcast("NEWBSVID");

   }

    // When in BS mode, this sends a broadcast that sops the player
    $scope.bsStop = function(file_url){
        $scope.$broadcast("STOPBSVID");
    }

    // When in TS mode, this sends a broadcast that syncs to the big screen
    $scope.sendBSSync = function(timecode){
        $scope.$broadcast("BS_SYNC", { tc: timecode});
    }

    $scope.loadOpeningScreen = function() {
        $scope.mainScreenPath = $scope.mainScreens.openingForCurrentMode;

    }


    /**
     *
     * Methods to handle the hide/show of various playlist pickers
     *
     */

    /**
     *
     * Removes old popup (if any), waits a delay then inserts new popup. This allows close and open
     * animations to run in their entirety.
     * @param ppath path to the new partial to be shown in the Popup container
     */
    $scope.delayShowPopup = function(ppath){
        if ($scope.filterPickerPath==""){
            // No need for exit anim, just shove the view in
            $scope.filterPickerPath = ppath;

        } else {
            // trigger exit anim and then load new view
            $scope.filterPickerPath = "";
            $scope.nextPickerPath = ppath;
            $timeout(function(){
                $scope.filterPickerPath = $scope.nextPickerPath;
            }, 500);
        }
    }

    /**
     * Adds popup to the back stack and then delay shows it.
     * @param ppath path to new partial
     */
    $scope.pushPopup = function(ppath){
        $scope.popupStack.push(ppath);
        $scope.delayShowPopup(ppath);
    }

    /**
     * Pops the current popup and replaces it with the next one in the back stack, if any,
     */
    $scope.popPopup = function(){

        // Trigger the exit animation by dumping the old partial
        //$scope.filterPickerPath ="";
        // toss last
        $scope.popupStack.pop();

        if ($scope.popupStack.length>0){
            // Grab last element in stack without popping
            $scope.delayShowPopup($scope.popupStack[$scope.popupStack.length-1]);
        }
    }

    /**
     * Brute force remove all picker popups and dump the stack
     */
    $scope.removeAllPopups = function() {
        $scope.filterPickerPath = "";
        $scope.popupStack.clear();
    }

    $scope.showCategoryPickerPopup = function(){

        $scope.pushPopup(CAT_PICKER_PATH);

    }

    $scope.showRegionPickerPopup = function(){

        $scope.pushPopup(REGION_PICKER_PATH);

    }

    $scope.showBrandPickerPopup = function(){

       $scope.pushPopup(BRAND_PICKER_PATH);
    }

    $scope.showPickerChoicePopup = function(){
               $scope.pushPopup(PICKER_CHOICE_PATH);
    }

    $scope.showPickerChoicePopupDelayed = function(){
        $timeout( function(){
            $scope.pushPopup(PICKER_CHOICE_PATH);
        }, 1500);
    }

    /**
     * Methods for app screen-to-screen navigation
     *
     */

    $scope.segueToScreen = function(newScreen){
        //Outtro animations must take less than 500ms
        //TODO, cleaner would be an emit when outro done
        $scope.$broadcast("RUN_OUTRO");
        $timeout(function(){
            $scope.mainScreenPath = newScreen;
        }, 500);

    }

    $scope.playPlaylist = function(plist){
        $scope.removeAllPopups();
        $sharedBus.currentPlaylist = plist;
        $timeout(function(){
            $scope.segueToScreen($scope.mainScreens.playback);
        }, 500);
    }

    $scope.initMainScreen = function(){
        // Trigger into animation
        $scope.$broadcast("RUN_INTRO");
    }


    /**
     * Called after the ng-include loads for the popups in order to configure the jQuery scroller. Look in the
     * ng-include in index.html to see where it is triggered from.
     */
    $scope.configureScrollbars = function(){

        $(".custom-scroll").mCustomScrollbar({
            scrollInertia:1000,
            scrollEasing:"easeOutCubic",
            mouseWheel:false
        });

    }

    // Broadcast primarily to the openingScreen so it can reset its right footer text
    $scope.resetToStart = function(){
        $scope.$broadcast("RESTART");
        $scope.removeAllPopups();

    }

    $scope.returnBigScreenWait = function(){
        $scope.removeAllPopups();
        //TODO make this the right path
        $scope.mainScreenPath = $scope.mainScreens.openingForCurrentMode;

    }

    $scope.dealWithUserCategories = function(cats){
        console.log("[app-ctrlr] Dealing with attendee categories: "+cats);
        if (cats!=""){
            var carray = cats.split(",");
            var upCarray = [];
            carray.forEach(function(c){
                upCarray.push(c.toUpperCase());
            })

            var att = $sharedBus.attendee;

            //$sharedBus.popupMessage = cats;

            //$scope.pushPopup(MESSAGE_POPUP_PATH);

            $mediaService.buildPlaylistForCategories(upCarray, att.firstName).then(function(playlist){
                $scope.playPlaylist( playlist );
            });

        } else {
            $sharedBus.popupMessage = "It doesn't look like we have enough info to create a custom playlist!\n\nPlease press the question mark below and build one for yourself.";
            $scope.pushPopup(MESSAGE_POPUP_PATH);
        }
    }

    $scope.startNewUserSession = function(tagID){

        if ($scope.mainScreenPath!=$scope.mainScreens.opening){
            console.log("[app-ctrlr] badge scanned on wrong screen.");
            lastTag = "";  // in case it is a new user
            return;
        }

        $eventFarm.getAttendee(tagID).then(
            function(attendee){
                console.log("[app-ctrlr] Got new attendee named: "+attendee.firstName);
                $sharedBus.attendee = attendee;

                var Datastore = require('nedb');
                db = new Datastore({ filename: 'cache/nedb/attendees.db' });
                db.loadDatabase();

                var ts = new Date();
                var date = ts.toUTCString();
                attendee.tagTime = date;
                attendee.unixTime = new Date().getTime();

                db.insert(attendee, function(err, newDoc){
                    if (!err)
                        console.log("[app-ctrlr] logged attendee OK");
                })

                var qs = attendee.questions;

                if (Array.isArray(qs)){
                    qs.forEach(function(entry){
                        if ('favoriteVideo' in entry)
                            $scope.dealWithUserCategories(entry.favoriteVideo);
                    })
                } else {
                    $scope.dealWithUserCategories("");
                }

                /*

                */
            },
            function(error){
                console.log("[a]]-ctrlr] FAILED going to EVF for: "+tagID);
                if (error.code==404){
                    $sharedBus.attendee = {};
                    $sharedBus.popupMessage="Sorry about that, but your tag number doesn't seem to be in our database!";
                    $scope.pushPopup(MESSAGE_POPUP_PATH);
                } else {
                    $sharedBus.popupMessage="Hmm, there's something weird going on with this tag. Please tell support you got an error ["+
                        error.code+"]. The message is ["+error.message+"].";
                    $scope.pushPopup(MESSAGE_POPUP_PATH);
                }
            }
        )

    }


});
