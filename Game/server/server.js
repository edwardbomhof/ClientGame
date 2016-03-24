var app = require('http').createServer(handler)
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


var previous_position = {"x":250, "y":50}, current_position= {"x":254, "y":47},direction = {"x" :0,"y":0};

function calcDirection(previous_pos, current_pos) {
    direction.x = current_pos.x - previous_pos.x;
    direction.y = current_pos.y - previous_pos.y;
    previous_position = current_position;
}

function hitCalcDirection(hit, boardLocation)
{
        if (hit == "border"){
            if (direction.y >= 0){
                direction.y= direction.y *-1;
            }
            else if(direction.y<=-1){
                direction.y= Math.abs(direction.y);
            }
        }
        else if (hit == "player"){

            cornerIncoming = toDegrees(Math.atan(direction.x/direction.y));
            hitLocation = current_position.y - boardLocation.y2;
            newAngleFactor = 0.0022*(hitLocation*hitLocation)+-.22*hitLocation+6.5;
            outcomingCorner = cornerIncoming * newAngleFactor;
            direction.y = direction.x * Math.sin(180-outcomingCorner - 90)/Math.sin(outcomingCorner);
            if (direction.y >= 5 ){
                direction.y = 4.9;
            }
            if (direction.x >=  0){
                direction.x= direction.x *-1;
            }
            else if(direction.x<=-1){
                console.log(current_position);
                direction.x= Math.abs(direction.x);
            }
        }

}
function  resetRound(){
    previous_position = {"x":250, "y":50}, current_position= {"x":254, "y":47},direction = {"x" :0,"y":0};
}

// gameloop
function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

setInterval(function () {
    for (var i = 0; i < data.rooms.length; i++) {
        if (data.rooms[i].players.length == 2) {
            if ((current_position.y >= data.rooms[i].players[1].y && current_position.y <= data.rooms[i].players[1].y+100) || (current_position.y >= data.rooms[i].players[0].y && current_position.y <= data.rooms[i].players[0].y+100)){
                if ((current_position.x >= data.rooms[i].players[1].x-5 && current_position.x <= data.rooms[i].players[1].x-2) || (current_position.x >= data.rooms[i].players[0].x-5 && current_position.x <= data.rooms[i].players[0].x-2)){
                    hitCalcDirection("player", {"y1":data.rooms[i].players[0].y, "y2":data.rooms[i].players[1].y});
                }
            }
            if ((current_position.y >= 25 && current_position.y <= 35) ||(current_position.y >= 565 && current_position.y <= 575 ) ){
                hitCalcDirection("border",0);
            }
            if (current_position.x < data.rooms[i].players[0].x-5){
                data.rooms[i].players[1].points++;
                resetRound();
                data.rooms[i].players[1].y = 350;
                data.rooms[i].players[0].y = 450;
                calcDirection(previous_position, current_position);
            }
            else if (current_position.x > data.rooms[i].players[1].x+5){
                data.rooms[i].players[0].points++;
                resetRound();
                data.rooms[i].players[1].y = 350;
                data.rooms[i].players[0].y = 450;
                calcDirection(previous_position, current_position);
            }
            current_position.x  += direction.x;
            current_position.y  += direction.y;
            previous_position = current_position;

            // update ball
            data.rooms[i].ball = current_position;

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
        data.rooms.push({"players": [], "ball": {"x": 100, "y": 100}});
        calcDirection(previous_position, current_position, false);
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