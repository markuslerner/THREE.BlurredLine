'use strict'

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

var container = document.getElementById( 'container' );

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
camera.position.set( 0, 0, 500 );

// var camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
// camera.position.z = 2000;

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

// var controls = new THREE.OrbitControls( camera, renderer.domElement );
var clock = new THREE.Clock();

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

var endPoint = new THREE.Vector3(0, 0, 0);

var curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-500, 0, -500),
  new THREE.Vector3(0, 0, 500),
  new THREE.Vector3(0, 300, 500),
  endPoint,
);

// var curve = new THREE.QuadraticBezierCurve3(
// 	new THREE.Vector3( -100, 0, 0 ),
// 	new THREE.Vector3( 200, 150, 0 ),
// 	new THREE.Vector3( 100, 0, 0 )
// );

var lines = [];
var lineMaterial;

// outline:
var wireframeMaterial = new THREE.MeshBasicMaterial({
	color: 0xFF0000,
	side: THREE.DoubleSide,
	wireframe: true,
	// depthTest: false,
	blending: THREE.NormalBlending,
});

var handlesGeometry = new THREE.Geometry();
if(curve instanceof THREE.CubicBezierCurve3) {
  handlesGeometry.vertices.push(
  	curve.v0,
  	curve.v1,
  	curve.v2,
  	curve.v3,
  );
}
var handlesMaterial = new THREE.LineBasicMaterial({
	color: 0xFF0000,
	side: THREE.DoubleSide,
	linewidth: 3.0,
});
var handles = new THREE.Line(handlesGeometry, handlesMaterial, THREE.LineSegments);
scene.add(handles);

var mouse = new THREE.Vector2();

var Params = function() {
	this.amount = 1;
  this.resolution = 50;
  this.angleBisection = false;
	this.strokeWidth = 2;
  this.smoothWidth = 10;
  this.smooth = true;
	this.opacity = 1.0;
  this.wireframe = false;
	this.autoRotate = false;
};

var params = new Params();
var gui = new dat.GUI();

window.addEventListener( 'load', function() {

	function update() {
		// if( params.autoUpdate ) {
			clearLines();
			createLines();
		// }
	}

	gui.add( params, 'amount', 1, 1000 ).onChange( update );
  gui.add( params, 'resolution', 1, 100 ).onChange( update );
  gui.add( params, 'angleBisection' ).onChange(function() {
		lines.forEach( function( l ) {
			l.angleBisection = params.angleBisection;
			l.updateGeometry();
		} );
	} );
	gui.add( params, 'strokeWidth', 1, 250 ).onChange(function() {
		lines.forEach( function( l ) {
			l.strokeWidth = params.strokeWidth;
			l.updateGeometry();
		} );
	} );
  gui.add( params, 'smoothWidth', 1, 250 ).onChange(function() {
		lines.forEach( function( l ) {
			l.smoothWidth = params.smoothWidth;
			l.updateGeometry();
		} );
	} );
  gui.add( params, 'smooth' ).onChange( update );
	gui.add( params, 'opacity', 0.0, 1.0 ).onChange(function() {
    lineMaterial.opacity = params.opacity;
		lines.forEach( function( l ) {
			l.updateGeometry();
		} );
	} );
  gui.add( params, 'wireframe' ).onChange( update );
  gui.add( params, 'autoRotate' );
} );


init()



function init() {

	createLines();
	render();

}


function createLine(i) {
	const line = new SmoothLine(parseInt(params.resolution), params.smooth);
	line.angleBisection = params.angleBisection;
	line.color = new THREE.Color(0x000000);
	line.fadeColor = new THREE.Color(0xFFFFFF);
	line.strokeWidth = params.strokeWidth; // 2f
	line.smoothWidth = params.smoothWidth; // 3f
	line.upVector = new THREE.Vector3(0.0, 0.0, 1.0);
	line.curve = curve;
	line.updateGeometry();

	lines.push( line );

	line.mesh = new THREE.Mesh(line.geometry, params.wireframe ? wireframeMaterial : lineMaterial);
  line.mesh.position.x += i * 10;
	scene.add(line.mesh);

}

function createLines() {
  lineMaterial = new THREE.MeshBasicMaterial({
  	color: 0xFFFFFF,
    opacity: params.opacity,
  	side: THREE.DoubleSide,
  	vertexColors: THREE.VertexColors,
  	blending: THREE.NormalBlending, // THREE.SubtractiveBlending, // THREE.AdditiveBlending
  	transparent: true,
  	// depthTest: false,
  });

	for( var i = 0; i < params.amount; i++ ) {
		createLine(i);
	}
}

function clearLines() {

	lines.forEach( function( l ) {
		scene.remove( l.mesh );
	} );
	lines = [];

}


onWindowResize();

function onWindowResize() {

	var w = container.clientWidth;
	var h = container.clientHeight;

  camera.left   = window.innerWidth / - 2;
	camera.right  =  window.innerWidth / 2;
	camera.top    = window.innerHeight / 2;
	camera.bottom = window.innerHeight / - 2;

	camera.updateProjectionMatrix();

	renderer.setSize( w, h );

	resolution.set( w, h );

}

window.addEventListener( 'resize', onWindowResize );

function render() {

	requestAnimationFrame( render );

	if(stats) stats.begin();

	// controls.update();

  var delta = clock.getDelta();
  lines.forEach( function( l ) {
    if( params.autoRotate ) {
      l.mesh.rotation.y += .125 * delta;
    } else {
      l.mesh.rotation.y = 0;
    }
  } );

	renderer.render( scene, camera );

	if(stats) stats.end();

}


document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = event.clientX - window.innerWidth / 2;
  mouse.y = -event.clientY + window.innerHeight / 2;

  endPoint.x = mouse.x;
  endPoint.y = mouse.y;
  endPoint.z = 0;

  handlesGeometry.verticesNeedUpdate = true;

  lines.forEach( function( l ) {
		l.updateGeometry();
	} );

}
