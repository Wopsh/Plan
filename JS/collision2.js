/*
Collision Vector "Class"
*/
"use strict"



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

GVector.prototype.toString = function()
{
	return "[object GVector " + "{" + "x:" + this.x + "y:" + this.y + "z:" + this.z + "}" + "]"
}

GVector.prototype.clone = function()
{
	return new GVector(this.x,this.y,this.z);
}



/* 
Collision Plane "Class"
This class stores/describes planes using a point (found anywhere on the plane) and
a normal vector (one of two possible orthogonal vectors that point away from the plane).
The point gives the plane's position and the normal vector shows how the plane is inclined.

Sometimes it is important to distinguish the two sides of a plane.
The region of space that the normal points toward is considered the exterior side.
*/

GPlane = function(point, normal){
	this.point=point;
	this.normal=normal;
}

GPlane.prototype.distanceToPoint(point)
{
	// v is a vector from the refence point of the plane to
	// the point we are calculating the distance to.
	var v = GVector.difference(point, this.point)
	var distance = GVector.dotProduct(this.normal,v).absoluteValue()

}


/*
GDemo contains sample instances of geometry classes

*/

GDemo =
{
	xZPlane:new GPLane(new GVector(0,0,0), new GVector(0,1,0))
}

