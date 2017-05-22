var request = require('request');

var putOption = {
  url:"http://localhost:8500/v1/agent/service/register",
  json: { 
    "address": "nodejs4", 
    "id" : "nodejs4",   
    "Name": "web",  
    "Port": 3456, 
    "Tags": [
        "traefik.frontends.web.backend=backend1",
        "traefik.frontends.web.passHostHeader=true",
        "traefik.frontend.rule=PathPrefix:/",
        "traefik.backend.loadbalancer=wrr",
        "traefik.backends.web-backend.servers.server1.url=http://nodejs4:3456/",
        "traefik.backend.weight=1"
    ],
		"Check": {
			"Name": "web-check",
			"id": "nodej4-check",
			"HTTP": "http://nodejs4:3456",
			"Interval": "10s",
		},
  },
}

request.put(putOption, (err, res) => {console.log('callback damnit', err, res)});
