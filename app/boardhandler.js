var dbconn = require('./db');

/**Start the websockets**/
module.exports = function(server){
	var io = require('socket.io')(server)

	/**make the socket connection**/
	io.on('connection', function(socket){
		console.log('%s socket connected : %s conn id', io.engine.clientsCount, socket.conn.id);

		/** join the room **/
		socket.on('joinroom', function(room){
			socket.join(room);
		});

		//add todo to the board
		socket.on('tododata', function(tododata){
			console.log(todo);

			//insert todo to group
		});

		/** Disconnect sockets **/
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});
}