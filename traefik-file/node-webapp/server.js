var express = require('express');
var redis = require('redis');
var app = express();
var os = require('os');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var fs = require('fs');

var port = 3456
var httpsPort = 4567

app.set('port', port);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var client = redis.createClient(6379, "redis");

var ifaces = os.networkInterfaces();
console.log(ifaces);
var ip = null;

if (ifaces['eth0']) {
  var ip = ifaces['eth0'][0].address;
}

if (ifaces['wlp4s0']){
  var ip = ifaces['wlp4s0'][0].address;
}


console.log(ip)

client.on('error', function (err) {
    console.log('Error ' + err);
});

app.put('/api/test-put', function(req, res){
  console.log(req.body);
  res.send({status: 'ok'});
});

app.get('/api/:username', function(req, res) {
  var username = req.params.username;
  client.get(username, function(error, result) {
    res.send({ 'username': username, 'hello': 'it seems to work', 'hostname':os.hostname(), 'ip': ip, 'protocol': req.protocol});
  });
});

app.get('/', function(req, res) {
  res.send({'root': true,'hostname': os.hostname(), 'ip': ip, 'protocol': req.protocol});
});

app.get('/test', function(req, res) {
  res.send({'root': true,'hostname': os.hostname(), 'ip': ip, 'protocol': req.protocol});
});
app.get('/whoami', function(req, res) {
  res.send({'root': true,'hostname': os.hostname(), 'ip': ip, 'protocol': req.protocol});
});

var httpServer = http.createServer(app);

httpServer.listen(port, function(){
  console.log('Server listening on port: ', port, ' hostname is ', os.hostname(), ' ip ', ip);
});


var privateKey  = fs.readFileSync('cert/domain.key', 'utf8');
var certificate = fs.readFileSync('cert/domain.csr', 'utf8');

var credentials = {key: privateKey, cert: certificate};


var httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, function(){
  console.log('Server listening on port: ', httpsPort, ' hostname is ', os.hostname(), ' ip ', ip);
});
//var server = app.listen(app.get('port'), function(){
  //console.log('Server listening on port: ', app.get('port'), ' hostname is ', os.hostname(), ' ip ', ip);
//});


// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function() {
  console.log("Received kill signal, shutting down gracefully.");
  httpServer.close(function() {
    console.log("Closed out remaining connections.");
    process.exit()
  });
  
  httpsServer.close(function() {
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

