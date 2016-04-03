var room = null;
var id = null;
var data = {};

var socket = io.connect('http://localhost');

draw_loading();

socket.on('join_game', function (data) {
    room = data.room;
    id = data.id;
});

socket.on('sync', function (d) {
    if (room == d.room) {
        data = d.data;
        draw_game();
    }
});

socket.on('disconnect', function (data) {
    if (data.room == room) {
        draw_loading();
    }
});

$(document).bind('keydown', function (evt) {
//    if(room != null && id != null) {
//        // nu pas de data versturen
//    }
    
    if (evt.keyCode == 38 && data.players[id].y >= 30) {
        data.players[id].y -= 10;
    }

    if (evt.keyCode == 40 && data.players[id].y <= ($('#canvas').height() - 30) - 100) {
        data.players[id].y += 10;
    }

    socket.emit('sync', {"room": room, "id": id, "player": data.players[id]});
});

function draw_loading() {
    var ctx = document.getElementById('canvas').getContext('2d');

    ctx.clearRect(0, 0,
            document.getElementById("canvas").width,
            document.getElementById("canvas").height);

    ctx.fillStyle = "white";
    ctx.font = "100px Arial";
    ctx.fillText("Loading", 300, 100);
}

function draw_game() {
    var ctx = document.getElementById('canvas').getContext('2d');

    ctx.clearRect(0, 0,
            document.getElementById("canvas").width,
            document.getElementById("canvas").height);

    // style
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';

    // middle line
    ctx.beginPath();
    ctx.setLineDash([15]);
    ctx.moveTo(400, 5);
    ctx.lineTo(400, 595);
    ctx.stroke();

    // horizontal upper line
    ctx.beginPath();
    ctx.setLineDash([0, 0]);
    ctx.moveTo(5, 10);
    ctx.lineTo(795, 10);
    ctx.stroke();

    // horizontal bottom line
    ctx.beginPath();
    ctx.moveTo(5, 590);
    ctx.lineTo(795, 590);
    ctx.stroke();

    // scores
    ctx.fillStyle = "white";
    ctx.font = "100px Arial";
    ctx.fillText(data.players[0].points, 300, 100);
    ctx.fillText(data.players[1].points, 450, 100);

    // player 1
    ctx.beginPath();
    ctx.moveTo(data.players[0].x, data.players[0].y);
    ctx.lineTo(data.players[0].x, data.players[0].y + 100);
    ctx.stroke();

    // player 2
    ctx.beginPath();
    ctx.moveTo(data.players[1].x, data.players[1].y);
    ctx.lineTo(data.players[1].x, data.players[1].y + 100);
    ctx.stroke();

    // ball
    ctx.beginPath();
    ctx.moveTo(data.ball.x - 5, data.ball.y);
    ctx.lineTo(data.ball.x + 5, data.ball.y);
    ctx.stroke();
}