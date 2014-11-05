'use strict';

var request = require('request');
var config = require('../../config/configuration.js');

//----------------------------------------------------------
//					Organisation
//----------------------------------------------------------

var getOrgs = function(callback) {
	console.log('get_orgs, ,', (new Date()).toString());
	var options = {
    url: 'https://raw.githubusercontent.com/adobe/adobe.github.com/master/data/org.json',
    headers: {
        'User-Agent': 'server.adobe.com'
    }
	};
	
	request(options, function(err, res, obj) {
		if (!err && res.statusCode == 200) {
			var info = JSON.parse(obj);
			callback(info);
		} else {
			config.errorLog(options.url, res, err);
		}
	});
};

module.exports = {
	getOrgs: getOrgs
}