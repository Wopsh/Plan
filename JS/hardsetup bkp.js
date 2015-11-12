/*

//making a unit
wall=new Unit()
wall.model=new THREE.Mesh ...
wall.moves=false
wall.collides=true
wall.collionsionMesh=wall.autoCollisonMesh
wall.move(...)
wall.spawn() // adds to game lists for collision/moving
// mirror clone?
wall2=wall.clone()
wall2.move(...)
wall2.spawn()

//

*/

var player
var mouseMove=null;
var pointerLocked=false;


function hardsetup()
{

function quad_geom(points){
	// the argument points contains four xyz coordiante objects
	var geometry = new THREE.Geometry()
	for(var i=0; i<4; i++)
	{
		geometry.vertices.push( new THREE.Vector3( points[i].x, points[i].y, points[i].z ) );
	}
	var normal = triangleNormalTHREE(points[0],points[1],points[2]);
	geometry.faces.push( new THREE.Face3( 0, 1, 2, normal ) );
	geometry.faces.push( new THREE.Face3( 0, 2, 3, normal ) );
	
	//Set up default UV coordinates
	var uv1=new THREE.Vector2(0, 0);
	var uv2=new THREE.Vector2(1, 0);
	var uv3=new THREE.Vector2(1, 1);
	var uv4=new THREE.Vector2(0, 1);
	geometry.faceVertexUvs[0][0] = ([uv1, uv2, uv3]);
	geometry.faceVertexUvs[0][1] = ([uv1, uv3, uv4]);//shallow copy is fine with me
	
	return geometry	
}

function groundMesh()
{
	var size=2000
	var groundHeight=0;
	var groundGeometry = quad_geom([{x:-size,y:groundHeight,z:-size},{x:-size,y:groundHeight,z:size},{x:size,y:groundHeight,z:size},{x:size,y:groundHeight,z:-size}]);
	//var texture=THREE.ImageUtils.loadTexture('textures/seamless/grass512.png')
	//var texture=THREE.ImageUtils.loadTexture('textures/seamless/LushGrass1024.png')
	var texture=THREE.ImageUtils.loadTexture('textures/seamless/LushGrass256.png')
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
	var ground=new THREE.Mesh(groundGeometry, material);
	return ground;

}

ground=new Unit()
ground.mesh=groundMesh();
//new THREE.Mesh(new THREE.BoxGeometry(30,1,20),new THREE.MeshBasicMaterial({color:0x00ff00}))
ground.move(0,-2,0)
ground.collisionMesh=new GCollisionMesh(ground.mesh);
ground.collidable=true;
ground.spawn()


skybox();


player={
	pos:{x:0,y:0,z:0},
	rot:0, //0 is negative zeeward. expressed in radians
	lookVertRot:0, //expressed in radians ranges from (more than -PI/2) down to (less than PI/2) up
	speed:0
};
player.unit=new Unit();
player.unit.mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff00ff, ambient:0x550055}))
player.unit.collisionMesh=new GCollisionMesh(player.unit.mesh);
player.unit.collidable=true
player.unit.falls=true
player.unit.spawn()

function getMouseMove(event){
var moveX= event.movementX ||
	   event.mozMovementX ||
	   event.webkitMovementX ||
	   event.msMovementX ||
	   event.oMovementX ||
	   0;
var moveY= event.movementY ||
	   event.mozMovementY ||
	   event.webkitMovementY ||
	   event.msMovementY ||
	   event.oMovementY ||
	   0;
	   
return {x:moveX, y:moveY}
}


input.callbacks.mousemove=function(e){mouseMove=getMouseMove(e)}


