var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(80);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
}

io.on('connection', function (socket) {
    connect(socket);

    socket.on('sync', function (data) {
        update(socket, data);
    });

    socket.on('disconnect', function () {
        disconnect(socket);
    });
});


// gameloop
setInterval(function () {
    for (var i = 0; i < data.rooms.length; i++) {
        if (data.rooms[i].players.length == 2) {

            // update ball


            // update scores
            data.rooms[i].players[0].points = Math.floor((Math.random() * 10) + 1);
            data.rooms[i].players[1].points = i;

            io.sockets.json.emit('sync', {"room": i, "data": data.rooms[i]});
        }
    }
}, 1000);

var data = {
    "rooms": []
};

// search for a room and when room is full start the game
function connect(socket) {
    if (data.rooms.length == 0) {
        data.rooms.push({"players": [], "ball": {"x": 100, "y": 100}});
    }

    for (var i = 0; i < data.rooms.length; i++) {
        if (data.rooms[i].players.length < 2) {
            if (data.rooms[i].players.length == 0) {
                socket.room = i;
                socket.id = 0;

                data.rooms[socket.room].players.push({"id": socket.id, "points": 0, "x": 40, "y": 200});
            } else {
                socket.room = i;

                if (data.rooms[i].players[0].id == 0) {
                    socket.id = 1;

                    data.rooms[socket.room].players.push({"id": socket.id, "points": 0, "x": 760, "y": 200});
                } else {
                    socket.id = 0;

                    data.rooms[socket.room].players.push({"id": socket.id, "points": 0, "x": 40, "y": 200});
                }
            }

            socket.emit('join_game', {"room": socket.room, "id": socket.id});

            console.log("player " + socket.id + " joined room " + socket.room);

            // tot nu toe de start game event
            if (data.rooms[i].players.length == 2) {
                io.sockets.json.emit('sync', {"room": i, "data": data.rooms[i]});
            }

            return;
        } else {
            data.rooms.push({"players": [], "ball": {"x": 100, "y": 100}});
        }
    }
}

function update(socket, d) {
    // kan ik de room en het id niet uit socket halen?
    // is veel veiliiger
    //data.rooms[d.room].players[d.id] = d.player;
    
    data.rooms[socket.room].players[socket.id] = d.player;

    io.sockets.json.emit('sync', {"room": d.room, "data": data.rooms[d.room]});
}

function disconnect(socket) {
    data.rooms[socket.room].players.splice(socket.id, 1);

    io.sockets.json.emit('disconnect', {"room": socket.room});

    console.log("player " + socket.id + " left room " + socket.room);
}