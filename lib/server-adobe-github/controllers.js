'use strict';

//----------------------------------------------------------
//					Route controllers
//----------------------------------------------------------


// User Dependencies
var config = require('../../config/configuration.js');
var github = require('./github.js');


//----------------------------------------------------------
//					Public functions

function rootController(req, res, next) {
	console.log('query_recieved, From: '+req.connection.remoteAddress+','+ (new Date()).toString());
	
  res.contentType = 'json';

  github.getRepos(function(repos) {
		res.send(repos);
	});
}

module.exports = {
	rootController: rootController
};