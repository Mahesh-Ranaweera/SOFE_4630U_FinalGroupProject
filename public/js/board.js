/** Handle the agileboard with sockets **/


/**submit the todo to board**/
$(function (){
	var socket = io();
	var metadata = JSON.parse($('#group_data').val());
	//var todoCont = $('#');

	socket.emit('joinroom', metadata.groupid);
})