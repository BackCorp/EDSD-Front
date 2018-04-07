var express = require('express');
var apps = express();
var port = process.env.PORT || 3000;

// make express look in the app directory for assets (css/js/img)
apps.use(express.static(__dirname + '/app'));


apps.listen(port, function() {
    console.log('EDSD-app app is running on http://localhost:' + port);
});
