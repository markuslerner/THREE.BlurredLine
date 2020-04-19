var container, stats;

var camera, clock, scene, renderer;
var curve, endPoint, handlesGeometry, lines = [], lineMaterial, params, wireframeMaterial;

var Params = function() {
  this.amount = 1;
  this.resolution = 50;
  this.angleBisection = false;
  this.closed = false;
  this.color = '#000000';
  this.strokeWidth = 2;
  this.smoothWidth = 10;
  this.smooth = true;
  this.opacity = 1.0;
  this.wireframe = false;
  this.autoRotate = false;
};

init();
animate();

function init() {

  container = document.getElementById( 'container' );

  // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10 );
  // camera.position.z = 2;

  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
  camera.position.set( 0, 0, 500 );

  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0x101010 );

  endPoint = new THREE.Vector3(0, 0, 0);

  // curve = new THREE.LineCurve3(
  //   new THREE.Vector3(-500, 0, -500),
  //   endPoint
  // );

  curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-500, 0, -500),
    new THREE.Vector3(0, 0, 500),
    new THREE.Vector3(0, 300, 500),
    endPoint,
  );

  // curve = new THREE.Path();
  // curve.lineTo( 0, 0 );
  // curve.quadraticCurveTo( -500, 0, 0, 200 );
  // curve.lineTo( 0, 500 );

  // var curve = new THREE.QuadraticBezierCurve3(
  // 	new THREE.Vector3( -100, 0, 0 ),
  // 	new THREE.Vector3( 200, 150, 0 ),
  // 	new THREE.Vector3( 100, 0, 0 )
  // );

  // curve = new THREE.EllipseCurve(
  // 	0,  0,            // ax, aY
  // 	200, 200,           // xRadius, yRadius
  // 	0,  2 * Math.PI,  // aStartAngle, aEndAngle
  // 	false,            // aClockwise
  // 	0                 // aRotation
  // );

  // outline:
  wireframeMaterial = new THREE.MeshBasicMaterial({
  	color: 0xFF0000,
  	side: THREE.DoubleSide,
  	wireframe: true,
  	// depthTest: false,
  	blending: THREE.NormalBlending,
  });

  handlesGeometry = new THREE.Geometry();
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

  params = new Params();
  var gui = new dat.GUI();

  window.addEventListener( 'load', function() {

  	function update() {
  		// if(params.autoUpdate ) {
  			clearLines();
  			createLines();
  		// }
  	}

  	gui.add(params, 'amount', 1, 1000).onChange( update );
    gui.add(params, 'resolution', 1, 100).onChange( update );
    gui.add(params, 'angleBisection').onChange(function() {
  		lines.forEach( function( l ) {
  			l.angleBisection = params.angleBisection;
  			l.updateGeometry();
  		} );
  	} );
    gui.add(params, 'closed').onChange( update );
    gui.addColor(params, 'color').onChange(function() {
      var color = new THREE.Color( params.color );
      // var hex = color.getHexString();
      // var css = color.getStyle();

  		lines.forEach( function( l ) {
  			l.color = color;
  			l.updateGeometry();
  		} );
  	} );
  	gui.add(params, 'strokeWidth', 0.1, 250).onChange(function() {
  		lines.forEach( function( l ) {
  			l.strokeWidth = params.strokeWidth;
  			l.updateGeometry();
  		} );
  	} );
    gui.add(params, 'smoothWidth', 0, 250).onChange(function() {
  		lines.forEach( function( l ) {
  			l.smoothWidth = params.smoothWidth;
  			l.updateGeometry();
  		} );
  	} );
    gui.add(params, 'smooth').onChange( update );
  	gui.add(params, 'opacity', 0.0, 1.0).onChange(function() {
      lineMaterial.uniforms.opacity.value = params.opacity;
  	} );
    gui.add(params, 'wireframe').onChange( update );
    gui.add(params, 'autoRotate');
  } );

  // var mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  clock = new THREE.Clock();

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  createLines();

}

function onWindowResize() {

  camera.left   = window.innerWidth / - 2;
  camera.right  =  window.innerWidth / 2;
  camera.top    = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  var delta = clock.getDelta();
  lines.forEach( function( l ) {
    if(params.autoRotate ) {
      l.mesh.rotation.y += 0.125 * delta;
    } else {
      l.mesh.rotation.y = 0;
    }
  } );

  renderer.render( scene, camera );

}

function onDocumentMouseMove(event) {
  event.preventDefault();
  var mouseX = event.clientX - window.innerWidth / 2;
  var mouseY = -event.clientY + window.innerHeight / 2;

  endPoint.x = mouseX;
  endPoint.y = mouseY;
  endPoint.z = 0;

  handlesGeometry.verticesNeedUpdate = true;

  lines.forEach(function(l) {
    l.updateGeometry();
  });

}

function createLine(i) {
  const line = new BlurredLine(curve, parseInt(params.resolution), params.smooth);
  line.angleBisection = params.angleBisection;
  line.color = new THREE.Color(params.color);
  line.strokeWidth = params.strokeWidth; // 2f
  line.smoothWidth = params.smoothWidth; // 3f
  line.upVector = new THREE.Vector3(0.0, 0.0, 1.0);
  line.closed = params.closed;
  line.updateGeometry();

  lines.push( line );

  line.mesh = new THREE.Mesh(line.geometry, params.wireframe ? wireframeMaterial : lineMaterial);
  line.mesh.position.x += i * 10;
  scene.add(line.mesh);

}

function createLines() {
  lineMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      // time: { value: 1.0 },
      opacity: { value: params.opacity },
    },
    vertexShader: `
      precision mediump float;
      precision mediump int;

      uniform mat4 modelViewMatrix; // optional
      uniform mat4 projectionMatrix; // optional

      attribute vec3 position;
      attribute vec4 color;

      // varying vec3 vPosition;
      varying vec4 vColor;

      void main()	{

        // vPosition = position;
        vColor = color;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
    `,
    fragmentShader: `
      precision mediump float;
      precision mediump int;

      uniform float time;
      uniform float opacity;

      // varying vec3 vPosition;
      varying vec4 vColor;

      void main()	{

        vec4 color = vec4( vColor );
        color.a *= opacity;
        // color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

        gl_FragColor = color;

      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
  });

  for(var i = 0; i < params.amount; i++) {
  	createLine(i);
  }
}

function clearLines() {

  lines.forEach(function(l) {
  	scene.remove(l.mesh);
  });
  lines = [];

}
