var express = require('express'),
	scraper = require('./scraper');

var app = express();

app.use(express.static('public', {
	etag: true
}));

var server = app.listen(80, function () {
	console.log('web server is live');
});