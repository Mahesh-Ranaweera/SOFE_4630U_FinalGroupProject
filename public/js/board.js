/** Handle the agileboard with sockets **/


/**submit the todo to board**/
$(function (){
	var socket = io();
	var metadata = JSON.parse($('#group_data').val());
	//var todoCont = $('#');

	socket.emit('joinroom', metadata.groupid);

	$('#agileboard').submit(function(e){
		var url = '/sendtodo';
		var tododata = {
			gid: metadata.gid,
			todo: $('#strTodo').val(),
			member: $('#strMember').val(),
			date: $('#strDate').val(),
			stamp: Date.now()
		}

		e.preventDefault();
	})
});''