var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);

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


function calcDirection(room) {
    room.direction.x = room.current_position.x - room.previous_position.x;
    room.direction.y = room.current_position.y - room.previous_position.y;
    room.previous_position = room.current_position;
    return room;
}

function calcReflection(room, boardLocation){
    cornerIncoming = toDegrees(Math.atan(room.direction.x/room.direction.y));
    hitLocation = room.current_position.y - boardLocation;
    newAngleFactor = 0.0014*(hitLocation*hitLocation)+-.14*hitLocation+4.5;
    outcomingCorner = cornerIncoming * newAngleFactor;
    room.direction.y = room.direction.x * Math.sin(180-outcomingCorner - 90)/Math.sin(outcomingCorner);
    if (room.direction.y >= 3 ){
        room.direction.y = 3;
    }
    return room;
}


function hitCalcDirection(hit, room, boardLocation)
{
        if (hit == "border"){
            if (room.direction.y >= 0){
                room.direction.y= room.direction.y *-1;
            }
            else if(room.direction.y<=-1){
                room.direction.y= Math.abs(room.direction.y);
            }
        }
        else if (hit == "player"){
            if (room.direction.x >=  0){
                room = calcReflection(room, boardLocation.y2);
                room.direction.x = room.direction.x *-1;
                return room;
            }
            else if(room.direction.x<=-1){
                room = calcReflection(room, boardLocation.y1);
                room.direction.x = Math.abs(room.direction.x);
                return room;
            }
        }
    return room;

}
function  resetRound(room ){
    room.previous_position = {"x":250, "y":50}; room.current_position= {"x":254, "y":47};room.direction = {"x" :0,"y":0};
    return room;
}

// gameloop
function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

setInterval(function () {
    for (var i = 0; i < data.rooms.length; i++) {
        if (data.rooms[i].players.length == 2) {
            if ( data.rooms[i].current_position.y >= data.rooms[i].players[0].y && data.rooms[i].current_position.y <= data.rooms[i].players[0].y+100 ){
                if (data.rooms[i].current_position.x >= data.rooms[i].players[0].x-5 && data.rooms[i].current_position.x <= data.rooms[i].players[0].x-2  ){
                    data.rooms[i]=hitCalcDirection("player", data.rooms[i], {"y1":data.rooms[i].players[0].y, "y2":data.rooms[i].players[1].y});
                }
            }
            else if ( data.rooms[i].current_position.y >=data.rooms[i].players[1].y  && data.rooms[i].current_position.y <= data.rooms[i].players[1].y+100){
                if (data.rooms[i].current_position.x >= data.rooms[i].players[1].x-5 && data.rooms[i].current_position.x <= data.rooms[i].players[1].x-2  ) {
                    data.rooms[i]=hitCalcDirection("player", data.rooms[i], {"y1":data.rooms[i].players[0].y, "y2":data.rooms[i].players[1].y});
                }
            }
            if ((data.rooms[i].current_position.y <= 35) ||(data.rooms[i].current_position.y >= 565) ){
                data.rooms[i]=hitCalcDirection("border",data.rooms[i]);
            }
            if (data.rooms[i].current_position.x < data.rooms[i].players[0].x-5){
                data.rooms[i].players[1].points++;
                data.rooms[i] = resetRound(data.rooms[i]);
                data.rooms[i]=calcDirection(data.rooms[i]);
            }
            else if (data.rooms[i].current_position.x > data.rooms[i].players[1].x+5){
                data.rooms[i].players[0].points++;
                data.rooms[i] = resetRound(data.rooms[i]);
                data.rooms[i]=calcDirection(data.rooms[i]);
            }
            data.rooms[i].current_position.x  += data.rooms[i].direction.x;
            data.rooms[i].current_position.y  += data.rooms[i].direction.y;
            data.rooms[i].previous_position = data.rooms[i].current_position;
            // update ball
            data.rooms[i].ball = data.rooms[i].current_position;
            // update scores
           //data.rooms[i].players[0].points = Math.floor((Math.random() * 10) + 1);
           // data.rooms[i].players[1].points = i;

            io.sockets.json.emit('sync', {"room": i, "data": data.rooms[i]});
        }
    }
}, 17);

var data = {
    "rooms": []
};

// search for a room and when room is full start the game
function connect(socket) {
    if (data.rooms.length == 0) {
        data.rooms.push({"players": [], "ball": {"x": 100, "y": 100},"previous_position" : {"x":250, "y":50}, "current_position": {"x":254, "y":47}, "direction": {"x" :254-250,"y":47-50}});
    }

    for (var i = 0; i < data.rooms.length; i++) {
        if (data.rooms[i].players.length < 2) {
            if (data.rooms[i].players.length == 0) {
                socket.room = i;
                socket.id = 0;


                data.rooms[socket.room]. previous_position = {"x":250, "y":50};
                data.rooms[socket.room]. current_position = {"x":254, "y":47};
                data.rooms[socket.room]. direction = {"x" :254-250,"y":47-50};
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
            socket.room = resetRound(socket.room);

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