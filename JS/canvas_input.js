//This library takes a canvas.

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
function CanvasInputHandler(canvas)
{
	this.SPACE=32;
	this.LEFT=37;
	this.UP=38;
	this.DOWN=40;
	this.RIGHT=39;
	
	this.callbacks=
	{
		mousemove:function mouseMoveCallback(event){},//event.movementY, event.clientY, event.screenY
		keypress:function keyPress(event){},//console.log({key_code:event.keyCode, key_char:event.charCode}),
		keyup:function keyUp(event){},//console.log({key_up_code:event.keyCode})
		keydown:function keyDown(event){},//console.log({key_code:event.keyCode})
		click:function keyDown(event){}//console.log({key_code:event.keyCode})
	};
	this.keyStates=[];
	var callbacks=this.callbacks
	var keyStates=this.keyStates
	keyUpStaeHandler=function(event)
	{
		keyStates[event.keyCode]='UP';
		if((event.keyCode>=65 && event.keyCode<=90) || (event.keyCode>=97 && event.keyCode<=122))
		{
			keyStates[String.fromCharCode(event.keyCode).toUpperCase()]='UP'
			keyStates[String.fromCharCode(event.keyCode).toLowerCase()]='UP'
		}
	}
	keyDownStateHandler=function (event)
	{
		keyStates[event.keyCode]='DOWN';
		if((event.keyCode>=65 && event.keyCode<=90) || (event.keyCode>=97 && event.keyCode<=122))
		{
			keyStates[String.fromCharCode(event.keyCode).toUpperCase()]='DOWN'
			keyStates[String.fromCharCode(event.keyCode).toLowerCase()]='DOWN'
		}
	};
	canvas.addEventListener('mousemove', function(event){callbacks.mousemove(event);}, false);
	canvas.addEventListener('keyup', function(event){callbacks.keyup(event); keyUpStaeHandler(event);}, false);
	canvas.addEventListener('keydown', function(event){callbacks.keydown(event); keyDownStateHandler(event);}, false);
	canvas.addEventListener('keypress', function(event){callbacks.keypress(event);}, false);
	canvas.addEventListener('click', function(event){callbacks.click(event);}, false);
}


