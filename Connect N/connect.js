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
var lastActiveCell=null
for (x=0; x<gridSize.x; x=x+1){
		for (y=0; y<gridSize.y; y=y+1){
			spaces[x+gridSize.x*y]={
				origin:{x:x*cellWidth,y:y*cellHeight},
				active:false,
				owner:null
			};
		}
	}


var serverURL='ws://127.0.0.1:55555'
var socket = new WebSocket(serverURL);

socket.onopen = function (event) {
	socket.send('hi');
	//alert("Everything turned out OK. :)");
}
socket.onmessage = function (event) {
	//alert("Everything turned out OK. :)");
}
socket.onclose = function (event) {
	//alert("Everything turned out OK. :)");
}


function connectSetup()
{
	context = canvas.getContext("2d");

	input_callbacks.click=function (event) {
		console.log(event);
		event.canvasX=event.x-canvas.getBoundingClientRect().left;
		event.canvasY=event.y-canvas.getBoundingClientRect().top;
		var cell=getCell(event);
		cell.owner='me'
	};
	input_callbacks.mousemove=function (event) {
		event.canvasX=event.x-canvas.getBoundingClientRect().left;
		event.canvasY=event.y-canvas.getBoundingClientRect().top;
		cell=getCell(event);
		if (lastActiveCell!=null){
			lastActiveCell.active=false;
		}
		lastActiveCell=cell;
		cell.active=true;
		drawBoard();
	};
	
	
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
		if (cell.active)
		{
			context.fillStyle='#BFC'
			context.fillRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
		}
		if (cell.owner!=null)
		{
			context.fillStyle='#F33'
			context.beginPath();
			context.arc(cell.origin.x+cellWidth/2, cell.origin.y+cellHeight/2,Math.min(cellHeight,cellWidth)/2-2,2*Math.PI,false);
			context.fill();
			context.stroke();
		}
		context.strokeStyle='#000'
		context.strokeRect(cell.origin.x, cell.origin.y, cellWidth, cellHeight)
	}

}