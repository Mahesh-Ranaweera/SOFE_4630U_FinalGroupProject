var db = firebase.database();
var curUser = null;
var names = {};

firebase.auth().onAuthStateChanged(function(user){
	if(user){
		curUser = user;
		$(document).ready(getChatNames);
	}
	else console.log('Not logged in.')
})

function copyCode(){
	var code = document.getElementById('roomCode');
    code.select();
    document.execCommand("copy");
}

function getChatNames(){
	let roomCode = $('#roomCode').val();
	db.ref('chat_groups/' + roomCode + '/creator').once('value', function(data){
		var cid = data.val();
		db.ref('users/' + cid + '/name').once('value', function(cdata){
			names[cid] = cdata.val();
		});
	});
	db.ref('chat_groups/' + roomCode + '/members').once('value', function(data){
		data.forEach(function(member){
			db.ref('users/' + member.val() + '/name').once('value', function(name){
				names[member.val()] = name.val();
			})
		})
		initializeChatRoom();
	});
}

function initializeChatRoom(){
	let roomCode = $('#roomCode').val();
	
	db.ref('chat_groups/' + roomCode + '/name').once('value', function(snap){
		$('#chatTitle').html(snap.val());
	});

	db.ref('chat_groups/' + roomCode + '/messages').on('child_added', function(data){
		let message = $(document.createElement('div')).addClass('messageContainer');
		let messageHead = $(document.createElement('div')).addClass('messageHead');
		let messageBody = $(document.createElement('div')).addClass('messageBody');

		let dt = new Date(data.val().postTime*1000);
		messageHead.append(names[data.val().user] + ' [' + dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString() + ']');
		
		messageBody.append(data.val().text);
		
		message.append(messageHead);
		message.append(messageBody);
		$('#chatLog').append(message);
		
		updateScroll();
	});
}

function sendMsg(){
	let msg = $('#chatmsg').val();
	if(msg != '' && msg != null){
		let roomCode = $('#roomCode').val();
		let dt = Math.round(new Date().getTime()/1000.0);
		db.ref('chat_groups/' + roomCode + '/messages').push({
			user: curUser.uid,
			text: msg,
			postTime: dt
		})
		$('#chatmsg').val('');
	}
}

$('#chatmsg').on('keydown', function(e){
	switch(e.which){
	case 13:
		console.log('Enter key pressed.');
		sendMsg();
		return false;
	}
});

$('#submitMsg').click(function(){
	sendMsg();
});

//update chat scroll
function updateScroll(){
    var chatCont = document.getElementById('chatLog');
    var height   = chatCont.scrollHeight;
    chatCont.scrollTop = height;
    console.log("chatwindow-height", height);
}