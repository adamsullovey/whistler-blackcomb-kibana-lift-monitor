var parseString = require('xml2js').parseString,
	request = require('request'),
	express = require('express');

var app = express();

var onStatusLoaded = function (err, result, body) {
	parseString(body, onXmlParse);
};

var onXmlParse = function (err, result) {
	var stuff = (result.Lifts.Lift).map(function (result) {
		return result.$;
	});

	console.log(stuff);
};

app.use(express.static('public', {
	etag: true
}));

var server = app.listen(80, function () {
	console.log('web server is live');
});

request('https://secure.whistlerblackcomb.com/ls/lifts.aspx', onStatusLoaded);