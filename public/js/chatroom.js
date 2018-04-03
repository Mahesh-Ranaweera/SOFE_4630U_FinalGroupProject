var db = firebase.database();
var curUser = null;

firebase.auth().onAuthStateChanged(function(user){
	if(user){
		curUser = user;
		$(document).ready(initializeChatRoom);
	}
	else console.log('Not logged in.')
})

function initializeChatRoom(){
	let roomCode = $('#roomCode').val();

	// db.ref('chat_groups/' + roomCode + '/messages').orderByChild('postTime').once('value', function(snapshot){
	// 	snapshot.forEach(function(childSnap){
	// 		let message = $(document.createElement('div')).addClass('messageContainer');
	// 		let messageHead = $(document.createElement('div')).addClass('messageHead');
	// 		let messageBody = $(document.createElement('div')).addClass('messageBody');
	
	// 		let dt = new Date(childSnap.val().postTime*1000);
	// 		messageHead.append(childSnap.val().user + ' [' + dt.toDateString() + ' ' + dt.toTimeString() + ']');
			
	// 		messageBody.append(childSnap.val().text);
			
	// 		message.append(messageHead);
	// 		message.append(messageBody);
	// 		$('#chatLog').append(message);
	// 	});
	// });

	db.ref('chat_groups/' + roomCode + '/messages').on('child_added', function(data){
		let message = $(document.createElement('div')).addClass('messageContainer');
		let messageHead = $(document.createElement('div')).addClass('messageHead');
		let messageBody = $(document.createElement('div')).addClass('messageBody');

		console.log(data.val())
		let dt = new Date(data.val().postTime*1000);
		messageHead.append(data.val().user + ' [' + dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString() + ']');
		
		messageBody.append(data.val().text);
		
		message.append(messageHead);
		message.append(messageBody);
		$('#chatLog').prepend(message);
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