'use strict';

var config = require('./config/configuration.js');
var actions = require('./lib/actions.js');
var restify = require('restify');


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

server.get('/', actions.getRepos);

server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

// Expose the server
module.exports = server;