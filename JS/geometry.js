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


function tri_geom(points){
	// the argument points contains three xyz coordiante objects
	var geometry = new THREE.Geometry();
	var verticesStartIndx = geometry.vertices.length
	for(var i=0; i<3; i++)
	{
		geometry.vertices.push( new THREE.Vector3( points[i].x, points[i].y, points[i].z ) );
	}
	var normal = triangleNormalTHREE(points[0],points[1],points[2]);
	geometry.faces.push( new THREE.Face3( verticesStartIndx + 0, verticesStartIndx + 1, verticesStartIndx + 2, normal ) );
	return geometry;
}


function tri_ds(points){
	// the argument points contains four xyz coordiante objects
	var geometry=tri(points);
	add_tri(points.reverse(),geometry)
	return geometry;
}


function add_tri(points, geometry){
	// the argument points contains four xyz coordiante objects
	var verticesStartIndx = geometry.vertices.length
	for(var i=0; i<3; i++)
	{
		geometry.vertices.push( new THREE.Vector3( points[i].x, points[i].y, points[i].z ) );
	}
	var normal = triangleNormalTHREE(points[0],points[1],points[2]);
	geometry.faces.push( new THREE.Face3( verticesStartIndx + 0, verticesStartIndx + 1, verticesStartIndx + 2, normal ) );
	return geometry;
}


function add_quad(points, geometry){
	// the argument points contains four xyz coordiante objects
	var verticesStartIndx = geometry.vertices.length
	for(var i=0; i<4; i++)
	{
		geometry.vertices.push( new THREE.Vector3( points[i].x, points[i].y, points[i].z ) );
	}
	var normal = triangleNormalTHREE(points[0],points[1],points[2]);
	geometry.faces.push( new THREE.Face3( verticesStartIndx + 0, verticesStartIndx + 1, verticesStartIndx + 2, normal ) );
	geometry.faces.push( new THREE.Face3( verticesStartIndx + 0, verticesStartIndx + 2, verticesStartIndx + 3, normal ) );
	
	//UV coords
	/*
	// TODO watch the zero here it needs to be the last face????
	geometry.faceVertexUvs[0].push(new THREE.Vector2(0,0));
	geometry.faceVertexUvs[0].push(new THREE.Vector2(0,1));
	geometry.faceVertexUvs[0].push(new THREE.Vector2(1,1));
	
	geometry.faceVertexUvs[1].push(new THREE.Vector2(0,0));
	geometry.faceVertexUvs[1].push(new THREE.Vector2(1,1));
	geometry.faceVertexUvs[1].push(new THREE.Vector2(0,1));
	*/
	
	
	return geometry;
}

function add_quad_ds(points, geometry){
// untested double sided add version of add_quad
	add_quad(points, geometry);
	add_quad(points.reverse(), geometry);
	return geometry;
}

function quad_ds(points){
// untested double sided add version of add_quad
	var geometry=quad(points);
	add_quad(points.reverse(), geometry);
	return geometry;
}


function xProductTHREE(a, b){

var nx = a.y * b.z - b.y * a.z
var ny = a.z * b.x - b.z * a.x
var nz = a.x * b.y - b.x * a.y

return new THREE.Vector3( nx, ny, nz )
}

function triangleNormalTHREE(p0,p1,p2){
// given a triangle defined by the coordinates of it's corners 
var a ={x:p1.x-p0.x, y:p1.y-p0.y, z:p1.z-p0.z};
var b ={x:p2.x-p0.x, y:p2.y-p0.y, z:p2.z-p0.z}

return xProductTHREE(a, b).normalize();
}
