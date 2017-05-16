var express = require('express');
var redis = require('redis');
var app = express();
var os = require('os');

app.set('port', 3456);

var client = redis.createClient(6379, "redis");

var ifaces = os.networkInterfaces();
console.log(ifaces)
ip = ifaces['eth0'][0].address

console.log(ip)

client.on('error', function (err) {
    console.log('Error ' + err);
});

app.get('/api/:username', function(req, res) {
  // get the username parameter in the URL
  // i.e.: username = "coligo-io" in http://localhost:5000/api/coligo-io
  var username = req.params.username;

  // use the redis client to get the total number of stars associated to that
  // username from our redis cache
  client.get(username, function(error, result) {
    // the result exists in our cache - return it to our user immediately
    res.send({ 'username': username, 'hello': 'it seems to work', 'hostname':os.hostname(), 'ip': ip});
  });
});

app.get('/', function(req, res) {
  // get the username parameter in the URL
  // i.e.: username = "coligo-io" in http://localhost:5000/api/coligo-io

  // use the redis client to get the total number of stars associated to that
  // username from our redis cache
  client.get(function(error, result) {
    // the result exists in our cache - return it to our user immediately
    console.log("ici");
    res.send({'root': true,'hostname': os.hostname(), 'ip': ip});
  });
});

app.get('/test', function(req, res) {
  // get the username parameter in the URL
  // i.e.: username = "coligo-io" in http://localhost:5000/api/coligo-io

  // use the redis client to get the total number of stars associated to that
  // username from our redis cache
  client.get(function(error, result) {
    // the result exists in our cache - return it to our user immediately
    res.send({'test':true,'hostname': os.hostname(), 'ip': ip});
  });
});
app.get('/whoami', function(req, res) {
  // get the username parameter in the URL
  // i.e.: username = "coligo-io" in http://localhost:5000/api/coligo-io

  // use the redis client to get the total number of stars associated to that
  // username from our redis cache
  client.get(function(error, result) {
    // the result exists in our cache - return it to our user immediately
    res.send({'hostname': os.hostname(), 'ip': ip});
  });
});

var server = app.listen(app.get('port'), function(){
  console.log('Server listening on port: ', app.get('port'), ' hostname is ', os.hostname(), ' ip ', ip);
});


// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function() {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(function() {
    console.log("Closed out remaining connections.");
    process.exit()
  });
  
   // if after 
   setTimeout(function() {
       console.error("Could not close connections in time, forcefully shutting down");
       process.exit()
  }, 10*1000);
}

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);   

