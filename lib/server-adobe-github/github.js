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

function getGitHubClient() {
	var githubClient = restify.createJsonClient({
	  url: 'https://api.github.com'
	});
	if (config.user && config.pass)
		githubClient.basicAuth(config.user, config.pass);

	return githubClient;
}

function getOrgRepos(org, callback) {
	var githubClient = getGitHubClient();
	var reposUrl = '/users/' + org.userName + '/repos?sort=updated';

	// console.log('Doing Get req for ', reqUrl, org, '\n With user: ', config.user, '\n');


	var req = githubClient.get(reposUrl, function(err, req, res, obj) {
		assert.ifError(err);

		// console.log('Repo recieved\n');
	  callback(null, obj);
	});
};

function getOrgFullName(orgName, orgs) {
	// Get real org name
	for (var i = 0; i < orgs.length; i++) {
		if(orgs[i].userName === orgName) {
			return orgs[i].name;
		}
	}

	return "";
};

function getReposLang(repo, callback) {
	var githubClient = getGitHubClient();
	var langUrl = repo.languages_url.substring(22);;

	var req = githubClient.get(langUrl, function(err, req, res, obj) {
		assert.ifError(err);
		console.log('Langs recieved\n', obj);

		repo.languages = obj;
	  callback(null, repo);
	});
}


//----------------------------------------------------------
//					Public functions

function getAllRepos(orgs, callback) {
	async.map(orgs, getOrgRepos, function(err, result) {
		// Callback when all answers has been recieved
	  
		// Put all the repos in only one array
	  var repos = new Array;
	  for (var j = 0; j < result.length; j++) {
	  	var orgRepos = result[j];

	  	for (var k = 0; k < orgRepos.length; k++) {
	  		var repo = orgRepos[k];

	  		repos.push({
			  	"name": repo.name,
		      "watchers_count": repo.watchers_count,
		      "org": getOrgFullName(repo.owner.login, orgs),
		      "languages": [ repo.language ],
		      "description": repo.description,
		      "pushed_at": repo.pushed_at,
		      "html_url": repo.html_url,
		      "languages_url": repo.languages_url,
		      "homepage": repo.homepage
			  });
	  	}
	  }

	  async.map(repos, getReposLang, function(err, result) {
	  	callback(result);
	  });
	});
}


module.exports = {
	getAllRepos: getAllRepos
};