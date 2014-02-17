'use strict';

//----------------------------------------------------------
//					Github API Calls
//----------------------------------------------------------

// Syst Dependencies
var fs = require('fs');
var restify = require('restify');
var async = require('async');
var assert = require('assert');
var request = require('request');

// User Dependencies
var config = require('../../config/configuration.js');
var orgController = require('./orgs.js');

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
		orgs: null
	};
}

function doGithubCall(path, callback) {
	var options = {
    url: 'https://api.github.com'+path,
    headers: {
        'User-Agent': 'adobe.github.com'
    }
	};

	if (config.user && config.pass) {
		request(options, callback).auth(config.user, config.pass);
	} else {
		request(options, callback);
	}
}

function getOrgInfos(org, callback) {
	var infosUrl = '/orgs/' + org.userName;

	var reqInfos = doGithubCall(infosUrl, function(err, res, obj) {
		if (!err && res.statusCode == 200) {
			var info = JSON.parse(obj);
			org = updateOrg(info);

			var reposUrl = '/users/' + org.userName + '/repos?sort=updated';
		  var reqRepos = doGithubCall(reposUrl, function(err, res, obj) {
				if (!err && res.statusCode == 200) {
					var info = JSON.parse(obj);
			  	callback(null, info);
				} else {
					console.log('error', res.statusCode, ' : ', res.body, ' : ', err, ',', (new Date()).toString());
				}
			});
		} else {
			console.log('error', res.statusCode, ' : ', res.body, ' : ', err, ',', (new Date()).toString());
		}
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
	var langUrl = repo.languages_url.substring(22);;

	var req = doGithubCall(langUrl, function(err, res, obj) {
		if (!err && res.statusCode == 200) {
			var info = JSON.parse(obj);

			repo.languages = [];//info;
			repo.languagesTotal = 0;
			for (var key in info) {
				repo.languages.push( { name: key, value: info[key] } );
				repo.languagesTotal += info[key];
	      addLanguageTotal( { name: key, value: info[key] } );
			};

		  callback(null, repo);
		} else {
			console.log('error', res.statusCode, ' : ', res.body, ' : ', err, ',', (new Date()).toString());
		}
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
	console.log('refresh_github, ,', (new Date()).toString());
	resetTemp(new Date());

	orgController.getOrgs(function(orgs) {
		tempDatas.orgs = orgs;
		ghDatas.orgs = orgs;
		getAllRepos(orgs, function () {
			getStats();

			ghDatas = tempDatas;
			ghDatas.lastUpdate = new Date();

			callback();
		});
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
			refreshRepos(function() {
				console.log('updated_github,last: ', ghDatas.lastUpdate.toString(),',', (new Date()).toString());
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
    console.log('started_github, First Init,', (new Date()).toString());
	});
}
catch(err) {
  console.error('error,', err.message, ' Call: ', err.syscall, ',', (new Date()).toString());
};

module.exports = {
	getRepos: getRepos,
};