/*
colision detection:
take all point to point vectors of a and b object
if any p2pv of a crosses b or vice versa (2 tests) then a collision has occured

possible resolution:
iteratively roll back half a step and repeat until clear of collision then roll forward until desired precision
if final rolled back position yields new collision roll back from last collisions final resolution point



*/





function xProduct(a, b){
var nx = a.y * b.z - b.y * a.z
var ny = a.z * b.x - b.z * a.x
var nz = a.x * b.y - b.x * a.y
return {x:nx, y:ny, z:nz}
}

function triangleTranslate(t, v){
a = vectorSum(t.a,v)
b = vectorSum(t.b,v)
c = vectorSum(t.c,v)
return {a:a,b:b,c:c}
}

function triangleNormal(tri){
// given a triangle defined by the coordinates of it's corners 
var a ={x:tri.b.x-tri.a.x, y:tri.b.y-tri.a.y, z:tri.b.z-tri.a.z};
var b ={x:tri.c.x-tri.a.x, y:tri.c.y-tri.a.y, z:tri.c.z-tri.a.z};

return normalize(xProduct(a, b));
}

function edgePlanes(triangle){
//CONTACT POINT with triangle must be (interior / contacting) edge planes
// make three planes flush with each edge of a triangle
var baseNormal=triangleNormal(triangle)
console.log('base normal:')
console.log(baseNormal)
// make a triangle for each edge
var a=triangle.a;
var b=triangle.b;
var c=triangle.c;
//create verctor from point a to point b ("vab"), b to c, and c to a
var vab = vectorDifference(b,a);
var vbc = vectorDifference(c,b);
var vca = vectorDifference(a,c);
// create normal vectors perpendicular to each edge of triangle
var nab = normalize(xProduct(vab,baseNormal));
var nbc = normalize(xProduct(vbc,baseNormal));
var nca = normalize(xProduct(vca,baseNormal));
//create a plane from each normal and a point
var pab={point:a, normal:nab};
var pbc={point:b, normal:nbc};
var pca={point:c, normal:nca};
return [pab, pbc, pca];
}

//triangle to  triangle collision test
function triangle_intersects_triangle(triangle_a, triangle_b){
// proof of concept function
// concept didn't work
edges=edgePlanes(triangle_b)
a=has_interiority(triangle_a.a, edges[0])&& has_interiority(triangle_a.a, edges[1]) && has_interiority(triangle_a.a, edges[2]);
b=has_interiority(triangle_a.b, edges[0])&& has_interiority(triangle_a.b, edges[1]) && has_interiority(triangle_a.b, edges[2]);
c=has_interiority(triangle_a.c, edges[0])&& has_interiority(triangle_a.c, edges[1]) && has_interiority(triangle_a.c, edges[2]);
console.log('test triangle:')
console.log(triangle_a)
console.log('test triangle edges:')
console.log(edges)
console.log('has interiority to edges 0, 1, 2')
console.log(has_interiority(triangle_a.c, edges[0]));
console.log(has_interiority(triangle_a.c, edges[1]));
console.log(has_interiority(triangle_a.c, edges[2]));
return [a,b,c];
}



function exterior_approach_dist(vctr, pln){
// rate of approach of a vector towards a plane
	
	// incomplete?
	
	var x_approach = vctr.x * -pln.normal.x
	var y_approach = vctr.y * -pln.normal.y
	var z_approach = vctr.z * -pln.normal.z
	
	sign = (x_approach + y_approach + z_approach) > 0 ? 1 : -1
	return sign * Math.sqrt(x_approach * x_approach + y_approach * y_approach + z_approach * z_approach )
	
}

function distance_from_plane(point, plane){
d = vectorDifference(point, plane.point)
return vectorLength(vectorDotProduct(d, plane.normal))
}

function lineSegmentTriangleCollision(ls,t){
// epected format of ls: {point:point (origin location), vector,vector (direction and magnitude)}
edges=edgePlanes(t);
tNormal=triangleNormal(t);
tPlane={point:t.a, normal:tNormal}

}
/*
test stuff
n=normalize(vector(0,0,1))
p=vector(0,0,0)
pln={point:p,normal:n}
rate_of_exterior_approach(vector(0,1,0),pln)
*/

function v2v3(v)
{//vector to THREE vector
	return vector(v.x, v.y, v.z)
}
// TODO use only THREE.vector3s
function v3tov(v)
{//vector to THREE vector
	return vector(v.x, v.y, v.z)
}

function vector(x,y,z)
{
	return {x:x, y:y, z:z}
}

function vectorDotProduct(a, b)
{
	return {x:a.x * b.x, y:a.y * b.y, z:a.z * b.z}
}

function vectorSum(a, b)
{
	return {x:a.x + b.x, y:a.y + b.y, z:a.z + b.z}
}

