//Load after canvas_input.js

/* event names for my reference
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
*/

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
				index:[x+gridSize.x*y],
				x:x,
				y:y,
				origin:{x:x*cellWidth,y:y*cellHeight},
				hovered:false,
				owner:null
			};
		}
	}
var status_info=null

var socket=null;

//status and websocket

//var player={}
var game={
	status:'waiting for connection',
	playerNum:null,
	playerColor:null,
	opponentColor:null,
	spaces:spaces,
	turn:null
	}


function autoConnect()
{	
	//make sure query string gives us address and port
	var queryString = window.location.search.substring(1);
	if (queryString.indexOf('autoconnect_address') == -1) return;
	if (queryString.indexOf('autoconnect_port') == -1) return;
	
	var customIP;
	var customAddress;
	
	//parse address and port of game server from query string 
	vars=queryString.split('&');
	vars.forEach(function(item){
		key=item.split('=')[0]
		value=item.split('=')[1]
		if(key=='autoconnect_address') {
		customAddress = value;
		}
		else {
		customPort = value;
		}
	});
	
	var serverURL='ws://' + customAddress + ':' + customPort;
	socket = new WebSocket(serverURL);

	socket.onopen = function (event) {
		console.log('socket open')
		socket.send('request game');
		updateStatusText('socket opened, awaiting server reply');
		var manual_connect = document.getElementById('manual_connect');
		manual_connect.hidden=true;
	}
	socket.onmessage = function (event) {
		console.log('message came from server');
		message=JSON.parse(event.data);
		console.log(message)
		if(message.update != null){
			update(message.update);
		}
	}
	//socket.onerror=function (event)  {}// not used because event passed contains no information
	socket.onclose = function (event) {
	console.log('socket closed')
	if (event.wasClean==true) {
	updateStatusText('socket closed, no server connection');
	}
	else {
		if(event.reason!=''){
			updateStatusText('Connection error. No server connection. Error: '+ event.reason);
		}
		else{
			if(event.code!=null){
				updateStatusText('Connection error. No server connection. WebSocket CloseEvent code: '+ event.code);
			}
			else{
				updateStatusText('Connection error. No server connection. No error information could be obtained. ');
			}
		}
	}
	}
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

function updateStatusText(text){
	game.status=text;
	status_info.innerText=game.status;
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
		//cell.owner=game.playerNum;
		socket.send('action'+
			'{'+ 
			'"action":"move",' +
			'"move":' +
			'{ "x":' + cell.x +
			', "y":' + cell.y +
			', "index":' + cell.index +
			'}' +
		'}')
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
	autoConnect();

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
			if(game.turn==true && cell.owner==null)
			{
			context.fillStyle='#BFC'
			context.fillRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
			}
			else
			{
			context.fillStyle='#888'
			context.fillRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
			}
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