var players = {};

module.exports = function(http) {
    var io = require('socket.io')(http);

    console.log('[!] Socket.io service started');

    io.on('connection', function(socket) {

        // console.log('player connected');

        socket.on('disconnect', function() {
            delete players[socket.id];
            socket.broadcast.emit('player-disconnected', socket.id);
        });

        socket.on('data', function(data) {

            // console.log('received data');
            // console.log(data);

            for (let id in players) {
                socket.emit('player-connected', players[id]);
            }

            players[socket.id + ""] = {
                id: socket.id,
                save: data.save,
                char: data.character,
            };

            if (data.x && data.y) {
                players[socket.id + ""].x = data.x;
                players[socket.id + ""].y = data.y;
            }

            socket.emit('main', players[socket.id + ""]);

            socket.broadcast.emit('player-connected', players[socket.id + ""]);
        })

        socket.on('player-moved', function(movementData) {
            if (!players[socket.id]) return;
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].texture = movementData.texture;
            // console.log(movementData.texture);
            // console.log('player-moved', movementData);
            socket.broadcast.emit('player-moved', { cursors: movementData.cursors, texture: movementData.texture, id: socket.id });
        });

    });
}