function vectorAverage(a, b)
{
	return {x:a.x/2 + b.x/2, y:a.y/2 + b.y/2, z:a.z/2 + b.z/2}
}

function vectorDifference(a, b)
{
	return {x:a.x - b.x, y:a.y - b.y, z:a.z - b.z}
}

function vectorScale(v, s)
{
	return {x:v.x*s, y:v.y*s, z:v.z*s}
}

function vectorLength(v)
{
	var result=Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z );
	return result;
}
function vectorString(v)
{
	var string='v{x:'+v.x+', y:'+v.y+', z:'+v.z+'}';
	return string;
}
function vectorClone(v)
{
	var clone={x:v.x, y:v.y, z:v.z};
	return clone;
}

function has_interiority(point, plane) //rename like below
{
// this function returns true if point is interior to plane
		var x=point.x - plane.point.x;
		var y=point.y - plane.point.y;
		var z=point.z - plane.point.z;
		var v = vector(x,y,z);
		var projection = vector(x*plane.normal.x, y*plane.normal.y, z*plane.normal.z)
		var sum = projection.x + projection.y +projection.z;
		return sum<0;
}
function pointPlaneTest(point, plane) //point has interiority or contact with plane
{
// this function returns true if point is interior to plane
		var x=point.x - plane.point.x;
		var y=point.y - plane.point.y;
		var z=point.z - plane.point.z;
		var v = vector(x,y,z);
		var projection = vector(x*plane.normal.x, y*plane.normal.y, z*plane.normal.z)
		var sum = projection.x + projection.y +projection.z;
		return sum<=0;
}

function point_has_contact_with_plane(point, plane)
{
//  this function returns true if point contacts plane (not accurate due floating point limitations)
		var dx=point.x - plane.point.x;
		var dy=point.y - plane.point.y;
		var dz=point.z - plane.point.z;
		var v = vector(dx,dy,dz);
		var projection = vector(dx*plane.normal.x, dy*plane.normal.y, dz*plane.normal.z)
		var sum = projection.x + projection.y +projection.z;
		return sum==0;
}



function PlaneFromFace3(face)
{
	var plane={point:null, normal:null};
	plane.point=vector(face.a.x, face.a.y, face.a.z);
	plane.normal=vector(face.normal.x, face.normal.y, face.normal.z);
	
}


function normalize(v)
{
	var sumSquares=v.x * v.x +
				   v.y * v.y +
				   v.z * v.z;
	length = Math.sqrt(sumSquares)
	normalizedVector={
		// failure intended result if passed a zero length vector
		x:v.x / length,
		y:v.y / length,
		z:v.z / length,
	}
	return normalizedVector;
}

function line_intersects_or_contacts_plane(line, plane){
// line: {origin:{x,y,z}, span:{x,y,z}}
// plane: {point:{x,y,z}, normal}
line_len=vectorLength(line.span);
is_interior = has_interiority(line.point, plane);
approach_dist = (is_interior) ? -1 * exterior_approach_dist(line.span, plane): exterior_approach_dist(line.span, plane);
distance = distance_from_plane(line.point, plane);
return (approach_dist>=distance)
}

//WIP
function line_intersects_tri(line, tri){
normal = triangleNormal(tri)
plane={point:tri.a, normal:normal}
edges=edgePlanes(tri)
if(!line_intersects_or_contacts_plane(line,plane))return false;
distance = distance_from_plane(line.point, plane);
span_normal=normalize(line.span)
console.log('span_normal:'+vectorString(span_normal));
console.log('distance:'+distance);
console.log('distance scaled normal:'+vectorString(vectorScale(span_normal, distance)));
contact_point=vectorSum(line.point, vectorScale(span_normal, distance));
if(!pointPlaneTest(contact_point, edges[0]) && !point_has_contact_with_plane(contact_point, edges[0])) return false;
if(!pointPlaneTest(contact_point, edges[1]) && !point_has_contact_with_plane(contact_point, edges[1])) return false;
if(!pointPlaneTest(contact_point, edges[2]) && !point_has_contact_with_plane(contact_point, edges[2])){
	console.log(edges[2]);
	console.log(contact_point);
	return false;
	}
return true;
}

function Cmesh(ob){
//todo: bounding box or distance check
if(ob.tris!=null)
{
this.tris=object.tris
}
if(ob.mesh!=null)
{
if(ob.mesh instanceof THREE.Mesh) {this.tris=collision_meshinate(ob.mesh.geometry); this.pos=ob.mesh.position;}
else {this.tris = ob.mesh}
this.lines=tris_to_lines_pruned(this.tris);
}
if(ob.pos!=null){
//object
this.pos = ob.pos
}
}

