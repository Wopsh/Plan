var scene, camera, renderer,input, canvas,lookAt=new THREE.Vector3(0,0,-1);


var lastFrameTime=0; // update with window.performance.now()
var lastRenderTime=0;
var lastIdleTime=0;
var lastOtherTime=0;
var lastTotalTime=0;
var gameTicStart=0
var lastGameTicStart=0;

var game={
	units:[],
	movers:[],
	collidables:[],
	fallers:[],
	players:[],
	syncedUp:[],
	syncedDown:[],
	actions:null,
	ticTime:0
	}

function frameCallback(){

}



function setup(){
	canvas = document.getElementById('canvas')
	input=new CanvasInputHandler(canvas)
	//input.addEventListeners();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 720.0/480.0, 0.1, 40000);
	camera.up = new THREE.Vector3(0,1,0);//Dont forget to set camera.up (this makes camera.lookAt work)
	camera.lookAt(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

	var dLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
	dLight.position.set(0.1*(Math.random()-0.5),1,0.1*(Math.random()-0.5));
	var aLight = new THREE.AmbientLight( 0x666666);
	

	scene.add( aLight );
	scene.add( dLight );
	
	
	hardsetup();

render();
}


function fps(){
	return 1000/lastTotalTime;
}

function fpsInfoDump(){
	return {
			fps:1000/lastTotalTime,
			idle:(lastIdleTime/lastTotalTime).toFixed(2).slice(2)+'%',
			render:(lastRenderTime/lastTotalTime).toFixed(2).slice(2)+'%',
			other:(lastOtherTime/lastTotalTime).toFixed(2).slice(2)+'%'
			}
}

function render() {
	lastIdleTime=window.performance.now()-lastFrameTime;
	//game.updateTime=window.performance.now()-otherTimeStart;
	otherTimeStart=window.performance.now()
	gameTicStart=window.performance.now()
	game.ticTime= gameTicStart-lastGameTicStart;
	frameCallback();
	lastGameTicStart=gameTicStart;
	lastOtherTime=window.performance.now()-otherTimeStart;
	renderTimeStart=window.performance.now();
	renderer.render(scene, camera);
	lastRenderTime= window.performance.now()-renderTimeStart;
	lastTotalTime= window.performance.now()-lastFrameTime;
	lastFrameTime= window.performance.now();
	requestAnimationFrame(render);
	
	
}



