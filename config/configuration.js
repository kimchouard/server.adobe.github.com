// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 5000;
}

var server = {
	name: 'server.adobe.github.com'
};

function crossOrigin(req,res,next){
  var oneof = false;
  if(req.headers.origin) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      oneof = true;
  }
  if(req.headers['access-control-request-method']) {
      res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
      oneof = true;
  }
  if(req.headers['access-control-request-headers']) {
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
      oneof = true;
  }
  if(oneof) {
      res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }

  next();
}

var dir = __dirname;
dir = dir.substring(0, dir.length - 6);

// in minutes
var defFreqReload = 15;

// main http error display function
function errorLog(url, res, err) {
  console.log('error for ', url, ' : ', res.statusCode, ' : ', res.body, ' : ', err, ',', (new Date()).toString());
};

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  user: process.env.GHUSER,
  pass: process.env.GHPASS,
  crossOrigin: crossOrigin,
  dir: dir,
  errorLog: errorLog,
  freqReload: process.env.GHFREQRELOAD || defFreqReload,
  server: server
};