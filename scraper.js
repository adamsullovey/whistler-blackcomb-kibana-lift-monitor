var parseString = require('xml2js').parseString,
	request = require('request'),
	crypto = require('crypto');

// load the feed
var makeRequest = function () {
	request('https://secure.whistlerblackcomb.com/ls/lifts.aspx', onStatusLoaded);
};

// when the feed has loaded, parse it
var onStatusLoaded = function (err, result, body) {
	if (err) throw err;
	parseString(body, onXmlParse);
};

// when parsed, reformat data and save it to ES
var onXmlParse = function (err, result) {
	if (err) throw err;
	var stuff = (result.Lifts.Lift).map(function (result) {
		// fix unepxected formatting from XML2JS
		return result.$;
	}).map(function (data) {

		// lets manipulate data!
		// ES needs everything to have a unique ID, a type, and logstash-style timestamps are handy
		data._id = crypto.createHash('md5').update(data.name + Number(new Date())).digest('hex');
		data.type = 'lift-status';
		data['@timestamp'] = new Date();

		// cast these to numbers so they can be graphed in kibana
		data.speed = Number(data.speed);
		data.avgspeed = Number(data.avgspeed);
		data.waitstatusid = Number(data.waitstatusid);

		// not using this field, so delete it
		delete(data.LiftGUID);

		return data;
	}).forEach(saveData);

	//saveData(stuff);

};

// save the data
var saveData = function (data) {
	console.log('data', data);

	var requestOptions = {
		url: process.env.BONSAI_URL + '/wb-lift-data/' + data.type + '/' + data._id,
		json: data,
	};

	//console.log(data);

	request.post(requestOptions, onDataSaved);

};

// when saved, log it
var onDataSaved = function (err, response, body) {
	if (err) throw err;
	console.log('saved', body);
};


//makeRequest();

// start a timer to load feed every once in a while
setInterval(makeRequest, 60000);