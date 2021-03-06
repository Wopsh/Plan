/* collison library
TODO: slope collision resolution
		change movement to be parallel with slope/shorter! prefer slope climb to truncation
				parallel creates gap chose intercept aproximation?
		
TODO: box collisions (includes rotation)
TODO: bounds collisions
TODO: movement truncation



add extendy move function to collision mesh
e.g. extend(v) where v is gvector(4,0,0)
extendedlines=[]
extendedtris=[]
for every line l 
	make new line(l.a.sum(v),l.b.sum(v)) l2
	//make two triangles
	t2a=new triangle(l.a,l2.a,l2.b)
	t2b=new triangle(l.b,l2.a,l2.b)
	
	extendedlines.push(l2)
	extendedlines.push(line(l.a,l2.a))
	extendedlines.push(line(l.b,l2.b))
	extendedtris.push(t2a)
	extendedtris.push(t2b)
for every tri t
	extendedtris.push(new tri(t.a.sum(v),t.b.sum(v),t.c.sum(v)))
the effect is to create a 3d trail along vector v to show movement is possible/impossible along
that vector. this prevents large movements from clipping through things


function extendedCollision(other,v){
var extendedLines=[]
var extendedTris=[]
for(var i=0; i<this.lines.length; i++)
	{
		var line=this.lines[i]
		line=this.rotatedLine(line)
		line=this.translatedLine(line)
		line2=new GLine(line.a.sum(v),line.b.sum(v)) // line translated by movement vector
		triA=new GTriangle(line.a,line2.a,line2.b)
		triB=new GTriangle(line.b,line2.a,line2.b)
		extendedLines.push(line2)
		extendedLines.push(line(line.a,line2.a))
		extendedLines.push(line(line.b,line2.b))
		extendedTris.push(triA)
		extendedTris.push(triB)
	}
for(var i=0; i<this.tris.length; i++)
	{
		var tri=this.tris[i]
		tri=this.rotatedTriangle(tri)
		tri=this.translatedTriangle(tri)
		extendedTris.push(tri.translation(v))
		}
}



*/

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

GVector.prototype.constructionString=function(){
	return 'new GVector('+this.x+', '+this.y+', '+this.z+')';
}

GVector.prototype.set=function(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
}

GVector.prototype.intrinsicRotateXYZ=function(xRotation,yRotation,zRotation){
	//uses extrinsic rotations in reverse order
	return this.rotateZ(zRotation).rotateY(yRotation).rotateX(xRotation)

}

GVector.prototype.rotateX=function(xRotation){
var ca=Math.cos(-xRotation)
var sa=Math.sin(-xRotation)
var ny=this.y * ca + this.z * sa
var nz=this.z * ca - this.y * sa
return new GVector(this.x,ny,nz)
}

GVector.prototype.rotateY=function(yRotation){
var ca=Math.cos(-yRotation)
var sa=Math.sin(-yRotation)
var nx=this.x * ca - this.z * sa
var nz=this.z * ca + this.x * sa
return new GVector(nx,this.y,nz)
}