Cmesh.prototype.collides=function(othermesh){
	for(i=0; i<this.tris.length; i++){
		tri=this.tris[i]
		for(j=0; j<othermesh.lines.length; j++){
			line=othermesh.lines[j];
			//translate by moving origin of line
			o=vectorSum(line.point, this.pos)
			o=vectorDifference(o, othermesh.pos)
			lineTranslated={point:o, span:vectorClone(line.span)}
			if(line_intersects_tri(lineTranslated, tri)==true){console.log(line); console.log(tri); return 'collision true'}
		}
	}
}

function collision_meshinate(geometry){
	// get collision.js style geometry
	tris=[];
	for(i=0; i<geometry.faces.length; i++){
		var a=v3tov(geometry.vertices[geometry.faces[i].a]);
		var b=v3tov(geometry.vertices[geometry.faces[i].b]);
		var c=v3tov(geometry.vertices[geometry.faces[i].c]);
		tris.push({a:a,b:b,c:c});
	}
	return tris
	// scale rotate and translate
}

function tris_to_lines_pruned(tris_array){
	pointPairs=[]
	pointPairUniquenessTestingObject={}
	for(i=0; i<tris.length; i++){
		tri=tris_array[i];
		var ab=[tri.a,tri.b]
		var bc=[tri.b,tri.c]
		ca=[tri.c,tri.a]
		if(pointPairUniquenessTestingObject[pointPairStringID(ab)]==null){
			pointPairUniquenessTestingObject[pointPairStringID(ab)]=1;
			pointPairs.push(ab)
		}
		if(pointPairUniquenessTestingObject[pointPairStringID(bc)]==null){
			pointPairUniquenessTestingObject[pointPairStringID(bc)]=1;
			pointPairs.push(bc)
		}
		if(pointPairUniquenessTestingObject[pointPairStringID(ca)]==null){
			pointPairUniquenessTestingObject[pointPairStringID(ca)]=1;
			pointPairs.push(ca)
		}
	}
	lines=[]
	for(i=0; i<pointPairs.length; i++){
	line={point:pointPairs[i][0], span:vectorDifference(pointPairs[i][1], pointPairs[i][0])}
	lines.push(line);
	}
	return lines;
}


function pointPairStringID(pair){
//converts line to string. sorts points so same lines don't have same string
//optimization note: not passing as array woulda been faster
	if(pair[0].x!=pair[1].x)
	{
		return (pair[0].x<pair[1].x) ? vectorString(pair[0])+ ',' + vectorString(pair[0]) : vectorString(pair[1])+ ',' + vectorString(pair[0]);
	}else if(pair[0].y!=pair[1].y)
	{
		return (pair[0].y<pair[1].y) ? vectorString(pair[0])+ ',' + vectorString(pair[0]) : vectorString(pair[1])+ ',' + vectorString(pair[0]);
	}else if(pair[0].z!=pair[1].z)
	{
		return (pair[0].z<pair[1].z) ? vectorString(pair[0])+ ', ' + vectorString(pair[0]) : vectorString(pair[1])+ ',' + vectorString(pair[0]);
	}
	return vectorString(pair[0])+ ',' + vectorString(pair[0]);
}

/*
function prune_faces(tri_array){
	// THREE faces are abc objects w other properties like material and color
	facesArray=[]
	for(i=0; i<faces.length; i++)
	{
		face=faces[i].slice().sort() //deep copy inner face and sort order of vertices 
		facesArray.push(face)
	}
	facesSortedArray=facesArray.sort();
	facesPrunedArray=[];
	console.log('soreted array for pruning:')
	console.log(facesSortedArray);
	facesPrunedArray.push(facesSortedArray[0])
	for(i=1; i<facesSortedArray.length; i++){
		face=facesSortedArray[i]
		prevFace=facesPrunedArray[facesPrunedArray.length-1]
		if(face.a != prevFace.a && face.b != prevFace.b && face.c != prevFace.c) // fix this abc or [012]???
		{
			facesPrunedArray.push(face);
		}
	}
	return facesPrunedArray;
}
*/

function rotate_point(point, rot_vector){
//extrinsic zyx order to simulate three.js intrinsic xyz order
point=x_rotate_point(point,rot_vector);
point=y_rotate_point(point,rot_vector);
point=z_rotate_point(point,rot_vector);
return point;
}

function x_rotate_point(point,rots){
ca=Math.cos(rots.x)
sa=Math.sin(rots.x)
ny=point.y * ca + point.z * sa
nz=point.z * ca - point.y * sa
return vector(point.x,ny,nz)
}

function y_rotate_point(point,rots){
ca=Math.cos(rots.y)
sa=Math.sin(rots.y)
nx=point.x * ca - point.z * sa
nz=point.z * ca + point.x * sa
return vector(nx,point.y,nz)
}

function z_rotate_point(point,rots){
ca=Math.cos(rots.z)
sa=Math.sin(rots.z)
nx=point.x * ca + point.y * sa
ny=point.y * ca - point.x * sa
return vector(nx,ny,point.z)
}

/*
collidables are either moving or non moving






*/



