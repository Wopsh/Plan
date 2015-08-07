/// the big code testing mudball


var scene, camera, renderer, canvas;
var units=[];
var ground;
var box, square, box2;
var lookAt=new THREE.Vector3(0,0,-1)

var keyStates=[];

var LEFT=37;
var UP=38;
var DOWN=40;
var RIGHT=39;

var groundHeight=-10
var playerHeight=10

var lastFrameTime=0; // update with window.performance.now()
var lastRenderTime=0;

var game={player:{}, opponent:{pos:{x:0,y:0,z:0}}}
var actions={
				spawn:	function(){
						//console.log("spawned! (not really this is a dummy action)")
						}
			}


var player={
	pos:{x:0,y:0,z:0},
	rot:0, //0 is negative zeeward. expressed in radians
	lookVert:0, //expressed in percent!
	speeds:{x:0,y:0,z:0}
};
game.player=player;

var f1,f2,f3,f4;

function setup(){
	//canvas = document.getElementById('canvas')
	input_setup({canvas_id:'canvas', get_pointer_lock:false})
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 720.0/480.0, 0.1, 40000);
	camera.up = new THREE.Vector3(0,1,0);//Dont forget to set camera.up (this makes camera.lookAt work)
	camera.lookAt(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

	var boxg = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshLambertMaterial( { color:0xff0000, ambient: 0xff0000});
	var materialBlue = new THREE.MeshLambertMaterial( { color:0x0000ff, ambient: 0x0000ff});
	var material2 = new THREE.MeshBasicMaterial({shading: THREE.FlatShading, vertexColors: THREE.VertexColors});
	//var material3 = new THREE.MeshLambertMaterial({color:0xFFFFFF, emissive:0x000000, map: THREE.ImageUtils.loadTexture('texture/seamless/grass4_512.jpg')});
	var c= new THREE.Color( 0xffaa00 );
	box =  new THREE.Mesh(boxg, material);
	box2 =  new THREE.Mesh(boxg, materialBlue);
	var dLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
	dLight.position.set(0.1*(Math.random()-0.5),1,0.1*(Math.random()-0.5));
	var aLight = new THREE.AmbientLight( 0x666666);
	box.position.set(0,0,-4);

	//overwirtes old geometry
	geometry=quad_geom([{x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:1,y:1,z:0}, {x:0,y:1,z:0}]);
	add_quad([{x:0,y:1,z:0}, {x:1,y:1,z:0}, {x:1,y:0,z:0}, {x:0,y:0,z:0}], geometry);
	add_quad([{x:0,y:0,z:0}, {x:0,y:0,z:1}, {x:0,y:1,z:1}, {x:0,y:1,z:0}], geometry);
	add_quad([{x:0,y:1,z:0}, {x:0,y:1,z:1}, {x:0,y:0,z:1}, {x:0,y:0,z:0}], geometry);
	
	square = new THREE.Mesh( geometry, material );
	square.position.set( -3, 0, -4 );
	
	scene.add( square );

	scene.add( aLight );
	scene.add( dLight );
	scene.add( box );
	scene.add( box2 );
	skybox();

	make_ground();
	scene.add(ground);

	input_callbacks.keyup=function (event){
	console.log(event.keyCode);
	console.log(event);
	keyStates[event.keyCode]='UP';
	if((event.keyCode>=65 && event.keyCode<=90) || (event.keyCode>=97 && event.keyCode<=122))
	{
		keyStates[String.fromCharCode(event.keyCode).toUpperCase()]='UP'
		keyStates[String.fromCharCode(event.keyCode).toLowerCase()]='UP'
	}
	}

	input_callbacks.keydown=function (event){
		//console.log(event.keyCode);
		keyStates[event.keyCode]='DOWN';
		if((event.keyCode>=65 && event.keyCode<=90) || (event.keyCode>=97 && event.keyCode<=122))
		{
			keyStates[String.fromCharCode(event.keyCode).toUpperCase()]='DOWN'
			keyStates[String.fromCharCode(event.keyCode).toLowerCase()]='DOWN'
	}
}

//Network

var last_position_data_sent_to_server=""
var pulse=function(){
	if(game.connected==true)
	{
		var pingstart = window.performance.now()
		var move =	{
						pos:player.pos,
						rot:player.rot
		
					};
		if (last_position_data_sent_to_server!=JSON.stringify(move))
		{
			socket.send('{"player_update":' + JSON.stringify(move) +'}' );
			last_position_data_sent_to_server=JSON.stringify(move);
		}
	}
	//console.log('pulse')

};
setInterval(pulse,2);//timing needs to be much much much better that this



render();

//alert('do more work');
}


