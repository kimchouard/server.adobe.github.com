'use strict';

var request = require('request');

//----------------------------------------------------------
//					Organisation
//----------------------------------------------------------

var getOrgs = function(callback) {
	console.log('get_orgs, ,', (new Date()).toString());
	var options = {
    url: 'https://raw2.github.com/adobe/adobe.github.com/master/data/org.json',
    headers: {
        'User-Agent': 'server.adobe.com'
    }
	};
	
	request(options, function(err, res, obj) {
		if (!err && res.statusCode == 200) {
			var info = JSON.parse(obj);
			callback(info);
		} else {
			console.log('error', res.statusCode, ' : ', res.body, ' : ', err, ',', (new Date()).toString());
		}
	});
};

module.exports = {
	getOrgs: getOrgs
}