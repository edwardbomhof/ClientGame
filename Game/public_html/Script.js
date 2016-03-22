var width, height, c, ctx = "";
var selected = 0;
var buttons = [];
var guiEnum = {
    Splash: 0, // splash with this one
    Main : 1,
    New : 2,
    Join : 3,
    Game: 4 // game over here
};

$(document).ready(function(){
    c =  document.getElementById("myCanvas");
    declareWidth();
    ctx = c.getContext('2d');
    checkInput();
    declareGui(guiEnum.Splash);
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
        var key = e.keyCode ? e.keyCode : e.which;
        switch(key){
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

// removes the any key eventlistener and adds the normal menu eventlisteners
function changeListeners(){
        declareGui(guiEnum.Main);
        window.removeEventListener("keyup",changeListeners,false);
        addListeners();
}

// press any key to continue event check
function checkInput(){
    window.addEventListener("keyup", changeListeners ,false);
}

// declares which window should be shown
function declareGui(guiName){
    switch (guiName){
        case guiEnum.Splash:
            drawSplash();
            checkInput();
            break;
        case guiEnum.Main:
            addListeners();
            buttons = [];
            selected = 0;
            openedMenu = "Main menu";
            addButton("New game", guiEnum.New);
            addButton("Join game", guiEnum.Join);
            redraw();
            break;
        case guiEnum.New:
            buttons = [];
            selected = 0;
            openedMenu = "New game";
            addButton("Create", guiEnum.Game);
            addButton("Join game", guiEnum.Join);
            addButton("Back to main", guiEnum.Main);
            redraw();
            break;
        case guiEnum.Join:
            buttons = [];
            selected = 0;
            openedMenu = "Join game";
            addButton("thisone?", "newgame");
            addButton("Join game", guiEnum.Join);
            addButton("Back to main", guiEnum.Main);
            redraw();
            break;
        case guiEnum.Game:
            buttons = [];
            selected = 0;
            openedMenu = "Put game here";
            addButton("Back to main", guiEnum.Main);
            redraw();
            break;
    }
}

// necessary for resizing
function declareWidth(){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
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

// draws the starting screen
function drawSplash(){
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = height*.2 + "px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("Ping Pong",width/2,height*0.18);
    
    pic = new Image();
    pic.onload = function(){
        ctx.drawImage(pic,width/3.2,height*0.22,width - (2*(width/3.2)),height*0.515);
    };
    pic.src = "splashart.jpg";
    
    ctx.fillStyle = "white";
    ctx.font = height*0.085 + "px Arial";
    ctx.fillText("Press any key to continue",width/2,height*0.8);
} 

// draws the menuname with buttons
function drawGui(){
    ctx.globalAlpha=1;
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = height*.2 + "px Arial";
    ctx.textAlign = "center";
    ctx.fillText(openedMenu,width/2,height*0.18);
    
    ctx.font = height*0.1177 + "px Arial";
    for(var i = 0; i<buttons.length; i++){
        if (i === selected) {
            ctx.fillRect(width/3.1, height*0.25 + (i*height*0.16), width - (2*(width/3.1)) ,height*0.155 );
            ctx.fillStyle="black";
            ctx.fillText(buttons[i][0], width/2, height*0.3623 + (i*height*0.16));
            ctx.fillStyle="white";
        }
        else{
            ctx.fillText(buttons[i][0], width/2, height*0.3623+(i*height*0.16));
        }
    }
    ctx.clip();
    ctx.restore();
}