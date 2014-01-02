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
  res.contentType = 'json';

  github.getRepos(function(repos) {
		res.send(repos);
	});
}

module.exports = {
	rootController: rootController
};