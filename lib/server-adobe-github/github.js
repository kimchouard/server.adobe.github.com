'use strict';

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

// Syst Dependencies
var fs = require('fs');
var restify = require('restify');
var async = require('async');
var assert = require('assert');

// User Dependencies
var config = require('../../config/configuration.js');

//----------------------------------------------------------
//					Variables

var ghRepos = {
	lastUpdate: null,
	data: []
};

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
	orgs.forEach(function (org) {
		if(org.userName === orgName) {
			return org.name;
		}
	});

	return "";
};

function getReposLang(repo, callback) {
	var githubClient = getGitHubClient();
	var langUrl = repo.languages_url.substring(22);;

	var req = githubClient.get(langUrl, function(err, req, res, obj) {
		assert.ifError(err);
		// console.log('Langs recieved\n', obj);

		repo.languages = obj;
		repo.languagesTotal = 0;
		for (var key in obj) {
			// repo.languages.push( { name: key, value: obj[key] } );
			repo.languagesTotal += obj[key];
      // addLanguageTotal( { name: key, value: obj[key] } );
		};

	  callback(null, repo);
	});
}

function getAllRepos(orgs, callback) {
	async.map(orgs, getOrgRepos, function(err, result) {
		// Callback when all answers has been recieved
	  
		// Put all the repos in only one array
	  var repos = [];
	  result.forEach(function(orgRepos) {
	  	orgRepos.forEach(function(repo) {
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
	  	});
	  });

	  async.map(repos, getReposLang, function(err, result) {
	  	callback(result);
	  });
	});
}

function refreshRepos(callback) {
	getFile('/lib/server-adobe-github/data/orgs.json', function(orgs) {
  	getAllRepos(orgs, function (repos) {
			ghRepos.lastUpdate = new Date();
			ghRepos.data = repos;

			callback();
		});
	});
}


//----------------------------------------------------------
//					Public functions

function getRepos(callback) {
	var now = new Date();
	var dateToReload = new Date(ghRepos.lastUpdate);
	dateToReload.setMinutes(ghRepos.lastUpdate.getMinutes() + config.freqReload);
	var toBeReloaded = (dateToReload < now);
	console.log(toBeReloaded);

	if (toBeReloaded || !ghRepos.lastUpdate) {
		console.log("GitHub model outdated");
		
		refreshRepos(function() {
			console.log("GitHub model updated");
		});
	}

	callback(ghRepos.data);
}

//----------------------------------------------------------
//					Init

refreshRepos(function() {
	console.log("GitHub Model initialized");
});

module.exports = {
	getRepos: getRepos,
};