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

GVector.prototype.toString = function()
{
	return "[object GVector " + "{" + "x:" + this.x + "y:" + this.y + "z:" + this.z + "}" + "]"
}

GVector.prototype.clone = function()
{
	return new GVector(this.x,this.y,this.z);
}
