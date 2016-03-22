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


var players = [
    {
        "x": 10,
        "y": 200
    },
    {
        "x": 10,
        "y": 200
    }
];


io.on('connection', function (socket) {
    socket.emit('sync', players);

    socket.on('sync', function (data) {
        if ("player1" in data) {
            players[0].y = data.player1;
        }

        if ("player2" in data) {
            players[1].y = data.player2;
        }
        socket.broadcast.emit('sync', players);
    });
});