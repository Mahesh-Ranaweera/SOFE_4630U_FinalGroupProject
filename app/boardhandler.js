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
		socket.on('tododata', function(data){

			//insert todo to group
			dbconn.addTODO(data, function(state){
				//console.log(state);
				if(state == 1){
					//broadcast the change to everyone
					io.sockets.in(data.gid).emit('recieveresp', data)
				}
			});
		});

		//delete todo item
		socket.on('deleteitem', function(data){
			//console.log(data);

			dbconn.deleteTODO(data, function(state){
				if(state == 1){
					//broadcast the change to everyone
					io.sockets.in(data.gid).emit('recieveresp', data)
				}
			})
		});

		//upgrade todo item
		socket.on('upgradeitem', function(data){
			//console.log(data);

			dbconn.upgradeTODO(data, function(state){
				if(state == 1){
					//broadcast the change to everyone
					io.sockets.in(data.gid).emit('recieveresp', data)
				}
			})
		});

		//downgrade the item
		socket.on('downgradeitem', function(data){
			//console.log(data)

			dbconn.downgradeTODO(data, function(state){
				if(state == 1){
					//broadcast the change to everyone
					io.sockets.in(data.gid).emit('recieveresp', data)
				}
			})
		})

		/** Disconnect sockets **/
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});
}