function fps(){
	return 1000/lastRenderTime;
}

function make_ground()
{
	var size=2000
	var groundGeometry = quad_geom([{x:-size,y:groundHeight,z:-size},{x:-size,y:groundHeight,z:size},{x:size,y:groundHeight,z:size},{x:size,y:groundHeight,z:-size}]);
	//var texture=THREE.ImageUtils.loadTexture('textures/seamless/grass256.png')
	//var texture=THREE.ImageUtils.loadTexture('textures/seamless/LushGrass1024.png')
	var texture=THREE.ImageUtils.loadTexture('textures/seamless/LushGrass512.png')
	var wrap=THREE.RepeatWrapping; // alt MirroredRepeatWrapping
	texture.wrapS = THREE.wrap; 
	texture.wrapT = THREE.wrap;
	texture.anisotropy = 2;
	var material = new THREE.MeshBasicMaterial( { color:0xaaeeaa, map:texture});
	var repeat=100;//200;
	var uv1=new THREE.Vector2(0, 0);
	var uv2=new THREE.Vector2(repeat, 0);
	var uv3=new THREE.Vector2(repeat, repeat);
	var uv4=new THREE.Vector2(0, repeat);
	groundGeometry.faceVertexUvs[0][0] = ([uv1, uv2, uv3]);
	groundGeometry.faceVertexUvs[0][1] = ([uv1, uv3, uv4]);//shallow copy is fine with me
	ground=new THREE.Mesh(groundGeometry, material);

}


