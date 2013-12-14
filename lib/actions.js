'use strict';

var restify = require('restify');
var config = require('../config/configuration.js');
var assert = require('assert');
var fs = require('fs');
var async = require('async');


//----------------------------------------------------------
//			Main Routes Controller		
//----------------------------------------------------------

function getOrgs() {
	var orgs = [
		{
		  "userName": "adobe",
		  "name": "Adobe Systems",
		  "desc": "Repository for certain Adobe Open Source releases"
		},
		{
		  "userName": "adobe-webplatform",
		  "name": "Adobe Web Platform",
		  "desc": "Releases from the Adobe Web Platform teams"
		},
		{
		  "userName": "adobe-research",
		  "name": "Adobe Research",
		  "desc": "Releases from the Adobe Research teams"
		},
		{
		  "userName": "adobe-photoshop",
		  "name": "Adobe Photoshop",
		  "desc": "Stuff from the Adobe Photoshop team"
		},
		{
		  "userName": "Adobe-cloudOps",
		  "name": "Adobe CloudOps",
		  "desc": "Releases from the Adobe Cloud Operations teams"
		},
		{
		  "userName": "topcoat",
		  "name": "Topcoat",
		  "desc": "UI Library for creating beautiful and responsive applications using web standards"
		},
		{
		  "userName": "adobe-security",
		  "name": "Adobe Security",
		  "desc": "Releases from the Adobe Security teams"
		},
		{
		  "userName": "adobe-fonts",
		  "name": "Adobe Fonts",
		  "desc": "Releases from the Adobe Font teams"
		},
		{
		  "userName": "adobe-flash",
		  "name": "Adobe Flash",
		  "desc": "Stuff from the Adobe Flash team"
		}
	];

	return orgs;
}

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

function getRepos(org, callback) {
	var repos = restify.createJsonClient({
	  url: 'https://api.github.com'
	});
	var reqUrl = '/users/' + org.userName + '/repos?sort=updated';

	console.log('Doing Get req for ', reqUrl, org, '\n With user: ', config.user, '\n');

	if (config.user && config.pass)
		repos.basicAuth(config.user, config.pass);

	var req = repos.get(reqUrl, function(err, req, res, obj) {
		assert.ifError(err);

		console.log('Answer recieved\n');

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

  var orgs = getOrgs();
	async.map(orgs, getRepos, function(err, result){
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

	  res.send(repos);
	});
}

module.exports = {
	respondRoot: respondRoot
};