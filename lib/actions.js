'use strict';

var restify = require('restify');
var assert = require('assert');

var orgs = [
	{
	  "userName": "adobe",
	  "name": "Adobe Systems",
	  "desc": "Repository for certain Adobe Open Source releases"
	},
	{
	  "userName": "adobe-Webplatform",
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
	  "userName": "Adobe-CloudOps",
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

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

function getRepos(orgName) {
	var repos = restify.createJsonClient({
	  url: 'https://api.github.com'
	});
	
	console.log('Doing Get req');

	// repos.basicAuth('$login', '$password');
	var req = repos.get('/users/' + orgName + '/repos?sort=updated', function(err, req, res, obj) {
		assert.ifError(err);

	  console.log('\n\n', JSON.stringify(obj, null, 2),'\n\n');
	});

	// console.log('\n\n',req,'\n\n');

	return req;
};

//----------------------------------------------------------
//					
//----------------------------------------------------------

function respondRoot(req, res, next) {
  res.contentType = 'json';
  res.send({test: 'true'});
}

module.exports = {
	respondRoot: respondRoot
	// , getRepos: getRepos
};