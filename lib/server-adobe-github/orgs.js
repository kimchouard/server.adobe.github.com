'use strict';

var request = require('request');

//----------------------------------------------------------
//					Organisation
//----------------------------------------------------------

var getOrgs = function(callback) {
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
			console.log('Error occured. ', res.statusCode, '\n', res.body, '\n', err);
		}
	});
};

module.exports = {
	getOrgs: getOrgs
}