function render() {
	/*
	reference http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	w 	87
	a   65
	s 	83
	d   68
	*/
	if(keyStates[UP]==='DOWN'){
		player.pos.z-=Math.cos(player.rot);
		player.pos.x+=Math.sin(player.rot);
	}
	if(keyStates[DOWN]==='DOWN'){
		player.pos.z+=Math.cos(player.rot);
		player.pos.x-=Math.sin(player.rot);
	}
	if(keyStates[LEFT]==='DOWN'){
		player.rot-=0.08;
	}
	if(keyStates[RIGHT]==='DOWN'){
		player.rot+=0.08;
	}
	if(keyStates[87]==='DOWN'){ // i.e. the 'space' key is down
		player.lookVert+=0.08;
		if(player.lookVert>Math.PI/2)player.lookVert=Math.PI/2;
		//console.log('w key');
	}
	if(keyStates[83]==='DOWN'){ // i.e. the 'space' key is down
		player.lookVert-=0.08;
		if(player.lookVert<-Math.PI/2)player.lookVert=-Math.PI/2;
		//console.log('s key');
	}
	if(keyStates[32]==='DOWN'){ // i.e. the 'space' key is down
		//player.lookVert-=0.08;
		if(player.pos.y<=groundHeight+playerHeight) player.speeds.y+=50;
		//if(player.lookVert<-Math.PI/2)player.lookVert=-Math.PI/2;
	}
	if(keyStates['p']==='DOWN'){ // i.e. the 'space' key is down
		game.paused=true;
	}
	
	box2.position.set(game.opponent.pos.x, game.opponent.pos.y, game.opponent.pos.z)
	
	
	//camera.rotation.y=-player.rot;
	box.rotation.x+=0.01;
	box.rotation.y+=0.03333333333;
	box.rotation.z+=0.00777777777;
	
	square.rotation.z+=0.00;
	square.rotation.x+=0.03;
	square.rotation.y+=0.03;
	
	
	//move according to speeds
	player.pos.y+=player.speeds.y/60;
	
	if(player.pos.y>groundHeight+playerHeight){player.speeds.y-=9.8/10;}
	if(player.pos.y<groundHeight+playerHeight){
		player.pos.y=groundHeight+playerHeight;
		player.speeds.y=0;
	}
	
	//console.log('frame rendering...');
	/*
	if(player.lookVert>=0)lookAt.y=player.lookVert/(100-player.lookVert)
	if(player.lookVert<0)lookAt.y=player.lookVert/(100+player.lookVert)
	*/
	if(player.lookVert>=0)lookAt.y=Math.sin(player.lookVert)/(1-Math.sin(player.lookVert))
	if(player.lookVert<0)lookAt.y=-Math.sin(-player.lookVert)/(1-Math.sin(-player.lookVert))
	if(lookAt.y==Infinity)lookAt.y=99999999999;
	if(lookAt.y==-Infinity)lookAt.y=-9999999999;
	
	camera.position.set(player.pos.x,player.pos.y,player.pos.z)
	lookAt.x=Math.sin(player.rot)
	lookAt.z=-Math.cos(player.rot)
	var finalLookAt=new THREE.Vector3(lookAt.x + player.pos.x, lookAt.y + player.pos.y, lookAt.z + player.pos.z)
	camera.lookAt(finalLookAt);
	
	if(game.paused !=true)
	{
	renderer.render(scene, camera);
	}
	
	lastRenderTime= window.performance.now()-lastFrameTime;
	lastFrameTime= window.performance.now();
	requestAnimationFrame(render);
	
}

function skybox(){
// load textures
var textureName='interstellar';
var extension ='png';
upTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_up.' + extension)
leftTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_left.' + extension)
frontTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_front.' + extension)
backTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_back.' + extension)
rightTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_right.' + extension)
//TODO: down?? 


//size of skybox
var size=20000
var p=size/2  // 'p' for positive 'n' for negative
var n=-size/2 
var yA=000; // y adjust
var colorAdjust=0x9944DD

var upMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: upTexture});
var leftMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: leftTexture});
var frontMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: frontTexture});
var backMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: backTexture});
var rightMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: rightTexture});

var upGeometry=quad_geom([{x:n, y:p + yA, z:n}, {x:p, y:p + yA, z:n}, {x:p, y:p + yA, z:p}, {x:n, y:p + yA, z:p}]);
var leftGeometry=quad_geom([{x:n, y:n + yA, z:p}, {x:n, y:n + yA, z:n}, {x:n, y:p + yA, z:n}, {x:n, y:p + yA, z:p}]);
var frontGeometry=quad_geom([{x:n, y:n + yA, z:n}, {x:p, y:n + yA, z:n}, {x:p, y:p + yA, z:n}, {x:n, y:p + yA, z:n}]);
var rightGeometry=quad_geom([{x:p, y:n + yA, z:n}, {x:p, y:n + yA, z:p}, {x:p, y:p + yA, z:p}, {x:p, y:p + yA, z:n}]);
var backGeometry=quad_geom([{x:p, y:n + yA, z:p}, {x:n, y:n + yA, z:p}, {x:n, y:p + yA, z:p}, {x:p, y:p + yA, z:p}]);

var up= new THREE.Mesh(upGeometry,upMaterial)
var left= new THREE.Mesh(leftGeometry,leftMaterial)
var front= new THREE.Mesh(frontGeometry,frontMaterial)
var back= new THREE.Mesh(backGeometry,backMaterial)
var right= new THREE.Mesh(rightGeometry,rightMaterial)


scene.add(up);
scene.add(left);
scene.add(front);
scene.add(back);
scene.add(right);
}

