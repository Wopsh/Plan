/*
Collision Vector "Class"
*/
"use strict"


console.log('collsion 2 starting')

function GVector(x,y,z)//constructor
{
	this.x=x;
	this.y=y;
	this.z=z;
}

GVector.prototype.dotProduct = function(b)
{
	return new GVector(this.x * b.x, this.y * b.y, this.z * b.z);
}

GVector.dotProduct = function(a,b)
{
	return new GVector(a.x * b.x, a.y * b.y, a.z * b.z);
}

GVector.crossProduct = function(a, b)
{
var nx = a.y * b.z - b.y * a.z
var ny = a.z * b.x - b.z * a.x
var nz = a.x * b.y - b.x * a.y
return new GVector(nx, ny, nz)
}



GVector.scalarProduct = function(vector,scalar)
{
	return new GVector(vector.x * scalar, vector.y * scalar, vector.z * scalar);
}
GVector.prototype.scalarProduct = function(scalar)
{
	return GVector.scalarProduct(this, scalar);
}

GVector.scalarQuotient = function(vector,scalar)
{
	return new GVector(vector.x / scalar, vector.y / scalar, vector.z / scalar);
}
GVector.prototype.scalarQuotient = function(scalar)
{
	return GVector.scalarQuotient(this, scalar);
}


GVector.prototype.sum=function(b)
{
	// this function, when called with no arguments returns a scalar Number.
	// else takes vector argument and returns sum of this vector with that vector as new vector
	if(arguments.length==0 && b==undefined)
	{
		return this.x + this.y + this.z;
	}
	else
	{
	return new GVector(this.x + b.x, this.y + b.y, this.z + b.z)
	}
}

GVector.sum=function (a, b)
{
	return new GVector(a.x + b.x, a.y + b.y, a.z + b.z)
}

GVector.difference=function (a, b)
{
	return new GVector(a.x - b.x, a.y - b.y, a.z - b.z)
}
GVector.prototype.difference=function (b)
{
	return GVector.difference(this,b)
}

GVector.prototype.length = function()
{
	var sumSquares=this.dotProduct(this).sum();
	var length = Math.sqrt(sumSquares);
	return length;
}


GVector.prototype.normal = function()
{
	var length = this.length();
	return this.scalarQuotient(length);
}

GVector.prototype.absoluteValue=function ()
{
	return new GVector(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
}

console.log('collsion 2 mid 0')


GVector.prototype.toString = function()
{
	return "[object GVector " + "{" + "x:" + this.x + "y:" + this.y + "z:" + this.z + "}" + "]"
}

GVector.prototype.clone = function()
{
	return new GVector(this.x,this.y,this.z);
}

console.log('collsion 2 mid 0.5')


/* 
Collision Plane "Class"
This class stores/describes planes using a point (found anywhere on the plane) and
a normal vector (one of two possible orthogonal vectors that point away from the plane).
The point gives the plane's position and the normal vector shows how the plane is inclined.

Sometimes it is important to distinguish the two sides of a plane.
The region of space that the normal points toward is considered the exterior side.
*/

function GPlane(point, normal)
{
	this.point=point;
	this.normal=normal;
}

console.log('collsion 2 mid 1')

GPlane.prototype.distanceToPoint = function(point)
{
	// v is a vector from the refence point of the plane to
	// the point we are calculating the distance to.
	var v = GVector.difference(point, this.point)
	var distance = Math.abs(GVector.dotProduct(this.normal,v).sum())// remove abs for signed distance
	return distance;
}

GPlane.prototype.isPointExterior = function(point)
{
	// v is a vector from the refence point of the plane to
	// the point we are calculating the distance to.
	var v = GVector.difference(point, this.point);
	var signed_distance = GVector.dotProduct(this.normal,v).sum();
	return signed_distance > 0;
}


function GTriangle(pointA, pointB, pointC)
{
	this.a=pointA.clone()
	this.b=pointB.clone()
	this.c=pointC.clone()
}

GTriangle.prototype.normal = function triangleNormal(){
// the points on the triangle (a,b, and c) should appear counerclockwise
// on the side of the triangle that the chosen normal points to. This is
// to be consistent with openGL conventions.
var a =new GVector(this.c.x-this.a.x, this.c.y-this.a.y, this.c.z-this.a.z);
var b =new GVector(this.b.x-this.a.x, this.b.y-this.a.y, this.b.z-this.a.z);
return GVector.crossProduct(a, b).normal();
}

GTriangle.prototype.plane = function triangleNormal(){
return new GPlane(this.a, this.normal())
}


GTriangle.prototype.edgePlanes = function(){
	//TODO:? use crossproduct directly to get planes no need to make a triangle.
	var normal = this.normal()
	var ab = (new GTriangle(this.a, this.b, this.a.sum(normal))).plane()
	var bc = (new GTriangle(this.b, this.c, this.b.sum(normal))).plane()
	var ca = (new GTriangle(this.c, this.a, this.c.sum(normal))).plane()
	return [ab,bc,ca];

}

console.log('collsion 2 mid 2')



function GLine(PointA, PointB){
	this.a = PointA.clone()
	this.b = PointB.clone()

}

GLine.prototype.crossesPlane=function(plane){
	return plane.isPointExterior(this.a)!=plane.isPointExterior(this.b)
}


var GDemo =
{
	xZPlane:new GPlane(new GVector(0,0,0), new GVector(0,1,0)),
	negSlopePlane:new GPlane(new GVector(0,0,0), (new GVector(1,1,1)).normal()),
	negSlopePlane2:new GPlane(new GVector(10,10,10), (new GVector(1,1,1)).normal()),
	negSlopePlane3:new GPlane(new GVector(0,0,0), (new GVector(1,1,0)).normal()),
	origin:new GVector(0,0,0),
	y1:new GVector(0,1,0),
	yneg1:new GVector(0,-1,0),
	x1:new GVector(1,0,0),
	tri:new GTriangle(new GVector(0,0,0), new GVector(1,0,0), new GVector(0,1,0)),
	line:new GLine(new GVector(0,0,0),new GVector(0,-1,0))
};


function GCollisionMesh(THREEMesh){
var faces=THREEMesh.faces
var vertices=THREEMesh.vertices
var lines=[]
for(var i=0; i<faces.length; i++){
	lines.push(new GVector(vertices[faces[i].a], new GVector(vertices[faces[i].b]);
	lines.push(new GVector(vertices[faces[i].b], new GVector(vertices[faces[i].c]);
	lines.push(new GVector(vertices[faces[i].c], new GVector(vertices[faces[i].a]);
}
return lines
}

console.log('collsion 2 ok')

