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
var orgsModel = require('./orgs.js');

//----------------------------------------------------------
//					Variables

var ghDatas = resetTemp(null);
var tempDatas;

//----------------------------------------------------------
//					Private functions

// Temporary Data storing when calling the GitHub API
function resetTemp(time) {
	return tempDatas = {
		lastUpdate: time,
		stats: {},
		repos: [],
		langs: [],
		orgs: orgsModel
	};
}

function getGitHubClient() {
	var githubClient = restify.createJsonClient({
	  url: 'https://api.github.com'
	});
	if (config.user && config.pass)
		githubClient.basicAuth(config.user, config.pass);

	return githubClient;
}

function getOrgInfos(org, callback) {
	var githubClient = getGitHubClient();

	var infosUrl = '/orgs/' + org.userName;
	var reqInfos = githubClient.get(infosUrl, function(err, req, res, obj) {
		assert.ifError(err);

		// console.log('Infos recieved\n');
		org = updateOrg(obj);

		var reposUrl = '/users/' + org.userName + '/repos?sort=updated';
	  var reqRepos = githubClient.get(reposUrl, function(err, req, res, obj) {
			assert.ifError(err);

			// console.log('Repo recieved\n');
		  callback(null, obj);
		});
	});
};

function getOrgFullName(orgName) {
	var orgFullName = "";

	// Get real org name
	for (var i = 0; i < ghDatas.orgs.length; i++) {
		var org = ghDatas.orgs[i];
		if(org.userName.toLowerCase() === orgName.toLowerCase()) {
			orgFullName = org.name;
			return orgFullName;
		}
	};

	return orgFullName;
};

function updateOrg(obj) {
	for (var i = 0; i < ghDatas.orgs.length; i++) {
		var org = ghDatas.orgs[i];
		if(org.userName.toLowerCase() === obj.login.toLowerCase()) {
			org.avatar_url = obj.avatar_url;
			org.blog = obj.blog;
			org.public_repos = obj.public_repos;
			org.html_url = obj.html_url;
			org.updated_at = obj.updated_at;

			return org;
		}
	};
}

function getReposLang(repo, callback) {
	var githubClient = getGitHubClient();
	var langUrl = repo.languages_url.substring(22);;

	var req = githubClient.get(langUrl, function(err, req, res, obj) {
		assert.ifError(err);
		// console.log('Langs recieved\n', obj);

		repo.languages = [];//obj;
		repo.languagesTotal = 0;
		for (var key in obj) {
			repo.languages.push( { name: key, value: obj[key] } );
			repo.languagesTotal += obj[key];
      addLanguageTotal( { name: key, value: obj[key] } );
		};

	  callback(null, repo);
	});
};

function addLanguageTotal(newLang) {
	// Get real org name
	for (var i=0; i < tempDatas.langs.length; i++) {
		var lang = tempDatas.langs[i];

		if(lang.name === newLang.name) {
			lang.value += newLang.value;
			return false;
		}
	};

	tempDatas.langs.push(newLang);
	return true;
}

function getAllRepos(orgs, callback) {
	async.map(orgs, getOrgInfos, function(err, result) {
		// Callback when all answers has been recieved

		// Put all the repos in tempDatas array
	  result.forEach(function(orgRepos) {
	  	orgRepos.forEach(function(repo) {
	  		tempDatas.repos.push({
			  	"name": repo.name,
		      "watchers_count": repo.watchers_count,
		      "org": getOrgFullName(repo.owner.login),
		      "languages": [ repo.language ],
		      "description": repo.description,
		      "pushed_at": repo.pushed_at,
		      "html_url": repo.html_url,
		      "languages_url": repo.languages_url,
		      "homepage": repo.homepage
			  });
	  	});
	  });

	  async.map(tempDatas.repos, getReposLang, function(err, result) {
	  	callback();
	  });
	});
}

function getStats() {
	var nbLinesCode = 0;
	for(var i = 0; i < tempDatas.langs.length; i++) {
		nbLinesCode += tempDatas.langs[i].value;
	}

	tempDatas.stats.nbLinesCode = nbLinesCode;
}

function refreshRepos(callback) {
	console.log("Updating GitHub Model...");
	resetTemp(new Date());

	getAllRepos(orgsModel, function () {
		getStats();

		ghDatas = tempDatas;

		callback();
	});
}


//----------------------------------------------------------
//					Public functions

function getRepos(callback) {
	if (ghDatas.lastUpdate != null) {
		var now = new Date();
		var dateToReload = new Date(ghDatas.lastUpdate);
		dateToReload.setMinutes(ghDatas.lastUpdate.getMinutes() + config.freqReload);
		var toBeReloaded = (dateToReload < now);

		if (toBeReloaded || !ghDatas.lastUpdate) {
			console.log("GitHub model outdated");
			
			refreshRepos(function() {
				console.log("GitHub model updated");
			});
		}

		callback([ghDatas]);
	} else {
		callback([{"error":"Server not yet instantiated. Please reload in a few seconds."}])
	}
}

//----------------------------------------------------------
//					Init

try {
  refreshRepos(function() {
		console.log("GitHub Model initialized");
	});
}
catch(err) {
  console.error("Error: [%s] Call: [%s]", err.message, err.syscall);
};

module.exports = {
	getRepos: getRepos,
};