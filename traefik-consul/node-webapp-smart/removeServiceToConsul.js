var request = require('request');

var putOption = {
  url:"http://localhost:8500/v1/agent/service/deregister/nodejs4"
}

request.put(putOption, (err, res) => {console.log('callback damnit', err, res)});
