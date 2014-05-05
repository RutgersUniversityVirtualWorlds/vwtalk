/**
 *  Initial code form here: https://github.com/Srirangan/express-bootstrap
 * Module dependencies.
 */
var express = require('express'), routes = require('./routes'), opentok = require('opentok');
var config = require('./config');
console.log('PORT: ' + config.port + ' HOST: ' + config.host);
var app = express();
// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
//world data
var worlds = {};
worlds['red']={};
worlds['red'].name = 'negotiation';
worlds['red'].roomCount = 3;
worlds['red'].roomNames = [];
worlds['red'].roomNames[0] = 'union';
worlds['red'].roomNames[1] = 'management';
worlds['red'].roomNames[2] = 'middle';
//OpenTOk Config
var location = config.opentok.location;
var opentokAPP = new opentok.OpenTokSDK(config.opentok.key, config.opentok.secret);
var tokens = {};
var sessions = {};
var ii;
for (ii = 0; ii < worlds['red'].roomCount; ii++) {
  var session = {};
  session.sessionName = worlds['red'].roomNames[ii];
  session.sessionId = 'NOT';
  session.token = '';
  sessions[worlds['red'].roomNames[ii]] = session;
}
for (var key in sessions) {
  console.log('key: ' + key);
  opentokAPP.createSession(location, { 'p2p.preference': 'disabled' }, function(aKey) {
    return function(result) {
      sessions[aKey.toString()].sessionId = result;
      console.log('sessions[' + aKey.toString() + '].sessionId: ', sessions[aKey].sessionId);
    };
  }(key));
}
worlds['red'].sessions=sessions;
worlds['blue']={};
worlds['blue'].name = 'negotiation';
worlds['blue'].roomCount = 3;
worlds['blue'].roomNames = [];
worlds['blue'].roomNames[0] = 'union';
worlds['blue'].roomNames[1] = 'management';
worlds['blue'].roomNames[2] = 'middle';
//OpenTOk Config
var location = config.opentok.location;
var bluetokens = {};
var bluesessions = {};
var ii;
for (ii = 0; ii < worlds['blue'].roomCount; ii++) {
  var session = {};
  session.sessionName = worlds['blue'].roomNames[ii];
  session.sessionId = 'NOT';
  session.token = '';
  bluesessions[worlds['blue'].roomNames[ii]] = session;
}
for (var key in sessions) {
  console.log('key: ' + key);
  opentokAPP.createSession(location, { 'p2p.preference': 'disabled' }, function(aKey) {
    return function(result) {
      bluesessions[aKey.toString()].sessionId = result;
      console.log('sessions[' + aKey.toString() + '].sessionId: ', sessions[aKey].sessionId);
    };
  }(key));
}
worlds['blue'].sessions=bluesessions;
worlds['green']={};
worlds['green'].name = 'negotiation';
worlds['green'].roomCount = 3;
worlds['green'].roomNames = [];
worlds['green'].roomNames[0] = 'union';
worlds['green'].roomNames[1] = 'management';
worlds['green'].roomNames[2] = 'middle';
//OpenTOk Config
var location = config.opentok.location;
var greentokens = {};
var greensessions = {};
var ii;
for (ii = 0; ii < worlds['green'].roomCount; ii++) {
  var session = {};
  session.sessionName = worlds['green'].roomNames[ii];
  session.sessionId = 'NOT';
  session.token = '';
  greensessions[worlds['green'].roomNames[ii]] = session;
}
for (var key in sessions) {
  console.log('key: ' + key);
  opentokAPP.createSession(location, { 'p2p.preference': 'disabled' }, function(aKey) {
    return function(result) {
      greensessions[aKey.toString()].sessionId = result;
      console.log('sessions[' + aKey.toString() + '].sessionId: ', sessions[aKey].sessionId);
    };
  }(key));
}
worlds['green'].sessions=greensessions;
worlds['yellow']={};
worlds['yellow'].name = 'negotiation';
worlds['yellow'].roomCount = 3;
worlds['yellow'].roomNames = [];
worlds['yellow'].roomNames[0] = 'union';
worlds['yellow'].roomNames[1] = 'management';
worlds['yellow'].roomNames[2] = 'middle';
//OpenTOk Config
var location = config.opentok.location;
var yellowtokens = {};
var yellowsessions = {};
var ii;
for (ii = 0; ii < worlds['yellow'].roomCount; ii++) {
  var session = {};
  session.sessionName = worlds['yellow'].roomNames[ii];
  session.sessionId = 'NOT';
  session.token = '';
  yellowsessions[worlds['yellow'].roomNames[ii]] = session;
}
for (var key in sessions) {
  console.log('key: ' + key);
  opentokAPP.createSession(location, { 'p2p.preference': 'disabled' }, function(aKey) {
    return function(result) {
      yellowsessions[aKey.toString()].sessionId = result;
      console.log('sessions[' + aKey.toString() + '].sessionId: ', sessions[aKey].sessionId);
    };
  }(key));
}
worlds['yellow'].sessions=yellowsessions;
app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  app.use(express.errorHandler());
});
// Routes
app.get('/', function(req, res) {
  res.redirect('/Negotiation');
  console.log('Sessions: %j', sessions);
  res.render('index', {
    title: 'OpenTok Test',
    sessions: sessions
  });
});
app.get('/support', routes.support);
app.get('/api/:world/:user/:room', function(req, res) {
  //This selects the world, the user, and starter room
  var data = {};
  data.user = req.params.user;
  data.sessionName = req.params.room;
  data.apikey = config.opentok.key;
  var sessions = worlds[req.params.world].sessions;
  //data.sessionId = sessions[session.sessionName].sessionId;
  //loop sessions
  for (var key in sessions) {
    var token = opentokAPP.generateToken({
        session_id: sessions[key].sessionId,
        role: opentok.RoleConstants.PUBLISHER,
        connection_data: 'userId:' + req.params.user
      });
    tokens[key] = token;
    sessions[key].token = token;  // console.log("token: ",sessions[key].token );
  }
  data.tokens = tokens;
  data.sessions = sessions;
  console.log('data: %j', data);
  res.json(data);
});
app.listen(config.port, function() {
  console.log('opentok app running: ' + config.port);
});
