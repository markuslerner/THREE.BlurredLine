var container;

var camera, scene, renderer;

init();
animate();

function init() {

  container = document.getElementById( 'container' );

  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
  camera.position.set( 0, 0, 500 );

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  createLine();

}

function onWindowResize() {

  camera.left   = window.innerWidth / - 2;
  camera.right  = window.innerWidth / 2;
  camera.top    = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  renderer.render( scene, camera );

}

function createLine() {
  var curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-200, -100, 0),
    new THREE.Vector3(0, -100, 0),
    new THREE.Vector3(0, 100, 0),
    new THREE.Vector3(200, 100, 0),
  );

  const line = new BlurredLine(curve, 50);
  line.color = new THREE.Color('#FF0000');
  line.strokeWidth = 2.0; // 2f
  line.smoothWidth = 10.0; // 3f
  line.updateGeometry();

  line.mesh = new THREE.Mesh(line.geometry, undefined);
  scene.add(line.mesh);
}
