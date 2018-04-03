var db = firebase.database();
var curUser = null;

firebase.auth().onAuthStateChanged(function(user){
	if(user){
		curUser = user;
		$(document).ready(getActiveUserChatRooms);
	}
	else console.log('Not logged in.')
})

function getActiveUserChatRooms(){
	var uid = curUser.uid;
	firebase.database().ref('users/' + uid + '/chat_groups').once('value').then(function(snapshot){
		//Append the active chats to a div
		$('#activeGroups').empty();
		snapshot.forEach(function(childSnap){
			let card = $(document.createElement("div")).addClass('card-holder three_w');
			let innerCard = $(document.createElement('div'))
				.addClass("uk-card uk-card-default uk-card-hover uk-card-body card-height uk-padding-small")
			innerCard.append($('<a>', {text: childSnap.val(), href: `chatroom?id=${childSnap.val()}`})
				.addClass("card-body smooth"));
			card.append(innerCard);

			$('#activeGroups').append(card);
		});
	});
}

function createChatRoom(){
	//Get new group key
	let roomKey = db.ref().child('chat_groups').push().key;
	let gname = $('#groupName').val();

	//Create new chat room node
	let updates = {};
	updates['/chat_groups/' + roomKey] = {
		name: gname,
		creator: curUser.uid,
		messages: []
	}
	db.ref().update(updates);

	//Add current user to group list
	db.ref('users/' + curUser.uid + '/chat_groups').transaction(function(list){
		if(!list)
			list = [];

		list.push(roomKey);
		return list;
	})
	location.reload();
}

function joinGroup(){
	let roomKey = $('#groupID').val();
	console.log(roomKey);
	db.ref('chat_groups/' + roomKey).once('value', function(snapshot){
		console.log(snapshot);
		if(snapshot.exists()){
			//Add to this user's list of available chat rooms
			db.ref('users/' + curUser.uid + '/chat_groups').transaction(function(list){
				if(!list)
					list = [];
				
				list.push(roomKey);
				return list;
			})

			//Add to the chatroom's list of members
			db.ref('chat_groups/'+roomKey+'/members').transaction(function(list){
				if(!list)
					list = [];
				
				list.push(curUser.uid);
				return list;
			})
			location.reload();
		}
	})
}