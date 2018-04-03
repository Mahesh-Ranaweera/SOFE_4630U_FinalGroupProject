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
	db.ref('chat_groups/' + roomCode + '/messages').on('child_added', function(data){
		let message = $(document.createElement('div')).addClass('messageContainer');
		let messageHead = $(document.createElement('div')).addClass('messageHead');
		let messageBody = $(document.createElement('div')).addClass('messageBody');

		let dt = new Date(data.postTime*1000);
		messageHead.append(data.uid + ' [' + dt.toDateString() + ' ' + dt.toTimeString() + ']');
		
		messageBody.append(data.text);
		
		message.append(messageHead);
		message.append(messageBody);
		$('#chatLog').prepend(message);
	});

	db.ref('chat_groups/' + roomCode + '/messages').orderByChild('postTime').once('value', function(snapshot){
		snapshot.forEach(function(childSnap){
			let message = $(document.createElement('div')).addClass('messageContainer');
			let messageHead = $(document.createElement('div')).addClass('messageHead');
			let messageBody = $(document.createElement('div')).addClass('messageBody');
	
			let dt = new Date(data.postTime*1000);
			messageHead.append(data.uid + ' [' + dt.toDateString() + ' ' + dt.toTimeString() + ']');
			
			messageBody.append(data.text);
			
			message.append(messageHead);
			message.append(messageBody);
			$('#chatLog').append(message);
		});
	});
}