'use strict';

var restify = require('restify');
var config = require('../../config/configuration.js');
var assert = require('assert');
var async = require('async');
var fs = require('fs');


//----------------------------------------------------------
//			Main Routes Controller		
//----------------------------------------------------------

function getOrgs(callback) {
	fs.readFile(config.dir+'/lib/server-adobe-github/orgs.json', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }

		callback(JSON.parse(data));
	});
}

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

function getAllRepos(orgs, callback) {
	console.log(orgs, getOrgRepos);
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
//			Main Routes Controller		
//----------------------------------------------------------

function respondRoot(req, res, next) {
  res.contentType = 'json';

  getOrgs(function(orgs) {
  	getAllRepos(orgs, function(repos) {
  		res.send(repos);
  	});
  });
}

module.exports = {
	respondRoot: respondRoot
	, getOrgs: getOrgs
};