var express = require('express'),
	scraper = require('./scraper');

var app = express();

app.set('port', (process.env.PORT || 80));


app.use(express.static(__dirname + '/public', {
	etag: true
}));

var server = app.listen(app.get('port'), function () {
	console.log("Node app is running at localhost:" + app.get('port'));
});