'use strict';

//----------------------------------------------------------
//					Route controllers
//----------------------------------------------------------

// Syst Dependencies
var fs = require('fs');

// User Dependencies
var config = require('../../config/configuration.js');
var github = require('./github.js');


//----------------------------------------------------------
//					Private functions

function getFile(path, callback) {
	fs.readFile(config.dir+path, 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }

		callback(JSON.parse(data));
	});
}


//----------------------------------------------------------
//					Public functions

function rootController(req, res, next) {
  res.contentType = 'json';

  getFile('/lib/server-adobe-github/data/orgs.json', function(orgs) {
  	github.getRepos(orgs, function(repos) {
  		res.send(repos);
  	});
  });
}

module.exports = {
	rootController: rootController
};