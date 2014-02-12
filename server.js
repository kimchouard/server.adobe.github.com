'use strict';

require('newrelic');
var config = require('./config/configuration.js');
var controllers = require('./lib/server-adobe-github/controllers.js');
var restify = require('restify');

//DEBUG
// actions.getRepos('adobe');

//----------------------------------------------------------
//					Pull Adobe Repos
//----------------------------------------------------------

if (config.env == 'production') {
  require('newrelic');
}

var server = module.exports.server = restify.createServer(config.server);

//----------------------------------------------------------
//					Server creation / routing
//----------------------------------------------------------

server.use(config.crossOrigin);

server.get('/', controllers.rootController);
server.opts('.*', function(req, res) { res.send(200); });

try {
  server.listen(config.port, function() {
    console.log('%s listening at %s', server.name, server.url);
    console.log('User github: '+config.user);
  });
}
catch(err) {
  console.error("Error: [%s] Call: [%s]", err.message, err.syscall);
  process.exit(1);
};

// Expose the server
module.exports = server;