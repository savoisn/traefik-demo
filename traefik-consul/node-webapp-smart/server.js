var express = require('express');
var redis = require('redis');
var app = express();
var os = require('os');
var request = require('request');

app.set('port', 3456);

var client = redis.createClient(6379, "redis");

var ifaces = os.networkInterfaces();
ip = ifaces['eth0'][0].address
console.log(ip)

var consul_hostname = process.env['CONSUL_CLIENT_HOSTNAME'];

console.log(consul_hostname);

var registerOption = {
  url:"http://consul4:8500/v1/agent/service/register",
  json: { 
    "address": os.hostname(),
    "id" : os.hostname(),
    "Name": "web",
    "Port": 3456,
    "Tags": [
        "traefik.frontends.web.backend=backend1",
        "traefik.frontends.web.passHostHeader=true",
        "traefik.frontend.rule=PathPrefix:/",
        "traefik.backend.loadbalancer=wrr",
        "traefik.backends.web-backend.servers.server1.url=http://"+os.hostname()+":3456/",
        "traefik.backend.weight=1"
    ],
		"Check": {
			"Name": os.hostname()+"-check",
			"id": os.hostname()+"-check",
			"HTTP": "http://"+os.hostname()+":3456/",
			"Interval": "10s",
		}
  }
}

var deRegisterOption = {
  url:"http://consul4:8500/v1/agent/service/deregister/"+os.hostname()
}

request.put(registerOption, (err, res) => {console.log('service registered', err)});

client.on('error', function (err) {
    console.log('Error ' + err);
});

app.get('/api/:username', function(req, res) {
  var username = req.params.username;
  client.get(username, function(error, result) {
    res.send({ 'username': username, 'hello': 'it seems to work', 'hostname':os.hostname(), 'ip': ip});
  });
});

app.get('/', function(req, res) {
  client.get(function(error, result) {
    console.log("ici");
    res.send({'root': true,'hostname': os.hostname(), 'ip': ip});
  });
});

app.get('/test', function(req, res) {
  client.get(function(error, result) {
    res.send({'test':true,'hostname': os.hostname(), 'ip': ip});
  });
});
app.get('/whoami', function(req, res) {
  client.get(function(error, result) {
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
  request.put(deRegisterOption, (err, res) => {
		console.log('service deRegistered', err);
		server.close(function() {
			console.log("Closed out remaining connections.");
			process.exit()
		});
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

