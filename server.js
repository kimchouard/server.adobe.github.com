'use strict';

console.log('action, details, time');

var config = require('./config/configuration.js');
if (config.env == 'production') {
	console.log('started_nr, NewRelic, ');
	require('newrelic');
}

var controllers = require('./lib/server-adobe-github/controllers.js');
var restify = require('restify');

//DEBUG
// actions.getRepos('adobe');

//----------------------------------------------------------
//					Pull Adobe Repos
//----------------------------------------------------------

var server = module.exports.server = restify.createServer(config.server);

//----------------------------------------------------------
//					Server creation / routing
//----------------------------------------------------------

server.use(config.crossOrigin);

server.get('/', controllers.rootController);
server.opts('.*', function(req, res) { res.send(200); });

try {
  server.listen(config.port, function() {
  	var d = new Date();
    console.log('started_serv,', server.name, ' : ', server.url, ',', (new Date()).toString());

	if (config.user && config.pass) {
    console.log('config_user,',config.user, ',', (new Date()).toString());
	} else {
		console.log('config_no_user, "Warning! No user configured",', (new Date()).toString());
	}
  });
}
catch(err) {
  console.error('error,', err.message, ' Call: ', err.syscall, ',', (new Date()).toString());
  process.exit(1);
};

// Expose the server
module.exports = server;