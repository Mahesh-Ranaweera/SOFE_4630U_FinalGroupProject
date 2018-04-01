/** Handle the agileboard with sockets **/


/**submit the todo to board**/
$(function (){
	var socket = io();
	var metadata = JSON.parse($('#group_data').val());
	
	//define appending containers
	var todoCont = $('#todo_section');
	var progCont = $('#progress_section');
	var reviewCont = $('#review_section');
	var finiCont = $('#finish_section');

	socket.emit('joinroom', metadata.groupid);

	$('#agileboard').submit(function(e){
		var url = '/sendtodo';
		var tododata = {
			gid: metadata.groupid,
			todo: $('#strTodo').val(),
			member: $('#strMember').val(),
			date: $('#strDate').val(),
			stamp: Date.now()
		}

		//send the todo info
		if(tododata != ''){
			socket.emit('tododata', tododata);
		}

		e.preventDefault();
	})

	//socket recieve todo data
	socket.on('recievetodo', function(data){
		console.log(todo);
		var todo = '';

		//append the todo 
		todo += '<div class="todo_card"><div class="uk-label uk-label-success">'+data.member+'</div><div class="todo_desc">'+data.todo+'</div> \
				 <div class="todo_footer"><div class="todo_btn todo_check"><span uk-icon="icon: check" class="uk-icon"></span></div> \
				 <div class="todo_btn todo_close"><span uk-icon="icon: close" class="uk-icon"></span></div>\
				 <div class="date-info">'+data.date+'</div></div>';


		todoCont.append(todo);
	})
});''