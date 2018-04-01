/** Handle the agileboard with sockets **/
var socket, metadata, todoCont, progCont, reviewCont, finiCont, progressBar

/**submit the todo to board**/
$(function (){
	socket = io();
	metadata = JSON.parse($('#group_data').val());
	
	//define appending containers
	todoCont = $('#todo_section');
	progCont = $('#progress_section');
	reviewCont = $('#review_section');
	finiCont = $('#finish_section');
	progressBar = $('#progBar');

	//join the group
	socket.emit('joinroom', metadata.groupid);

	//load the progressbar
	update_progress();

	//send todo
	$('#agileboard').submit(function(e){
		var url = '/sendtodo';
		var tododata = {
			gid: metadata.groupid,
			content: $('#strTodo').val(),
			member: $('#strMember').val(),
			date: $('#strDate').val(),
			stamp: Date.now(),
			task: 'addtodo',
			type: 'todo'
		}

		//send the todo info
		if(tododata != ''){
			socket.emit('tododata', tododata);
		}

		e.preventDefault();
	})

	//socket recieve todo data
	socket.on('recieveresp', function(data){
		//console.log(data);

		//manage incoming broadcasts
		if(data.task == 'addtodo'){
			//append item to cont.
			console.log('adding')
			addcard(data);
		}

		if(data.task == 'delete'){
			//hide the specific id card
			console.log('deleting')
			hidecard(data.stamp);
		}

		if(data.task == 'upgrade'){
			console.log('upgrade')
			upgrade(data.stamp, data.type, data);
		}

		if(data.task == 'downgrade'){
			console.log('downgrade')
			downgrade(data.stamp, data.type, data);
		}
	})
});


//delete the item
function deleteitem(itemid, type){
	var deletedata = {
		gid: metadata.groupid,
		stamp: itemid,
		type: type,
		task: 'delete'
	}
	
	socket.emit('deleteitem', deletedata);
}

//upgrade the item
function upgradeitem(itemid, type, content, member, date){
	var upgrade_data = {
		gid: metadata.groupid,
		type: type,
		stamp: itemid,
		content: content,
		member: member,
		date: date,
		task: 'upgrade'
	}

	socket.emit('upgradeitem', upgrade_data);
}

//downgrade the item
function downgradeitem(itemid, type, content, member, date){
	var downgrade_data = {
		gid: metadata.groupid,
		type: type,
		stamp: itemid,
		content: content,
		member: member,
		date: date,
		task: 'downgrade'
	}

	socket.emit('downgradeitem', downgrade_data);
}

//hide item when deleted
function hidecard(cardid){
	//hide the item
	document.getElementById(cardid).style.visibility = 'hidden';
}

//add display block
function displaycard(cardid){
	//add display block style
	document.getElementById(cardid).style.visibility = 'visible';
}

//refresh page
function refresh(){
	$("#agilecontent").load(location.href+" #agilecontent");
	update_progress();
}

//upgrade items
function upgrade(cardid, currtype, data){
	hidecard(cardid);

	//append to progress cont.
	// if(currtype == 'todo'){
	// 	data.type='progress';
	// 	progCont.append(card(data));
	// }

	// //append to review cont.
	// if(currtype == 'progress'){
	// 	data.type='review';
	// 	reviewCont.append(card(data));
	// }

	// //append to finished cont.
	// if(currtype == 'review'){
	// 	data.type='finished';
	// 	finiCont.append(card(data));
	// }

	refresh();
}

//downgrade items
function downgrade(cardid, currtype, data){
	hidecard(cardid);

	//append to progress cont.
	// if(currtype == 'progress'){
	// 	data.type='todo';
	// 	todoCont.append(card(data));
	// }

	// //append to review cont.
	// if(currtype == 'review'){
	// 	data.type='progress';
	// 	progCont.append(card(data));
	// }

	// //append to finished cont.
	// if(currtype == 'finished'){
	// 	data.type='review';
	// 	reviewCont.append(card(data));
	// }

	refresh();
}

function addcard(data){
	todoCont.append(card(data));
	refresh();
}

//prepare content to append
function card(data){
	var content = '';

	content += '<div class="todo_card" id="'+data.stamp+'">\
				    <div class="uk-label uk-label-success">'+data.member+'</div>\
				    <div class="todo_desc">'+data.content+'</div>\
				    <div class="todo_footer">\
				        <div class="todo_btn todo_check" name="btnChange" onclick="upgradeitem('+data.stamp+',&quot;'+data.type+'&quot;,&quot;'+data.content+'&quot;,&quot;'+data.member+'&quot;,&quot;'+data.date+'&quot;)"\
				            title="Add to Progress">\
				            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg></div>\
				        <div class="todo_btn todo_close" name="btnDelete" onclick="deleteitem('+data.stamp+',&quot;'+data.type+'&quot;);" title="Delete Item">\
				            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div>\
				        <div class="date-info">'+data.date+'</div></div></div>';

	return content;
}
