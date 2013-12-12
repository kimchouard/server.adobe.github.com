'use strict';

//----------------------------------------------------------
//					Pull Adobe Repos
//----------------------------------------------------------

function getRepos(req, res, next) {
  res.send('I will get all you repos!');
}

module.exports = {
	getRepos: getRepos
};