// rename? this isn't a callback or is it? its not really getting passed right now.
frameCallback=function(){
	updateBeginTime=window.performance.now()
	canvas.onmousedown=function(){console.log('yep'); canvas.mozRequestPointerLock(); locked=true;}
	if(mouseMove!=null)
	{
		player.rot+=mouseMove.x/-100; // 100 is arbitrary but movement in screen pixels needs to be converted to a small amount of radians
		player.lookVertRot+=mouseMove.y/-100;
	}
	if(input.keyStates[input.SPACE]=='DOWN') 
	{
		player.pos.y+=3;
	}
	if(input.keyStates[input.UP]=='DOWN') 
	{
		player.speed=1.0
		player.pos.x+=-Math.sin(player.rot)
		player.pos.z+=-Math.cos(player.rot)
	}
	else
	{
		player.speed=0
	}
	//player.unit.relativeMoveIfClear(new GVector(0,-0.1,0))
	if(input.keyStates[input.DOWN]=='DOWN') {}
	if(input.keyStates[input.LEFT]=='DOWN') {}
	if(input.keyStates[input.RIGHT]=='DOWN') {}
	var lookVector=new GVector(0,0,-1)
	if(player.lookVertRot>Math.PI*0.49){player.lookVertRot=Math.PI*0.49}
	if(player.lookVertRot<-Math.PI*0.49){player.lookVertRot=-Math.PI*0.49}
	lookVector=lookVector.rotateX(player.lookVertRot);
	lookVector=lookVector.rotateY(player.rot);
	camera.position.set(player.pos.x, player.pos.y, player.pos.z);
	camera.lookAt(new THREE.Vector3(player.pos.x+lookVector.x, player.pos.y+lookVector.y, player.pos.z+lookVector.z));
	mouseMove=null
	game.lastUpdateBeginTime=updateBeginTime
}

function skybox(){
// load textures
var textureName='interstellar';
var extension ='png';
var useDown=true;

var upTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_up.' + extension)
var leftTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_left.' + extension)
var frontTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_front.' + extension)
var backTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_back.' + extension)
var rightTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_right.' + extension)
if(useDown) downTexture=THREE.ImageUtils.loadTexture('textures/skyboxes/' + textureName + '_down.' + extension)


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
if(useDown) var downMaterial = new THREE.MeshBasicMaterial({color:colorAdjust, map: downTexture});

var upGeometry=quad_geom([{x:n, y:p + yA, z:n}, {x:p, y:p + yA, z:n}, {x:p, y:p + yA, z:p}, {x:n, y:p + yA, z:p}]);
var leftGeometry=quad_geom([{x:n, y:n + yA, z:p}, {x:n, y:n + yA, z:n}, {x:n, y:p + yA, z:n}, {x:n, y:p + yA, z:p}]);
var frontGeometry=quad_geom([{x:n, y:n + yA, z:n}, {x:p, y:n + yA, z:n}, {x:p, y:p + yA, z:n}, {x:n, y:p + yA, z:n}]);
var rightGeometry=quad_geom([{x:p, y:n + yA, z:n}, {x:p, y:n + yA, z:p}, {x:p, y:p + yA, z:p}, {x:p, y:p + yA, z:n}]);
var backGeometry=quad_geom([{x:p, y:n + yA, z:p}, {x:n, y:n + yA, z:p}, {x:n, y:p + yA, z:p}, {x:p, y:p + yA, z:p}]);
if(useDown) var downGeometry=quad_geom([{x:n, y:n + yA, z:p}, {x:p, y:n + yA, z:p}, {x:p, y:n + yA, z:n}, {x:n, y:n + yA, z:n}]);

var up= new THREE.Mesh(upGeometry,upMaterial)
var left= new THREE.Mesh(leftGeometry,leftMaterial)
var front= new THREE.Mesh(frontGeometry,frontMaterial)
var back= new THREE.Mesh(backGeometry,backMaterial)
var right= new THREE.Mesh(rightGeometry,rightMaterial)
if(useDown) var down= new THREE.Mesh(downGeometry,downMaterial)

scene.add(up);
scene.add(left);
scene.add(front);
scene.add(back);
scene.add(right);
if(useDown) scene.add(down);
}
}