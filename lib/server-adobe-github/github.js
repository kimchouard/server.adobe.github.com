'use strict';

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

// Syst Dependencies
var restify = require('restify');
var async = require('async');
var assert = require('assert');

// User Dependencies
var config = require('../../config/configuration.js');

//----------------------------------------------------------
//					Private functions

function getOrgRepos(org, callback) {
	var repos = restify.createJsonClient({
	  url: 'https://api.github.com'
	});
	var reqUrl = '/users/' + org.userName + '/repos?sort=updated';

	// console.log('Doing Get req for ', reqUrl, org, '\n With user: ', config.user, '\n');

	if (config.user && config.pass)
		repos.basicAuth(config.user, config.pass);

	var req = repos.get(reqUrl, function(err, req, res, obj) {
		assert.ifError(err);

		// console.log('Answer recieved\n');

	  var projects = new Array();

	  // Object clean up -> keep only what is needed on the frontend
	  for (var i=0; i < obj.length; i++) {
	  	var project = obj[i];

		  projects.push({
		  	"name": project.name,
	      "watchers_count": project.watchers_count,
	      "org": project.owner.login,
	      "languages": [ project.language ],
	      "description": project.description,
	      "pushed_at": project.pushed_at,
	      "html_url": project.html_url,
	      "homepage": project.homepage,
	      "languagesTotal": 0
		  });
		}

	  callback(null, projects);
	});
};


//----------------------------------------------------------
//					Public functions

function getAllRepos(orgs, callback) {
	async.map(orgs, getOrgRepos, function(err, result){
		// Callback when all answers has been recieved
	  
		// Put all the repos in only one array
	  var repos = new Array;
	  for (var j = 0; j < result.length; j++) {
	  	var orgRepos = result[j];

	  	for (var k = 0; k < orgRepos.length; k++) {
	  		// Get real org name
	  		for (var l = 0; l < orgs.length; l++) {
		  		if(orgs[l].userName === orgRepos[k].org) {
		  			orgRepos[k].org = orgs[l].name;
		  		}
		  	}

	  		repos.push(orgRepos[k]);
	  	}
	  }

	  callback(repos);
	});
}


module.exports = {
	getAllRepos: getAllRepos
};