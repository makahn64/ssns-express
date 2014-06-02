/**
 * Created by mkahn on 6/2/14.
 */

/**
 * Handle reading and writing the settings object to file in content/settings
 *
 * For info on writing node modules: http://bites.goodeggs.com/posts/export-this/
 *
 */

var fs = require('fs');
var sfname = 'content/settings/settings.json';


exports.getSettings = function(){

    var settings = {};
    var exists = fs.existsSync(sfname);
    if (!exists){
        console.log("NO settings, creating some");
        settings.eventId = 0;
        settings.eventName = "No Event Chosen";
        settings.cloudUrl = "http://www.xplorious.com/sharestation";
        exports.setSettings(settings);
        return settings;
    } else {
        var settingsString = fs.readFileSync(sfname);
        return JSON.parse(settingsString);
    }

};

exports.setSettings = function(settings){
    fs.writeFile(sfname, JSON.stringify(settings), function(err){
        if (err)
            console.log("ERROR writing settings!");
    });
}
