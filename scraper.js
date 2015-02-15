var parseString = require('xml2js').parseString,
	q = require('q'),
	http = require('q-io/http'),
	crypto = require('crypto');

const REFRESH_INTERVAL = 60000,
	FEED_URL = 'https://secure.whistlerblackcomb.com/ls/lifts.aspx';

// load the feed
var makeRequest = function () {

	var saveToElasticSearchPromises = http.read(FEED_URL)
		.then(onStatusLoaded)
		.then(onXmlParse);


	q.allSettled(saveToElasticSearchPromises)
		.then(console.log)
		.then(null, function (error) {
			console.log('scraper error:', error);
		});
};

// when the feed has loaded, parse it
var onStatusLoaded = function (responseBody) {
	return q.nfcall(parseString, responseBody);
};

// when parsed, reformat data and save it to ES
var onXmlParse = function (result) {

	var data = result.Lifts.Lift.map(function (result) {
			// fix unepxected formatting from XML2JS
			return result.$;
		})
		.map(transformDataForElasticSearch);

	return data.map(saveData);

};

// manipulate data to get it from the parsed XML to something ready for ES
var transformDataForElasticSearch = function (data) {
	// ES needs everything to have a unique _id, a type, and logstash-style timestamps are handy
	data._id = crypto.createHash('md5').update(data.name + Number(new Date())).digest('hex');
	data.type = 'lift-status';
	data['@timestamp'] = new Date();

	// cast these to numbers so they can be graphed in kibana
	// kibana rounds numbers. Move the decimal place over to see more details and still see relative speeds
	data.speed = Number(data.speed) * 10;
	data.waitstatusid = Number(data.waitstatusid);

	// not using these fields
	delete(data.LiftGUID);
	delete(data.avgspeed);

	return data;

};

// save each bit of info from the parsed XML
var saveData = function (data) {

	var json = JSON.stringify(data);
	var requestUrl = process.env.BONSAI_URL + '/wb-lift-data/' + data.type + '/' + data._id;

	var requestOptions = http.normalizeRequest(requestUrl);

	requestOptions.body = [json];
	requestOptions.method = 'post';
	requestOptions.headers = {
		'Content-Type': 'application/json',
		'Content-Length': json.length
	};

	//console.log('should post: ', requestOptions);

	return http.request(requestOptions)
		.then(onDataSaved);

};

// callback for successful HTTP request to ES
var onDataSaved = function (response) {

	// rebuild the body out of the buffer
	var responseBody = '';
	response.body.forEach(function (chunk) {
		responseBody += chunk.toString();
	});


	// remembering to return promises all the way down the chain
	return q.when(JSON.parse(responseBody));
};


// make 1 request right away
makeRequest();

// start a timer to load feed every once in a while
setInterval(makeRequest, REFRESH_INTERVAL);