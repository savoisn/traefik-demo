var request = require('request');

var putOption = {
  url:"http://172.21.0.8:3456/api/test-put",
  json:{
    username: 'nico',
    gender: 'hybrid',
    cyborg: true,
    human: true,
  },
}

var putOptionConsul = {
  url:"http://172.21.0.8:3456/api/test-put",
  json:{
    username: 'nico',
    gender: 'hybrid',
    cyborg: true,
    human: true,
  },
}
request.put(putOption, (err, res) => {console.log('callback damnit', err, res)});
