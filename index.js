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
    	timeout: 30000,
    	sandbox: {
    		map: function(input) { return input; },
    		data: data,
    		__codeBlockCounter__: 0
    	}
	});
	if (!req.query.mapfcn) req.query.mapfcn = '';
	
	try {
		console.log(req.query);
		var rawresponse = vm.run(req.query.mapfcn + 'data.map(map);');
		res.send(JSON.stringify(rawresponse));
	} catch (e) {
		console.log(e);
		res.send(e.name);
	}
})

app.get('/map_combine', function (req, res) {
	var vm = new VM({
    	timeout: 30000,
    	sandbox: {
    		map: function(input) { return input; },
    		combine: function(acc, input) {return acc},
    		data: data,
    		__codeBlockCounter__: 0
    	}
	});
	
	if (!req.query.mapfcn) req.query.mapfcn = '';
	if (!req.query.combinefcn) req.query.combinefcn = '';

	try {
		console.log(req.query);
		var rawresponse = vm.run(req.query.mapfcn + " " + req.query.combinefcn + 'data.map(map).reduce(combine, {});');
		res.send(JSON.stringify(rawresponse));
	} catch (e) {
		console.log(e);
		res.send(e.name);
	}
})

app.listen(httpPort, function () {
  console.log('Listening on port ' + httpPort);
})
