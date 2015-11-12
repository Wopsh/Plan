/*
game object reference
game={
	units:[],
	movers:[],
	collidables:[],
	fallers:[],
	players:[],
	syncedUp:[],
	syncedDown:[]
	ticTime:0
	}
*/





function Unit(){
/*
this.mesh
this.collidable
this.collisionMesh
*/
this.position=new GVector(0,0,0);  //share with mesh
this.collidable=false;
this.moves=false;
this.falls=false;
this.spawned=false;
this.sync=false;//sync to server
this.serverSetSyncID=null; //the server know which unit by an id it needs to set itself
this.clientSetSyncID=null; //the client sets an id 
}

Unit.nextClientSyncID=0;

Unit.prototype.getClientSyncID= function(){
this.clientSetSyncID=Unit.nextClientSyncID
Unit.nextClientSyncID+=1;
game.syncedUp[this.clientSetSyncID]=this;
}


Unit.prototype.makeMover=function(){
this.moves=true;
}


//u.mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,4),new THREE.MeshBasicMaterial({color:0x00ff00}))

Unit.prototype.spawn=function(){
if(this.mesh!=undefined){scene.add(this.mesh)}
game.units.push(this);
if(this.collidable){game.collidables.push(this)}
if(this.moves){game.movers.push(this)}
if(this.falls){game.fallers.push(this)}
this.spawned=true;
}

Unit.prototype.move=function(x,y,z){
this.position.set(x,y,z);
this.mesh.position.set(x,y,z);
}

Unit.prototype.syncUp=function(){
//send position sync info to server
if(this.clientSetSyncID==null)
{
	this.getClientSyncID()
	socket.send('JSON:'+ JSON.stringify({request:{serverSetSyncIDForClientSetSyncID:this.clientSetSyncID}}))
}
}

Unit.prototype.relativeMoveIfClear=function(v){
	var clear=true;
	var ox=this.mesh.position.x;
	var oy=this.mesh.position.y;
	var oz=this.mesh.position.z;
	for(var x=0; x<game.collidables.length; x++){
		if(game.units[x]!=this)
		{
			var other=game.units[x];
			if(this.collisionMesh.extendedCollision(other.collisionMesh,v)){clear=false}
		}
	}
	if(clear==true){this.move(ox+v.x,oy+v.y,oz+v.z); return true;} 
}

Unit.prototype.collidesOtherUnit=function(other)
{
return this.collisionMesh.collides(other.collisionMesh);
}

Unit.prototype.inertialMove=function(time){
if(time==null){time=game.ticTime}
x=this.position.x+this.speedV.x*game.ticTime/1000
y=this.position.x+this.speedV.y*game.ticTime/1000
z=this.position.x+this.speedV.z*game.ticTime/1000
this.move(x,y,z)
}



