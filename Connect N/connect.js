//Load after canvas_input.js
//click
//mousemove
//mouseover
//mouseout
//keyup
//keydown
//focus
//blur
//select
//load
//canvas = document.getElementById("c");


var context;
var height=480
var width=720
var gridSize={x:7,y:7}
var cellWidth=width/gridSize.x;
var cellHeight=height/gridSize.y;
var spaces=[];
var lasthoveredCell=null
for (x=0; x<gridSize.x; x=x+1){
		for (y=0; y<gridSize.y; y=y+1){
			spaces[x+gridSize.x*y]={
				origin:{x:x*cellWidth,y:y*cellHeight},
				hovered:false,
				owner:null
			};
		}
	}
var status_info=null

//status and websocket
game={
	status:'waiting for connection',
	playerNum:null,
	playerColor:null,
	opponentColor:null,
	spaces:spaces,
	turn:null
	}


var serverURL='ws://127.0.0.1:55555'
var socket = new WebSocket(serverURL);

socket.onopen = function (event) {
	socket.send('request game');
}
socket.onmessage = function (event) {
	console.log('message came from server');
	message=JSON.parse(event.data);
	console.log(message)
	if(message.update != null){
		update(message.update);
	}
}
socket.onclose = function (event) {
}

function update(update){
/*
Gets called when server sends a JSON message containing property named "update".
The update property describes an object with some of the same members as the client's
game object. Every normal member of the update object overwrites a member of the game object.

There are also special members that contain periods in their names. These update members overwrite
members of game object members e.g the update member "spaces.2.owner" will update game['spaces']['2']['owner']
instead of game['spaces.2.owner'] which doesn't exist.
*/
	for(property in update){
		if(property.indexOf('.')==-1){//property name does not contain a period (normal update)
			game[property]=update[property];
		}
		else{
			var updatedObj=game;
			var sub_property=''+property;
			while(sub_property.indexOf('.')!=-1)
			{
				updatedObj=updatedObj[sub_property.substring(0,sub_property.indexOf('.'))]
				sub_property=sub_property.substring(sub_property.indexOf('.')+1,sub_property.length)
			}
			updatedObj[sub_property]=update[property]
		}
	}
	status_info.innerText=game.status;
	drawBoard();
}


function connectSetup()
{
	context = canvas.getContext("2d");
	
	status_info=document.getElementById('status_info');

	input_callbacks.click=function (event) {
		console.log(event);
		event.canvasX=event.x-canvas.getBoundingClientRect().left;
		event.canvasY=event.y-canvas.getBoundingClientRect().top;
		var cell=getCell(event);
		cell.owner=game.playerNum;
	};
	input_callbacks.mousemove=function (event) {
		event.canvasX=event.x-canvas.getBoundingClientRect().left;
		event.canvasY=event.y-canvas.getBoundingClientRect().top;
		cell=getCell(event);
		if (lasthoveredCell!=null){
			lasthoveredCell.hovered=false;
		}
		lasthoveredCell=cell;
		cell.hovered=true;
		drawBoard();
	};
	status_info.innerText=game.status;
	drawBoard();

}

function getCell(object)
{
	var x=Math.floor(object.canvasX/cellWidth);
	var y=Math.floor(object.canvasY/cellHeight);
	return spaces[x+y*gridSize.x]
}

function drawBoard()
{
	//context.strokeRect(0, 0, width, height);
	context.clearRect(0,0,width,height);
	
	for (var i=0; i<gridSize.x*gridSize.y; i=i+1)
	{
		var cell=spaces[i]
		if (cell.hovered)
		{
			context.fillStyle='#BFC'
			context.fillRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
		}
		if (game.playerNum!=null && cell.owner==game.playerNum)
		{
			context.fillStyle=game.playerColor
			context.beginPath();
			context.arc(cell.origin.x+cellWidth/2, cell.origin.y+cellHeight/2,Math.min(cellHeight,cellWidth)/2-2,2*Math.PI,false);
			context.fill();
			context.stroke();
		}
		if (cell.owner!=null && cell.owner!=game.playerNum)
		{
			context.fillStyle=game.opponentColor
			context.beginPath();
			context.arc(cell.origin.x+cellWidth/2, cell.origin.y+cellHeight/2,Math.min(cellHeight,cellWidth)/2-2,2*Math.PI,false);
			context.fill();
			context.stroke();
		}
		context.strokeStyle='#000'
		context.strokeRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
	}

}