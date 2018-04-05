var express = require('express');
var apps = express();
apps.use(express.static(__dirname + '/app'));
apps.listen(process.env.PORT || 3000);
