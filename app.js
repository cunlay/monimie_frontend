//how to render a php file on a node.js server
//https://www.youtube.com/watch?v=WqeLl4Luhdk

var express = require('express'),
	app = express(),
	fs = require('fs'),
	httpserver = require('http').createServer(app),
	io = require('socket.io').listen(httpserver),
	localStorage = require('node-persist'),
	ipo,
	connections = [];
	
httpserver.listen(process.env.PORT || 2005);

var storage = {
	dir : "myData",
	ttl : false
}


function checkResponse(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_response.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});	
}

function saveChat(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_save.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});		
}

function getChat(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_retrieve.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});		
}

function confirmCode(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_auth_confirm.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});		
}

function setauthCode(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_auth_set.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});		
}

function clearChat(query, fn)
{
	var request = require("request");
	var myJSONObject = {q: query};
	var myURL = "https://endopay.com/monimie/monimie_delete.php";
	
	request({
		url: myURL,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
			fn(body);
		}
	});		
}

	
app.get('/', function(req, res){
	res.sendFile(__dirname + '/monimie.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	
	var sock = socket.id;	
	socket.on('disconnect', function(data)
	{
		connections.splice(connections.indexOf(socket), 1);
	});

	socket.on('send message', function(data)
	{
		
		var init = data.split("[ipoval]");
		var data = init[0];
		var session = init[1];
		
		var currentdate = new Date(); 
		var hours = currentdate.getHours();
		var mins = currentdate.getMinutes();
		var secs = currentdate.getSeconds();
		
		if(hours.toString().length === 1){
			hours = '0'+hours;
		}			
		if(mins.toString().length === 1){
			mins = '0'+mins;
		}			
		if(secs.toString().length === 1){
			secs = '0'+secs;
		}
		var datetime = hours+":"+mins+":"+secs;
		
		var user = '<li class="monimie-chat-list-out"><div class="monimie-chat-time"><span class="Time">'+datetime+'</span></div><div class="monimie-chat-text-out">'+data+'</div></li>';
		io.sockets.connected[socket.id].emit('new message', {msg: user});
		var query = data;
		
		var currentdate = new Date(); 
		var hours = currentdate.getHours();
		var mins = currentdate.getMinutes();
		var secs = currentdate.getSeconds();
		
		if(hours.toString().length === 1){
			hours = '0'+hours;
		}			
		if(mins.toString().length === 1){
			mins = '0'+mins;
		}			
		if(secs.toString().length === 1){
			secs = '0'+secs;
		}
		var datetime = hours+":"+mins+":"+secs;
				
		query += '[monimie_socket]'+session+'[monimie_time]'+datetime;
		
		checkResponse(query, function(response){
			
			if(response == '﻿ChatCleared'){
				io.sockets.connected[socket.id].emit('clear chat', {msg: ''});
				return false;
			}
			
			if(response && response.indexOf("[Save]") != -1) {				
				if(response.indexOf("[Options]") != -1) {
					var storage = response.split("[Options]");
					storage[0] = storage[0].trim();
					storage[1] = storage[1].trim();				
					response = storage[0]+'[Options]'+storage[1];
					response = response.trim();
				}
				var storage = response.split("[Save]");
				storage[0] = storage[0].trim();
				storage[1] = storage[1].trim();
				var Botsave = storage[0]+'[monimie_stored]'+storage[1];
				Botsave = Botsave.trim();
			}	
			
			if(response !== undefined){
				var storage = response.split("[Save]");
			
				if(storage[1]){		    
					response = storage[0];
				}
				
				var explode = response.split("[Options]");
				
				var Replies = explode[0];
				var Options = explode[1];
				var Opt = '';
				var Bot = '';
				
				if(Options && Options !== ''){
					var explodeOptions = Options.split("|");
					var explodeOptionsCount = explodeOptions.length;
					var newOption = '<div class="monimie-quickreply-wrapper smooth-scroll" id="monimie-quickreply-wrapper" align="center">';
					for(i=0; i<explodeOptionsCount; i++){
						newOption += '<div class="monimie-quickreply-options" onclick="sendOption(\''+explodeOptions[i]+'\')">'+explodeOptions[i]+'</div>';
					}
					newOption += '</div>';
					Opt += newOption;
				}			
				if(Replies && Replies !== ''){
					var explodeReplies = Replies.split("|");
					var explodeRepliesCount = explodeReplies.length;
					var newReply = "";
					for(i=0; i<explodeRepliesCount; i++){					
						newReply += '<li class="monimie-chat-list-in"><div class="monimie-chat-time"><span class="Time">'+datetime+'</span></div><div class="monimie-chat-text-in">'+explodeReplies[i]+'</div></li>';
					}
					Bot += newReply;
				}
			}
			
			if(response == undefined){
				io.sockets.connected[socket.id].emit('new message', {msg: ''});
			}else{				
				if(Opt == ''){				
					io.sockets.connected[socket.id].emit('new message', {msg: Bot});	
					io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});					
				}else{
					io.sockets.connected[socket.id].emit('new message', {msg: Bot, opt: Opt});
					io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});					
				}
			}
			
		});		
		
	});
	
	socket.on('set auth', function(data)
	{
		var query = "";
		var session = "";
		var init = data.split("[ipoval]");
		var data = init[0];
		session = init[1];
		query = session+"[monimie_socket]"+data;		
		
		if(session !== ""){
			setauthCode(query, function(res){
				if(res == 'success'){
					var que = "";					
					var currentdate = new Date(); 
					var hours = currentdate.getHours();
					var mins = currentdate.getMinutes();
					var secs = currentdate.getSeconds();
					
					if(hours.toString().length === 1){
						hours = '0'+hours;
					}			
					if(mins.toString().length === 1){
						mins = '0'+mins;
					}			
					if(secs.toString().length === 1){
						secs = '0'+secs;
					}
					var datetime = hours+":"+mins+":"+secs;
					que += '[monimie_socket]'+session+'[monimie_time]'+datetime;
					
					checkResponse(que, function(response){	

						if(response && response.indexOf("[Save]") != -1) {				
							if(response.indexOf("[Options]") != -1) {
								var storage = response.split("[Options]");
								storage[0] = storage[0].trim();
								storage[1] = storage[1].trim();				
								response = storage[0]+'[Options]'+storage[1];
								response = response.trim();
							}
							var storage = response.split("[Save]");
							storage[0] = storage[0].trim();
							storage[1] = storage[1].trim();
							var Botsave = storage[0]+'[monimie_stored]'+storage[1];
							Botsave = Botsave.trim();
						}
						
						if(response !== undefined){				
							var storage = response.split("[Save]");					
						
							if(storage[1]){
								response = storage[0];
							}
							
							var explode = response.split("[Options]");
							
							var Replies = explode[0];
							var Options = explode[1];
							var Opt = '';
							var Bot = '';
							
							if(Options && Options !== ''){
								var explodeOptions = Options.split("|");
								var explodeOptionsCount = explodeOptions.length;
								var newOption = '<div class="monimie-quickreply-wrapper smooth-scroll" id="monimie-quickreply-wrapper" align="center">';
								for(i=0; i<explodeOptionsCount; i++){
									newOption += '<div class="monimie-quickreply-options" onclick="sendOption(\''+explodeOptions[i]+'\')">'+explodeOptions[i]+'</div>';
								}
								newOption += '</div>';
								Opt += newOption;
							}			
							if(Replies && Replies !== ''){
								var explodeReplies = Replies.split("|");
								var explodeRepliesCount = explodeReplies.length;
								var newReply = "";
								for(i=0; i<explodeRepliesCount; i++){
									newReply += '<li class="monimie-chat-list-in"><div class="monimie-chat-time"><span class="Time">'+datetime+'</span></div><div class="monimie-chat-text-in">'+explodeReplies[i]+'</div></li>';
								}
								Bot += newReply;
							}							
						}else{
							io.sockets.connected[socket.id].emit('set authres', {msg: ''});
						}
						
						if(response == undefined){
							io.sockets.connected[socket.id].emit('set authres', {msg: res});
							io.sockets.connected[socket.id].emit('new message', {msg: ''});
						}else{
							if(Opt == ''){
								io.sockets.connected[socket.id].emit('set authres', {msg: res});
								io.sockets.connected[socket.id].emit('new message', {msg: Bot});
								io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});
							}else{
								io.sockets.connected[socket.id].emit('set authres', {msg: res});
								io.sockets.connected[socket.id].emit('new message', {msg: Bot, opt: Opt});
								io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});
							}				
						}
						
					});					
					
					
				}else{
					io.sockets.connected[socket.id].emit('set authres', {msg: res});
				}
			});	
		}else{
			io.sockets.connected[socket.id].emit('set authres', {msg: ''});
		}
		
	});
	
	socket.on('confirm auth', function(data)
	{
		var query = "";
		var session = "";
		var init = data.split("[ipoval]");
		var data = init[0];
		session = init[1];
		query = session+"[monimie_socket]"+data;
		
		if(session !== ""){
			confirmCode(query, function(resp){				
				if(resp == 'success'){
					var que = "CheckDone";
					var currentdate = new Date(); 
					var hours = currentdate.getHours();
					var mins = currentdate.getMinutes();
					var secs = currentdate.getSeconds();
					
					if(hours.toString().length === 1){
						hours = '0'+hours;
					}			
					if(mins.toString().length === 1){
						mins = '0'+mins;
					}			
					if(secs.toString().length === 1){
						secs = '0'+secs;
					}
					var datetime = hours+":"+mins+":"+secs;
					que += '[monimie_socket]'+session+'[monimie_time]'+datetime;				
					
					checkResponse(que, function(response){
						
					    if(response && response.indexOf("[Save]") != -1) {				
							if(response.indexOf("[Options]") != -1) {
								var storage = response.split("[Options]");
								storage[0] = storage[0].trim();
								storage[1] = storage[1].trim();				
								response = storage[0]+'[Options]'+storage[1];
								response = response.trim();
							}
							var storage = response.split("[Save]");
							storage[0] = storage[0].trim();
							storage[1] = storage[1].trim();
							var Botsave = storage[0]+'[monimie_stored]'+storage[1];
							Botsave = Botsave.trim();
						}	
					
					
						if(response !== undefined){		
						
							var storage = response.split("[Save]");					
						
							if(storage[1]){		
								response = storage[0];
							}
							
							var explode = response.split("[Options]");
							
							var Replies = explode[0];
							var Options = explode[1];
							var Opt = '';
							var Bot = '';
							
							if(Options && Options !== ''){
								var explodeOptions = Options.split("|");
								var explodeOptionsCount = explodeOptions.length;
								var newOption = '<div class="monimie-quickreply-wrapper smooth-scroll" id="monimie-quickreply-wrapper" align="center">';
								for(i=0; i<explodeOptionsCount; i++){
									newOption += '<div class="monimie-quickreply-options" onclick="sendOption(\''+explodeOptions[i]+'\')">'+explodeOptions[i]+'</div>';
								}
								newOption += '</div>';
								Opt += newOption;
							}			
							if(Replies && Replies !== ''){
								var explodeReplies = Replies.split("|");
								var explodeRepliesCount = explodeReplies.length;
								var newReply = "";
								for(i=0; i<explodeRepliesCount; i++){
									newReply += '<li class="monimie-chat-list-in"><div class="monimie-chat-time"><span class="Time">'+datetime+'</span></div><div class="monimie-chat-text-in">'+explodeReplies[i]+'</div></li>';
								}
								Bot += newReply;
							}							
						}else{
							io.sockets.connected[socket.id].emit('confirm authres', {msg: ''});
						}
						
						if(response == undefined){
							io.sockets.connected[socket.id].emit('confirm authres', {msg: resp});
							io.sockets.connected[socket.id].emit('new message', {msg: ''});
						}else{
							if(Opt == ''){
								io.sockets.connected[socket.id].emit('confirm authres', {msg: resp});
								io.sockets.connected[socket.id].emit('new message', {msg: Bot});
								io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});
							}else{
								io.sockets.connected[socket.id].emit('confirm authres', {msg: resp});
								io.sockets.connected[socket.id].emit('new message', {msg: Bot, opt: Opt});
								io.sockets.connected[socket.id].emit('new message2', {msg: Botsave});
							}				
						}
						
					});					
					
					
				}else{
					io.sockets.connected[socket.id].emit('confirm authres', {msg: ''});
				}
			});
		}else{
			io.sockets.connected[socket.id].emit('confirm authres', {msg: ''});
		}
		
	});

	socket.on('log out', function(data)
	{
		var query = "";
		var session = "";
		var init = data.split("[ipoval]");
		var data = init[0];
		session = init[1];
		query = session+"[monimie_socket]exit";		
		
		if(session !== ""){			
			clearChat(query, function(response){
				if(response == 'success'){
					io.sockets.connected[socket.id].emit('logged out', {msg: ''});					
				}else{
					io.sockets.connected[socket.id].emit('logged out', {msg: ''});
				}
			});
		}else{
			io.sockets.connected[socket.id].emit('logged out', {msg: ''});
		}
	});
	
	socket.on('clear chat', function(data)
	{
		var query = "";
		var session = "";
		var init = data.split("[ipoval]");
		var data = init[0];
		session = init[1];
		query = session+"[monimie_socket]clear";
		
		if(session !== ""){	
			clearChat(query, function(response){				
				if(response == 'success'){
					io.sockets.connected[socket.id].emit('cleared', {msg: ''});
				}else{
					io.sockets.connected[socket.id].emit('cleared', {msg: ''});
				}
			});
		}else{
			io.sockets.connected[socket.id].emit('cleared', {msg: ''});
		}
	});
	
	socket.on('save message', function(data)
	{
		var query = "";
		var session = "";
		var currentdate = new Date(); 
		var hours = currentdate.getHours();
		var mins = currentdate.getMinutes();
		var secs = currentdate.getSeconds();
		
		if(hours.toString().length === 1){
			hours = '0'+hours;
		}			
		if(mins.toString().length === 1){
			mins = '0'+mins;
		}			
		if(secs.toString().length === 1){
			secs = '0'+secs;
		}
		var datetime = hours+":"+mins+":"+secs;
		
		
		var init = data.split("[ipoval]");
		var data = init[0];
		session = init[1];
		query = session+"[monimie_socket]"+data+"[monimie_time]"+datetime;
		
		
		if(session !== ""){
			saveChat(query, function(response){				
				if(response == 'success'){
					
				}else{
					io.sockets.connected[socket.id].emit('new message3', {msg: "Error: Unable to save chat"});
				}
			});
		}
	});
	
	socket.on('get history', function(data)
	{		
		var q = "";
		var s = data;
		q = s+"[monimie_socket]";
		getChat(q, function(response){
			if(response && response.indexOf("[Opts]") != -1) {
				var storage = response.split("[Opts]");
				response = storage[0];
				opt = storage[1];
				io.sockets.connected[socket.id].emit('chat history', {his: response, opt: opt});
			}else if(response == ''){
				io.sockets.connected[socket.id].emit('chat history', {his: ''});
			}else if(response != ''){
				io.sockets.connected[socket.id].emit('chat history', {his: response});
			}else if(response == 'Empty Socket'){
				io.sockets.connected[socket.id].emit('status', {msg: 'socket'});
			}else{
				io.sockets.connected[socket.id].emit('status', {msg: 'unknown'});
			}
		});		
	});	
});
