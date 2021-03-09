var container;

var camera, scene, renderer;

init();
animate();

function init() {
  container = document.getElementById('container');

  camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    1,
    1000
  );
  camera.position.set(0, 0, 500);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  createLine();
}

function onWindowResize() {
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.render(scene, camera);
}

function createLine() {
  var curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-200, -100, 0),
    new THREE.Vector3(0, -100, 0),
    new THREE.Vector3(0, 100, 0),
    new THREE.Vector3(200, 100, 0)
  );

  const material = new BlurredLineMaterial({
    color: new THREE.Color('#FF0000'),
    opacity: 1.0,
  });

  const line = new BlurredLine(curve, material, 50);
  line.lineWidth = 2.0;
  line.blurWidth = 10.0;
  line.blur = true;
  line.updateGeometry();
  scene.add(line);
}