GVector.prototype.rotateZ=function(zRotation){
var ca=Math.cos(-zRotation)
var sa=Math.sin(-zRotation)
var nx=this.x * ca + this.y * sa
var ny=this.y * ca - this.x * sa
return new GVector(nx,ny,this.z)
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

GVector.scalarQuotient = function(vector,scalar) //TODO: rename divide by scalar
{
	return new GVector(vector.x/scalar, vector.y/scalar, vector.z/scalar);
}
GVector.prototype.scalarQuotient = function(scalar)
{
	return GVector.scalarQuotient(this, scalar);
}


GVector.prototype.sum=function(b)
{
	// this function, when called with no arguments returns a scalar Number.
	// else takes vector argument and returns sum of this vector with that vector as new vector
	if(b!=undefined)
	{
		return new GVector(this.x + b.x, this.y + b.y, this.z + b.z)
	}
	return this.x + this.y + this.z
}

GVector.sum=function (a, b)
{
	return new GVector(a.x + b.x, a.y + b.y, a.z + b.z)
}

GVector.average=function (manyArgs)
{
	var total=new GVector(0,0,0)
	for(var i=0; i<arguments.length; i++)
	{
		total = total.sum(arguments[i])
	}
	return total.scalarQuotient(arguments.length)
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

GVector.prototype.equals=function (equalsArgVectorB)
{
	return this.x==equalsArgVectorB.x && this.y==equalsArgVectorB.y && this.z ==equalsArgVectorB.z;
}



GVector.prototype.toString = function()
{
	return "[object GVector " + "{" + "x:" + this.x + "y:" + this.y + "z:" + this.z + "}" + "]"
}

GVector.prototype.clone = function()
{
	return new GVector(this.x,this.y,this.z);
}

GVector.prototype.THREEVector3 = function()
{
	return new THREE.Vector3(this.x,this.y,this.z);
}


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


/*
Test Theory
THEORY: scalar sum of the components of the dot product of a vector V with a
normal vector N is the length that the vector V moves along the axis defined by
the normal vector N.

e.g. given normal N and vector V:
	The signed length V extends along the axis defined by N is
		scalarSum(dotProduct(N,V))
*/

GPlane.prototype.distanceToPoint = function(point)
{
	// v is a vector from the refence point of the plane to
	// the point we are calculating the distance to.
	var v = GVector.difference(point, this.point)
	var distance = Math.abs(GVector.dotProduct(this.normal,v).sum())// remove abs for signed distance
	return distance;
}

GPlane.prototype.signedDistanceToPoint = function(point)
{
	// v is a vector from the refence point of the plane to
	// the point we are calculating the distance to.
	// distance is 
	var v = GVector.difference(point, this.point)
	var distance = GVector.dotProduct(this.normal,v).sum()
	return distance;
}

GPlane.prototype.crossedByLine = function(line)
{
	var aDist=this.signedDistanceToPoint(line.a)
	var bDist=this.signedDistanceToPoint(line.b)
	return aDist * bDist < 0

}

GPlane.prototype.isLineParallel = function(line)
{
	var aDist=this.signedDistanceToPoint(line.a)
	var bDist=this.signedDistanceToPoint(line.b)
	return aDist==0 && bDist==0;
}

GPlane.prototype.crossingPointOfLine = function(line)
{
	if(this.isLineParallel(line)){throw "line is parallel crossingPointOfline is null "; return null;}
	if(!this.touchedByLine(line)){throw "line does not touch crossingPointOfline null result"; return null;}
	var dist = this.distanceToPoint(line.a)
	var approachRateAtoB = Math.abs(this.signedDistanceOnNormalAxis(line.aToB().normal()))
	var approachLength = dist/approachRateAtoB
	var approachVector = line.aToB().normal().scalarProduct(approachLength)
	return GVector.sum(approachVector, line.a)
}

GPlane.prototype.touchedByLine= function(line)
{
	var aDist=this.signedDistanceToPoint(line.a)
	var bDist=this.signedDistanceToPoint(line.b)
	return (aDist * bDist < 0) || (aDist * bDist == 0)
}


GPlane.prototype.signedDistanceOnNormalAxis = function(vector)
{
	return GVector.dotProduct(this.normal, vector).sum()
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

GTriangle.prototype.translation=function(v)
{
	return new GTriangle(this.a.sum(v),this.b.sum(v),this.c.sum(v))
}

GTriangle.prototype.constructionString = function(){
	var string='new GTriangle('
	string=string+this.a.constructionString() + ', ';
	string=string+this.b.constructionString() + ', ';
	string=string+this.c.constructionString() + ')';
	return string
}

GTriangle.prototype.normal = function(){
// the points on the triangle (a,b, and c) should appear counerclockwise
// on the side of the triangle that the chosen normal points to. This is
// to be consistent with openGL conventions.
var a =new GVector(this.c.x-this.a.x, this.c.y-this.a.y, this.c.z-this.a.z);
var b =new GVector(this.b.x-this.a.x, this.b.y-this.a.y, this.b.z-this.a.z);
return GVector.crossProduct(a, b).normal();
}

GTriangle.prototype.centroid = function(){
return GVector.average(this.a, this.b, this.c)
}

GTriangle.prototype.plane = function(){
return new GPlane(this.a, this.normal())
}

GTriangle.prototype.clone=function(){
	return new GTriangle(this.a, this.b, this.c);
}

GTriangle.prototype.THREEMesh = function(){
	var material = new THREE.MeshBasicMaterial({color:0x222288})
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.a.THREEVector3())
	geometry.vertices.push(this.b.THREEVector3())
	geometry.vertices.push(this.c.THREEVector3())
	geometry.faces.push(new THREE.Face3(0,1,2))
	geometry.faces.push(new THREE.Face3(2,1,0))
	return new THREE.Mesh(geometry, material)
}


GTriangle.prototype.edgePlanes = function(){
	//TODO:? use crossproduct directly to get planes no need to make a triangle.
	//TODO: ensure that edgeplane normals point outward
	var centroid = this.centroid();
	// exterior signed distance to centroid should be negative
	var normal = this.normal()
	var ab = (new GTriangle(this.a, this.b, this.a.sum(normal))).plane()
	var bc = (new GTriangle(this.b, this.c, this.b.sum(normal))).plane()
	var ca = (new GTriangle(this.c, this.a, this.c.sum(normal))).plane()
	/*
	there used to be a warning if the normal faced towards the centroid
	if(ab.isPointExterior(centroid)){console.log("warning: ab edgeplane normal was inverted"); ab.normal=ab.normal.scalarProduct(-1)}
	if(bc.isPointExterior(centroid)){console.log("warning: bc edgeplane  normal was inverted"); bc.normal=bc.normal.scalarProduct(-1)}
	if(ca.isPointExterior(centroid)){console.log("warning: ca edgeplane normal was inverted"); ca.normal=ca.normal.scalarProduct(-1)}
	*/
	if(ab.isPointExterior(centroid)){ab.normal=ab.normal.scalarProduct(-1)}
	if(bc.isPointExterior(centroid)){bc.normal=bc.normal.scalarProduct(-1)}
	if(ca.isPointExterior(centroid)){ca.normal=ca.normal.scalarProduct(-1)}
	return [ab,bc,ca];
}

GTriangle.prototype.crossedByLine = function(line){
	// if line does not cross main plane return false
	// if line crosses main plane find crossing point
	// if crossing point within edgeplanes return true
	var edgePlanes=this.edgePlanes()
	if(this.plane().isLineParallel(line))
	{
		if
			(
				!edgePlanes[0].isPointExterior(line.a) &&
				!edgePlanes[1].isPointExterior(line.a) &&
				!edgePlanes[2].isPointExterior(line.a)
			){return true;}
		if
			(
				!edgePlanes[0].isPointExterior(line.b) &&
				!edgePlanes[1].isPointExterior(line.b) &&
				!edgePlanes[2].isPointExterior(line.b)
			){return true;}
		return false;
	}
	if(!this.plane().touchedByLine(line))return false;
	var crossingpoint = this.plane().crossingPointOfLine(line);
	if(edgePlanes[0].isPointExterior(crossingpoint))return false;
	if(edgePlanes[1].isPointExterior(crossingpoint))return false;
	if(edgePlanes[2].isPointExterior(crossingpoint))return false;
	return true;
	
}





function GLine(PointA, PointB){
	this.a = PointA.clone()
	this.b = PointB.clone()

}

GLine.prototype.THREELine = function(){
	var material = new THREE.LineBasicMaterial({color:0xFF55FF})
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.a.THREEVector3())
	geometry.vertices.push(this.b.THREEVector3())
	return new THREE.Line(geometry, material, THREE.LinePieces)
}

GLine.prototype.construnctionString=function(){
	var string='new GLine('
	string=string+this.a.constructionString() + ', ';
	string=string+this.b.constructionString() + ')';
	return string
}

GLine.prototype.aToB=function(){
	return GVector.difference(this.b,this.a);
}

GLine.prototype.bToA=function(){
	return GVector.difference(this.a,this.b);
}

GLine.prototype.crossesPlane=function(plane){
	return plane.isPointExterior(this.a)!=plane.isPointExterior(this.b)
}

GLine.prototype.clone=function(){
	return new GLine(this.a,this.b);
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

function GBoundingBox(arg){
	this.pos=new GVector(0,0,0)
	if(arg.vertices!=null)
	{
	this.maxX=vertices[0].x;
		this.maxY=vertices[0].y;
		this.maxZ=vertices[0].z;
		this.minX=vertices[0].x;
		this.minY=vertices[0].y;
		this.minZ=vertices[0].z;
		for(var i=0; i<vertices.length; i++)
		{
			if (vertices[i].x>this.maxX){
				this.maxX=vertices[i].x
			}
			if(vertices[i].y>this.maxY){
				this.maxY=vertices[i].y
			}
			if(vertices[i].z>this.maxZ){
				this.maxZ=vertices[i].z
			}
			if(vertices[i].x<this.minX){
				this.minX=vertices[i].x
			}
			if(vertices[i].y<this.minY){
				this.minY=vertices[i].y
			}
			if(vertices[i].z<this.minZ){
				this.minZ=vertices[i].z
			}
		}
	}

}

GBoundingBox.prototype.collideBoundingBox = function(boundingBoxB)
{
	if(boundingBoxB.maxX<this.maxZ && boundingBoxB.maxX>this.minX) return true;
	if(boundingBoxB.maxY<this.maxY && boundingBoxB.maxY>this.minY) return true;
	if(boundingBoxB.maxX<this.maxZ && boundingBoxB.maxZ>this.minZ) return true;
	
	if(boundingBoxB.minX<this.maxZ && boundingBoxB.minX>this.minX) return true;
	if(boundingBoxB.minY<this.maxY && boundingBoxB.minY>this.minY) return true;
	if(boundingBoxB.minX<this.maxZ && boundingBoxB.minZ>this.minZ) return true;
	return false;
}

function GCollisionMesh(arg){
	var THREEJSGeometry;
	if(arg instanceof THREE.Geometry)
	{
		THREEJSGeometry=arg;
	}
	if(arg instanceof THREE.Mesh)
	{
		THREEJSGeometry= arg.geometry;
		this.rotation=arg.rotation;
		this.position=arg.position;
	}
	
	var faces=THREEJSGeometry.faces
	var vertices=THREEJSGeometry.vertices
	/* new work  ******************************************************************* */
	/*
		use GPlane.crossingPointOfLine with vertical line from deltaYPointATopointB at X and Y of pointb?
		 >>> this is and should be a boxy and inaccurate fast, simple collision.
	*/
	// work moved to bounding box class add bounding box to collision mesh?
	// add bounding sphere?
	
	/*
		movement/collision resolution search
		step size is movement length
		on failure halve step size and move back by step
		on success move forward then halve step size
		function partialmovesolution(){
		var move = args.movevector
		var steplen=0.25
		var searchpos=0.5;
		var lastgood=0;
		var loops=0
		var maxloops=10
		while (loops<maxloops)
		{
			cmesh1.position=Gvector.sum(GVector.scalarProduct(move,ssearchlen))
			if(cmesh1.collisiondetect()==true)
			{
				searchpos-=steplen
			}
			else
			{
				searchpos+=steplen
				lastgood=searchpos;
			}
			steplen*=0.5
			loops++;
		}
		return safe move of GVector.scalarProduct(move,lastgood) 
		}
		
	*/
	
	
	
	/* new work  ******************************************************************* */
	this.lines=[]
	for(var i=0; i<faces.length; i++){
		var THREEA = vertices[faces[i].a]
		var THREEB = vertices[faces[i].b]
		var THREEC = vertices[faces[i].c]
		var a=new GVector(THREEA.x, THREEA.y, THREEA.z)
		var b=new GVector(THREEB.x, THREEB.y, THREEB.z)
		var c=new GVector(THREEC.x, THREEC.y, THREEC.z)
		var lineAB = new GLine(a,b)
		var lineBC = new GLine(b,c)
		var lineCA = new GLine(c,a)
		this.lines.push(lineAB, lineBC, lineCA)
	}
	this.lines=GHelpers.pruneSameLines(this.lines);
	this.tris=[]
	for(var i=0; i<faces.length; i++){
		var THREEA = vertices[faces[i].a]
		var THREEB = vertices[faces[i].b]
		var THREEC = vertices[faces[i].c]
		var a=new GVector(THREEA.x, THREEA.y, THREEA.z)
		var b=new GVector(THREEB.x, THREEB.y, THREEB.z)
		var c=new GVector(THREEC.x, THREEC.y, THREEC.z)
		this.tris.push(new GTriangle(a,b,c));
	}
	this.boundingSphereRadius=0
	for(var i=0; i<this.lines.length; i++){
		var aDist=this.lines[i].a.length();
		var bDist=this.lines[i].b.length();
		if(aDist>this.boundingSphereRadius)this.boundingSphereRadius=aDist;
		if(bDist>this.boundingSphereRadius)this.boundingSphereRadius=bDist;
	}
	this.lastCollidedTriangle=null;
	this.lastCollidedLine=null;
}


GCollisionMesh.prototype.rotatedLine=function(line){
	var a=line.a.intrinsicRotateXYZ(this.rotation.x,this.rotation.y,this.rotation.z);
	var b=line.b.intrinsicRotateXYZ(this.rotation.x,this.rotation.y,this.rotation.z);
	return new GLine(a,b);
}

GCollisionMesh.prototype.rotatedTriangle=function(tri){
	var a=tri.a.intrinsicRotateXYZ(this.rotation.x,this.rotation.y,this.rotation.z);
	var b=tri.b.intrinsicRotateXYZ(this.rotation.x,this.rotation.y,this.rotation.z);
	var c=tri.c.intrinsicRotateXYZ(this.rotation.x,this.rotation.y,this.rotation.z);
	return new GTriangle(a,b,c)
}

GCollisionMesh.prototype.translatedLine=function(line){
	var a=GVector.sum(line.a, this.position)
	var b=GVector.sum(line.b, this.position)
	return new GLine(a,b);
}

GCollisionMesh.prototype.translatedTriangle=function(tri){
	var a=GVector.sum(tri.a, this.position)
	var b=GVector.sum(tri.b, this.position)
	var c=GVector.sum(tri.c, this.position)
	return new GTriangle(a,b,c);
}


GCollisionMesh.prototype.THREELines = function(){
	var material = new THREE.LineBasicMaterial({color:0xFFFFFF})
	var geometry = new THREE.Geometry();
	for(var i=0; i<this.lines.length; i++){
		var line=this.lines[i]
		line=this.rotatedLine(line)
		line=this.translatedLine(line)
		geometry.vertices.push(line.a.THREEVector3())
		geometry.vertices.push(line.b.THREEVector3())
	}
	return new THREE.Line(geometry, material, THREE.LinePieces)
}

GCollisionMesh.prototype.THREETriangles = function(){
	var material = new THREE.MeshBasicMaterial({color:0x00FFFF})
	var geometry = new THREE.Geometry();
	for(var i=0; i<this.tris.length; i++){
		var tri=this.tris[i]
		tri=this.rotatedTriangle(tri)
		tri=this.translatedTriangle(tri)
		geometry.vertices.push(tri.a.THREEVector3())
		geometry.vertices.push(tri.b.THREEVector3())
		geometry.vertices.push(tri.c.THREEVector3())
		var offset=i*3
		geometry.faces.push(new THREE.Face3(offset,offset+1,offset+2))
		geometry.faces.push(new THREE.Face3(offset+2,offset+1,offset))
	}
	return new THREE.Mesh(geometry, material)
}


GCollisionMesh.prototype.collides=function(bCollisionMesh){
	//newer
	var aPos=new GVector(this.position.x, this.position.y, this.position.z)
	var bPos=new GVector(bCollisionMesh.position.x, bCollisionMesh.position.y, bCollisionMesh.position.z)
	var aBDist = aPos.difference(bPos).length()
	if(aBDist> (this.boundingSphereRadius+bCollisionMesh.boundingSphereRadius) ){return false;}// bounding spheres to far for possible collision
	
	//end newer
	for(var i=0; i<this.lines.length; i++)
	{
		var line=this.lines[i]
		line=this.rotatedLine(line)
		line=this.translatedLine(line)
		for(var j=0; j<bCollisionMesh.tris.length; j++)
		{
			var tri=bCollisionMesh.tris[j]
			tri=bCollisionMesh.rotatedTriangle(tri)
			tri=bCollisionMesh.translatedTriangle(tri)
			if(tri.crossedByLine(line))
			{
				this.lastCollidedLine=line.clone()
				this.lastCollidedTriangle=tri.clone()
				return true;
			}
		}
	}
	for(var i=0; i<bCollisionMesh.lines.length; i++)
	{
		var line=bCollisionMesh.lines[i]
		line=bCollisionMesh.rotatedLine(line)
		line=bCollisionMesh.translatedLine(line)
		for(var j=0; j<this.tris.length; j++)
		{
			var tri=this.tris[j]
			tri=this.rotatedTriangle(tri)
			tri=this.translatedTriangle(tri)
			if(tri.crossedByLine(line))
			{
				this.lastCollidedLine=line.clone()
				this.lastCollidedTriangle=tri.clone()
				return true;
			}
		}
	}
	return false;
}

GCollisionMesh.prototype.extendedCollision=function(other,v){
	
	var aPos=new GVector(this.position.x, this.position.y, this.position.z)
	var bPos=new GVector(other.position.x, other.position.y, other.position.z)
	var aBDist = aPos.difference(bPos).length()
	if(aBDist > (this.boundingSphereRadius + other.boundingSphereRadius + v.length()) ){return false;}// bounding spheres to far for possible collision
	
	var extendedLines=[]
	var extendedTris=[]
	for(var i=0; i<this.lines.length; i++)
	{
		var line=this.lines[i]
		line=this.rotatedLine(line)
		line=this.translatedLine(line)
		var line2=new GLine(line.a.sum(v),line.b.sum(v)) // line translated by movement vector
		var triA=new GTriangle(line.a,line2.a,line2.b)
		var triB=new GTriangle(line.b,line2.a,line2.b)
		extendedLines.push(line2)
		extendedLines.push(new GLine(line.a,line2.a))
		extendedLines.push(new GLine(line.b,line2.b))
		extendedTris.push(triA)
		extendedTris.push(triB)
	}
	for(var i=0; i<this.tris.length; i++)
	{
		var tri=this.tris[i]
		tri=this.rotatedTriangle(tri)
		tri=this.translatedTriangle(tri)
		extendedTris.push(tri.translation(v))
	}
	
	for(var i=0; i<extendedLines.length; i++)
	{
		var line=extendedLines[i]
		for(var j=0; j<other.tris.length; j++)
		{
			var tri=other.tris[j]
			tri=other.rotatedTriangle(tri)
			tri=other.translatedTriangle(tri)
			if(tri.crossedByLine(line))
			{
				this.lastCollidedLine=line.clone()
				this.lastCollidedTriangle=tri.clone()
				return true;
			}
		}
	}
	for(var i=0; i<other.lines.length; i++)
	{
		var line=other.lines[i]
		line=other.rotatedLine(line)
		line=other.translatedLine(line)
		for(var j=0; j<extendedTris.length; j++)
		{
			var tri=extendedTris[j]
			if(tri.crossedByLine(line))
			{
				this.lastCollidedLine=line.clone()
				this.lastCollidedTriangle=tri.clone()
				return true;
			}
		}
	}
	return false;
}

var GHelpers=function(){}


GHelpers.constructSortedLine=function(line){
		if(GHelpers.compareVector(line.a,line.b))
		{
			return new GLine(line.a,line.b);
		}
		else 
		{
		return new GLine(line.b,line.a);
		}
}

GHelpers.linesAreEqual=function(lineA,lineB){
	var lineASorted=GHelpers.constructSortedLine(lineA);
	var lineBSorted=GHelpers.constructSortedLine(lineB);
	return lineASorted.a.equals(lineBSorted.a) && lineASorted.b.equals(lineBSorted.b);
}

GHelpers.compareVector=function(a,b){
	if(a.x<b.x){return true}
	if(a.x>b.x){return false}
	if(a.y<b.y){return true}
	if(a.y>b.y){return false}
	if(a.z<b.z){return true}
	if(a.z>b.z){return false}
	return true;
}

	

GHelpers.pruneSameLines=function(linesArray){
	var finalLinesArray=[]
	finalLinesArray.push(linesArray[0])
	for(var i=1; i<linesArray.length; i++)
	{
		var line=linesArray[i]
		var matched=false;
		for(var j=0; j<finalLinesArray.length; j++)
		{
			if(GHelpers.linesAreEqual(line,finalLinesArray[j]))
			{
				matched=true;
			}
		}
		if(!matched)finalLinesArray.push(line)
	}
	return finalLinesArray
}
