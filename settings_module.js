/**
 * Created by mkahn on 6/2/14.
 */

/**
 * Handle reading and writing the settings object to file in content/settings
 *
 * For info on writing node modules: http://bites.goodeggs.com/posts/export-this/
 *
 */
var path = require('path');
var fs = require('fs');
var sfname = 'content/settings/settings.json';

var fullpath = path.resolve(path.join(__dirname, sfname ));


exports.getSettings = function(){

    var settings = {};
    var exists = fs.existsSync(fullpath);
    if (!exists){
        console.log("NO settings, creating some");
        settings.eventId = 0;
        settings.eventName = "No Event Chosen";
        settings.nextUp = null;
        exports.setSettings(settings);
        return settings;
    } else {
        var settingsString = fs.readFileSync(fullpath);
        return JSON.parse(settingsString);
    }

};

exports.setSettings = function(settings){
    fs.writeFile(fullpath, JSON.stringify(settings), function(err){
        if (err)
            console.log("ERROR writing settings!");
    });
}
