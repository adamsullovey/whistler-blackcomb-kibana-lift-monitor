var parseString = require('xml2js').parseString,
	request = require('request');

var onStatusLoaded = function (err, result, body) {
	parseString(body, onXmlParse);
};

var onXmlParse = function (err, result) {
	var stuff = (result.Lifts.Lift).map(function (result) {
		return result.$;
	});

	console.log(stuff);
};

request('https://secure.whistlerblackcomb.com/ls/lifts.aspx', onStatusLoaded);