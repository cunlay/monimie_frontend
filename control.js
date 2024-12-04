var checkipod, playSound;

function auth_dialog_box(id, title, label)
	{		
		if(label == 'authcode'){
			var auth = 'au';
			var modal_content = '<div id="pop_'+id+'" title="'+title+'">';			
			modal_content += '<span id="auth_response"></span>';
			modal_content += '<div class="form-group">';
			modal_content += '<input name="'+label+'_input" autocomplete="off" id="'+label+'_input" maxlength="6" type="password" class="form-control dialog-input" placeholder="Enter Code">';
			modal_content += '</div><div class="form-group" id="'+id+'">';
			modal_content+= '<div class="dialog-btn"><div class="monimie-chat-buttons"><div class="dialog-btn"><div class="monimie-chat-buttons"><a class="monimie-buttons-options" onclick="Auth(\''+auth+'\')" id="'+auth+'init" vstate="0">AUTHORIZE</a></div></div></div></div></div></div>';
		}
		if(label == 'setauthcode'){
			var auth = 'setau';
			var modal_content = '<div id="pop2_'+id+'" title="'+title+'">';			
			modal_content += '<span id="auth_response"></span>';
			modal_content += '<div class="form-group">';
			modal_content += '<input name="'+label+'_input1" autocomplete="off" id="'+label+'_input1" maxlength="6" type="password" class="form-control dialog-input" placeholder="Enter Code"><br/><br/>';
			modal_content += '<input name="'+label+'_input2" autocomplete="off" id="'+label+'_input2" maxlength="6" type="password" class="form-control dialog-input" placeholder="Re-enter Code">';
			modal_content += '</div><div class="form-group" id="'+id+'">';
			modal_content+= '<div class="dialog-btn"><div class="monimie-chat-buttons"><div class="dialog-btn"><div class="monimie-chat-buttons"><a class="monimie-buttons-options" onclick="Auth(\''+auth+'\')" id="'+auth+'init" vstate="0">CREATE</a></div></div></div></div></div></div>';
		}		
		$('#model_details').html('');
		$('#model_details').html(modal_content);
		
	}

	$(document).on('click', '.authtap', function(){
		var actionid = $(this).data('actionid');
		var title = $(this).data('title');
		var label = $(this).data('label');
		if(title == 'Checkout'){
			$('#'+label).submit();
			return false;
		}
				
		auth_dialog_box(actionid, title, label);
		if(label == 'authcode'){
			var init = 'pop_'+actionid;
		}
		if(label == 'setauthcode'){
			var init = 'pop2_'+actionid;
		}
		$("#"+init).dialog({
			autoOpen:false,
			modal:true,
			width:400,
			show: {
				effect: "fade",
				duration: 1000
			},
			hide: {
				effect: "blind",
				duration: 500
			}			
		});
		$('#'+init).dialog('open');
		
		if(label == 'authcode'){
			$('#'+label+'_input').val('');
			$('#auth_response').html('');
		}
		if(label == 'setauthcode'){
			$('#'+label+'_input1').val('');
			$('#'+label+'_input2').val('');
			$('#auth_response').html('');
		}
	});



    function sendOption($val){
		var $messageForm = $('#monimie-msg-form');
		var $messageArea = $('#messageArea');
		var $message = $('#monimie-user-msg');
		$message.val($val);
		$messageForm.submit();
		$message.val('');	
		$message.focus();	
	}
	
	function clearChat(){
		var $cc = $('#cc');
		$cc.click();
	}
	
	function logOut(){
		var $lg = $('#lg');
		$lg.click();
	}
	
	function Auth(a){
	    var stat = $("#"+a+"init").attr("vstate");
		if(stat == "0"){
			var $lg = $('#'+a);
			$lg.click();
		}
	}
		
 
	$(function(){
		
		
		var socket = io.connect();
		var $messageForm = $('#monimie-msg-form');
		var $messageArea = $('#messageArea');
		var $message = $('#monimie-user-msg');
		var $chat = $('#monimie-chatwindow');
		var $lg = $('#lg');
		var $cc = $('#cc');
		var $au = $('#au');
		var $setau = $('#setau');		
		var $scroll = $('#scroller');
		var $checkipo = $("#checkipo").attr("state");		
		$(".monimie-menu-btn-wrapper-inner-right").removeClass("online");
		
		
		
		socket.on('connect', function(){
		    var sessionid = socket.id; 
			var sname = 'monimiesession';
			var cname = 'monimielocal';
			var cvalue = ranGen(20);
			var exdays = 30;
			
			if(cookieGet(cname)){
				var lid = cookieGet(cname);
				var sid = cookieGet(sname);
			}else{
				var lid = cvalue;
				var sid = sessionid;
				cookieSet(cname, cvalue, exdays);
				cookieSet(sname, sessionid, exdays);
			}
			
		    $.get("https://endopay.com/monimie/monimie_random.php?sessionid="+sid+lid,function(data){
				$("#ipo").attr("state", data);				
				socket.emit('get history', data);
				$('#checkipo').bind("click", checkipod());
				$('#checkipo').click();	
			});		  
		});	
		
		$au.click(function(e){
			if($('#auth_response')){
				e.preventDefault();
				$('#auth_response').html("");
				var $auth = $('#authcode_input');
                $('#auinit').attr('vstate', '1');	
				var $ipoval = $("#ipo").attr("state");
				var $ipo = "[ipoval]"+$ipoval;
				socket.emit('confirm auth', ($auth.val()+''+$ipo));
			}			
		});
		
		$setau.click(function(e){
			if($('#auth_response')){
				e.preventDefault();
				$('#auth_response').html("");
				var $setauth1 = $('#setauthcode_input1');
				var $setauth2 = $('#setauthcode_input2');
				if($setauth1.val() !== $setauth2.val()){
					$('#auth_response').html("Code does not match");
				}else if($setauth1.val().length !== 6){
					$('#auth_response').html("Code must be 6 digit");
				}else if($setauth2.val().length !== 6){
					$('#auth_response').html("Code must be 6 digit");
				}else{
					$('#setauinit').attr('vstate', '1');
					var $ipoval = $("#ipo").attr("state");
					var $ipo = "[ipoval]"+$ipoval;
					socket.emit('set auth', ($setauth2.val()+''+$ipo));
				}				
			}			
		});
		
		$messageForm.submit(function(e){
			e.preventDefault();
			if($.trim($message.val()) !== ''){			    
				var $ipoval = $("#ipo").attr("state");
				var $ipo = "[ipoval]"+$ipoval;
				socket.emit('send message', ($message.val()+''+$ipo));
				$message.val('');				
			}else{
				console.log('Value='+$message.val());
			}
		});
		
		$cc.click(function(e){
			e.preventDefault();
			var $ipoval = $("#ipo").attr("state");
			var $ipo = "[ipoval]"+$ipoval;
			socket.emit('clear chat', $ipo);
		});
		
		$lg.click(function(e){
			e.preventDefault();
			var $ipoval = $("#ipo").attr("state");
			var $ipo = "[ipoval]"+$ipoval;
			socket.emit('log out', $ipo);
		});		
		$('#sound').bind("click", playSound);
		socket.on('new message', function(data){
		    if(data.msg !== ''){			    
				$chat.append(data.msg);				
				if(data.opt){
					if($('#monimie-quickreply-wrapper')){
						$('#monimie-quickreply-wrapper').remove();
					}
					$messageArea.append(data.opt);
				}else if($('#monimie-quickreply-wrapper')){
					$('#monimie-quickreply-wrapper').remove();
				}
				var str = data.msg;
				var n = str.indexOf("chat-list-out");
				if(n == -1){				    
					$('#sound').click();
				}
											
			}else if(data.opt !== ''){
				if($('#monimie-quickreply-wrapper')){
					$('#monimie-quickreply-wrapper').remove();
				}
				$messageArea.append(data.opt);
				$('#sound').click();
			}
			$scroll.scrollTop ($scroll[0].scrollHeight - $scroll.height());
		});
		
		socket.on('new message2', function(data){
		    if(data.msg !== ''){
				var $ipoval = $("#ipo").attr("state");
				var $ipo = "[ipoval]"+$ipoval;
				socket.emit('save message', (data.msg+''+$ipo));				
			}else if(data.opt !== ''){
			    if($('#monimie-quickreply-wrapper')){
					$('#monimie-quickreply-wrapper').remove();
				}
				$messageArea.append(data.opt);
			}
			$scroll.scrollTop ($scroll[0].scrollHeight - $scroll.height());
		});
		
		socket.on('new message3', function(data){
		    if(data.msg !== ''){
				alert(data.msg);			
			}
			$scroll.scrollTop ($scroll[0].scrollHeight - $scroll.height());
		});
		
		socket.on('chat history', function(data){
		    if(data.his !== ''){
				$chat.html('');
				$chat.html(data.his);
                if(data.opt !== ''){
					if($('#monimie-quickreply-wrapper')){
						$('#monimie-quickreply-wrapper').remove();
					}
					$messageArea.append(data.opt);
				}				
				$scroll.scrollTop ($scroll[0].scrollHeight - $scroll.height());
			}else{
				$chat.html('');
			}
		});
		
		socket.on('cleared', function(data){
			$chat.html('');
			if($('#monimie-quickreply-wrapper')){
				$('#monimie-quickreply-wrapper').remove();
			}
		});
		
		socket.on('logged out', function(data){
		    $chat.html('');
			if($('#monimie-quickreply-wrapper')){
				$('#monimie-quickreply-wrapper').remove();
			}
		});
		
		socket.on('confirm authres', function(data){
		    if(data.msg == 'success'){
			    $('#auinit').attr('vstate', '0');		
				$('.ui-dialog-titlebar-close').click();
			}else{
			    $('#auinit').attr('vstate', '0');	
				$('#auth_response').html("Invalid Code");
			}
		});
		
		socket.on('set authres', function(data){
		    if(data.msg == 'success'){	
                $('#setauinit').attr('vstate', '0');				
				$('.ui-dialog-titlebar-close').click();
			}else{
			    $('#setauinit').attr('vstate', '0');
				$('#auth_response').html(data.msg);
			}
		});
		
		socket.on('status', function(data){
		    if(data.msg == 'socket'){
				$(".monimie-menu-btn-wrapper-inner-right").removeClass("online");
				alert('Socket Error');				
			}else if(data.msg == 'unknown'){
				$(".monimie-menu-btn-wrapper-inner-right").removeClass("online");
				alert('Unknown Error');								
			}
		});
				
		function playSound(){
		    
			var update_sound = new Audio();
			if(!!(update_sound.canPlayType && update_sound.canPlayType('folder/ogg; codecs="vorbis"').replace(/no/, '')))
			{
				update_sound.src = "https://monimie.com/folder/update.ogg";
			}
			else
			{ 
				if(!!(update_sound.canPlayType && update_sound.canPlayType('folder/mpeg;').replace(/no/, '')))
				{
					update_sound.src = "https://monimie.com/folder/update.mp3";	
				}
				else 
				{
					if(!!(update_sound.canPlayType && update_sound.canPlayType('folder/mp4; codecs="mp4a.40.2"').replace(/no/, '')))
					{
						update_sound.src = "https://monimie.com/folder/update.m4a";	
					}
					else
					{
						update_sound.src = "https://monimie.com/folder/update.wav";
					}
				}
			}
			update_sound.play();
		}
		
		function checkipod(){
			var r = $("#ipo").attr("state");
			$(".monimie-menu-btn-wrapper-inner-right").addClass("online");
		}
		
		function ranGen(len) {
			var string = "0123456789abcdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ";
			var parts = string.split('');
			for (var i = parts.length; i > 0;) {
				var random = parseInt(Math.random() * i);
				var temp = parts[--i];
				parts[i] = parts[random];
				parts[random] = temp;
			}
			var join = parts.join('');
			var vanity = join.substring(0, len);
			return vanity;
		}
		
		function cookieSet(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var expires = "expires="+d.toUTCString();
			document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		}

		function cookieGet(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}		
		
	});