var express = require('express');
var redis = require('redis');
var app = express();
var os = require('os');
var bodyParser = require('body-parser');


app.set('port', 3456);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var client = redis.createClient(6379, "redis");

var ifaces = os.networkInterfaces();
ip = ifaces['eth0'][0].address

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

