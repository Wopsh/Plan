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

var canvas;
var input_callbacks ={
	mousemove:function mouseMoveCallback(event){},//event.movementY, event.clientY, event.screenY
	keypress:function keyPress(event){},//console.log({key_code:event.keyCode, key_char:event.charCode})},
	keyup:function keyUp(event){console.log({key_up_code:event.keyCode})},
	keydown:function keyDown(event){},//console.log({key_code:event.keyCode})}
	click:function keyDown(event){console.log(event);}//console.log({key_code:event.keyCode})}
};


function input_setup(setup_object){
	if(setup_object.canvas!=null){
		canvas=setup_object.canvas;
	}
	else{
		canvas=document.getElementById(setup_object.canvas_id);
	}
	prepare_multibrowser();
	if (setup_object.get_pointer_lock==true)
	{
		canvas.onclick=function (){
			canvas.requestPointerLock();
		}
	}
	canvas.addEventListener('mousemove', function(event){input_callbacks.mousemove(event);}, false);
	canvas.addEventListener('keyup', function(event){input_callbacks.keyup(event);}, false);
	canvas.addEventListener('keydown', function(event){input_callbacks.keydown(event);}, false);
	canvas.addEventListener('keypress', function(event){input_callbacks.keypress(event);}, false);
	canvas.addEventListener('click', function(event){input_callbacks.click(event);}, false);
	
}

function prepare_multibrowser(){
	//Why, browser vendors, would you do this to me?
	console.log('preparing multibrowser compatibility objects');
	canvas.requestPointerLock=	canvas.requestPointerLock||
								canvas.webkitRequestPointerLock||
								canvas.mozRequestPointerLock||
								canvas.oRequestPointerLock||
								canvas.msRequestPointerLock||
								function (){
									alert('Pointer Lock unsupported on this browser. Try using another one');};
}




function canvasOnClick(canvas){
		console.log('canvas clicked');
		canvas.requestPointerLock();
}