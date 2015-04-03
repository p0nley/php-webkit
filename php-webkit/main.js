var gui = require('nw.gui');
var win = gui.Window.get();
var http = require('http');
var fs = require('fs');
var php = require('../lib/bridge');
var express = require('express');
var app = express();
var os = require('os');
var os = os.platform();

process.on('uncaughtException', function(err){
  changeState('<strong>'+err+'</strong>', '#CD0000');
});

win.title = gui.App.manifest.name;

var bin = gui.App.manifest.phpwebkit.bin;
if(bin === undefined || bin == "") {
	if(os == 'win32' || os == 'win64') {
		bin = './bin/php/php-cgi.exe';
	} else if(os == 'darwin') {
		bin = './bin/php/php-cgi';
	} else if(os == 'linux') {
		bin = './bin/php/php-cgi';
	} else {
		bin = 'php-cgi';
	}
}

binExists(bin, function(filename){ 
	bin = filename;
});

var path = gui.App.manifest.phpwebkit.path;
if(path === undefined || path == "") {
	path = './application';
}

var host = gui.App.manifest.phpwebkit.host;
if(host === undefined || host == "") {
	host = '127.0.0.1';
}

var port = gui.App.manifest.phpwebkit.port;
if(port === undefined || port == "") {
	port = 0;
}

var phpinfo = {
	"path": path,
	"bin": bin,
	"host": host,
	"port": port,
	"arguments": gui.App.argv,
	"manifest": gui.App.manifest
};

var server = http.createServer(app);

app.use('/', php.cgi(phpinfo));

server.listen(port, host, function(){
	var url = 'http://'+host+':'+server.address().port+'/';
	changeState('Starting application...', '#00CD00');
	window.location = url;
}).on('error', function(e) {
	changeState('<strong>Error: '+e.message+'</strong>', '#CD0000');
});

function changeState(msg, color){
	$('body').css('background-color', color);
	$('#loading p').html(msg);
}

function binExists(file, callback){
	fs.stat(bin, function(err, stats) { 
		if(!err && stats.isFile()) { 
			return stats.filename;
		} else {
			return 'php-cgi';
		}
	});
}