var socket ="";
var rooms=[];

var width, height, c, ctx = "";
var selected = 0;
var buttons = [];
var guiEnum ={
    Splash:0, // splash with this one
    Main : 1,
    Game : 2,
};

$(document).ready(function()
{
    c =  document.getElementById("myCanvas");
    declareWidth();
    ctx =c.getContext('2d');
    addListeners();
    declareGui(guiEnum.Main);
    //$(window).resize(redraw());
});

//add buttons to buttonarray
function addButton(name, gui){
    button = [];
    button.push(name);
    button.push(gui);
    buttons.push(button);
}

// declares listeners for keyboard
function addListeners(){
    window.onkeyup = function(e){
        var key= e.keyCode ? e.keyCode : e.which;
        switch(key){
            case 8:
            case 27:
                declareGui(guiEnum.Main);
                disconnect();
                break;
            case 38:
                selected = selected-1;
                if (selected < 0){
                    selected = 0;
                }
                redraw();
                break;
            case 40:
                selected = selected+1;
                if (selected > buttons.length-1){
                    selected = buttons.length-1;
                }
                redraw();
                break;
            case 13:
                declareGui(buttons[selected][1]);
                break;
        }
    };
}

// declares which window should be shown
function declareGui(guiName){
    switch (guiName){
        case guiEnum.Splash:
            break;
        case guiEnum.Main:
            buttons = [];
            selected = 0;
            openedMenu = "Main menu";
            addButton("Join game", guiEnum.Game);
            redraw();
            break;
        case guiEnum.Game:
            buttons = [];
            openedMenu = "";
            $.getScript("../client/client.js");

            break;/*
        case guiEnum.Join:
            buttons = [];
            selected = 0;
            openedMenu = "Join game";
            for(var i=0; i<rooms.number_of_rooms; i++){
                addButton(rooms.rooms[i].number_of_connected_players,guiEnum.Game);
            }
            addButton("Back to main", guiEnum.Main);
            redraw();
            break;
        case guiEnum.Game:
            buttons = [];
            selected = 0;
            openedMenu = "Put game here";
            addButton("Back to main", guiEnum.Main);
            redraw();
            break;*/
    }
}

// necessary for resizing
function declareWidth(){
    c.width=1200;
    c.height=768;
    width = c.width;
    height = c.height;
}

// redraws canvas
function redraw(){
    ctx.save();
    declareWidth();
    ctx.clearRect(0,0,width,height);

    ctx.beginPath();
    drawGui();
}

// draws canvas with game
function drawGui(){
    ctx.globalAlpha=1;
    ctx.save();
    ctx.fillStyle="white";
    ctx.font = height*.2+"px Arial";
    ctx.textAlign = "center";
    ctx.fillText(openedMenu,width/2,height*0.18);
    ctx.font = height*0.1177+"px Arial";
    for(var i = 0; i<buttons.length; i++){
        if (i === selected) {
            ctx.fillRect(width/3.2, height*0.25+(i*height*0.16), width-(2*(width/3.2)) ,height*0.1449 );
            ctx.fillStyle="black";
            ctx.fillText(buttons[i][0], width/2, height*0.3623+(i*height*0.16));
            ctx.fillStyle="white";
        }
        else{
            ctx.fillText(buttons[i][0], width/2, height*0.3623+(i*height*0.16));
        }
    }
    ctx.clip();
    ctx.restore();
}

