const cors = require('cors'); 
const fs = require('fs');
const express = require('express');
const {VM} = require('vm2');

const app = express();
app.use(cors());

//configure ports, automatically choosing between the Heroku port and development port
var httpPort = Number(process.env.PORT || 3000);
var bookDir = process.env.BOOKDIR || '1';

var dir = "public/" + bookDir + "/";
var files = fs.readdirSync(dir);

var data = []
for (var i=0; i<files.length; i++) {
	if (files[i].startsWith(".")) 
		continue;

	var content = fs.readFileSync(dir + files[i], 'utf8');
	data.push(content);
}

app.get('/', function (req, res) {
	res.send(JSON.stringify(data, null, 2));
})

app.get('/map', function (req, res) {
	var vm = new VM({
    	timeout: 1000,
    	sandbox: {
    		map: function(input) { return input; },
    		data: data
    	}
	});
	if (!req.query.fcn) req.query.fcn = '';

	try {
		var rawresponse = vm.run(req.query.fcn + 'data.map(map);');
		res.send(JSON.stringify(rawresponse));
	} catch (e) {
		res.send(e.name);
	}
})

app.listen(httpPort, function () {
  console.log('Listening on port ' + httpPort);
})
