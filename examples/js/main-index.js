var container, stats;

var camera, clock, scene, renderer;
var curve, endPoint, handlesGeometry, lines = [], lineMaterial, params, wireframeMaterial;

var Params = function() {
  this.amount = 1;
  this.resolution = 50;
  this.angleBisection = false;
  this.closed = false;
  this.color = '#000000';
  this.lineWidth = 1;
  this.blurWidth = 10;
  this.blur = true;
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
      clearLines();
      createLines();
  	}

  	gui.add(params, 'amount', 1, 1000).onChange( update );
    gui.add(params, 'resolution', 1, 100).onChange( update );
    gui.add(params, 'angleBisection').onChange(function() {
  		lines.forEach(function(l) {
  			l.angleBisection = params.angleBisection;
  			l.updateGeometry();
  		});
  	});
    gui.add(params, 'closed').onChange(function() {
  		lines.forEach(function(l) {
  			l.closed = params.closed;
        l.updateGeometry();
  		});
  	});
    gui.addColor(params, 'color').onChange(function() {
      lineMaterial.color = new THREE.Color(params.color);
      // var hex = color.getHexString();
      // var css = color.getStyle();
  	});
  	gui.add(params, 'lineWidth', 0.1, 250).onChange(function() {
  		lines.forEach(function(l) {
        l.lineWidth = params.lineWidth;
  			l.updateGeometry();
  		});
  	});
    gui.add(params, 'blurWidth', 0, 250).onChange(function() {
  		lines.forEach(function(l) {
        l.blurWidth = params.blurWidth;
  			l.updateGeometry();
  		});
  	});
    gui.add(params, 'blur').onChange( update );
  	gui.add(params, 'opacity', 0.0, 1.0).onChange(function() {
      lineMaterial.opacity = params.opacity;
  	});
    gui.add(params, 'wireframe').onChange(function() {
      lines.forEach(function(l) {
  			l.material = params.wireframe ? wireframeMaterial : lineMaterial;
  		});
  	});
    gui.add(params, 'autoRotate');
  } );

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
  lines.forEach(function(l) {
    if(params.autoRotate ) {
      l.rotation.y += 0.125 * delta;
    } else {
      l.rotation.y = 0;
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
  const line = new BlurredLine(curve, params.wireframe ? wireframeMaterial : lineMaterial, parseInt(params.resolution));
  // line.resolution = parseInt(params.resolution);
  line.lineWidth = params.lineWidth;
  line.blurWidth = params.blurWidth;
  line.blur = params.blur;
  line.angleBisection = params.angleBisection;
  line.upVector = new THREE.Vector3(0.0, 0.0, 1.0);
  line.closed = params.closed;
  line.updateGeometry();

  scene.add(line);
  line.position.x += i * 10;
  lines.push( line );

}

function createLines() {
  lineMaterial = new BlurredLineMaterial({
    color: new THREE.Color(params.color),
    // lineWidth: params.lineWidth,
    // blurWidth: params.blurWidth,
    // blur: params.blur,
    opacity: params.opacity,
  });

  for(var i = 0; i < params.amount; i++) {
  	createLine(i);
  }
}

function clearLines() {

  lines.forEach(function(l) {
  	scene.remove(l);
  });
  lines = [];

}
