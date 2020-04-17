import * as THREE from './three.module.js';

import Stats from './stats.module.js';

var container, stats;

var camera, scene, renderer;

init();
animate();

function init() {

  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10 );
  camera.position.z = 2;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x101010 );

  // geometry
  // nr of triangles with 3 vertices per triangle
  var vertexCount = 200 * 3;

  var geometry = new THREE.BufferGeometry();

  var positions = [];
  var colors = [];

  for ( var i = 0; i < vertexCount; i ++ ) {

    // adding x,y,z
    positions.push( Math.random() - 0.5 );
    positions.push( Math.random() - 0.5 );
    positions.push( Math.random() - 0.5 );

    // adding r,g,b,a
    colors.push( Math.random() * 255 );
    colors.push( Math.random() * 255 );
    colors.push( Math.random() * 255 );
    colors.push( Math.random() * 255 );

  }

  var positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
  var colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );

  colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader

  geometry.setAttribute( 'position', positionAttribute );
  geometry.setAttribute( 'color', colorAttribute );

  // material

  var material = new THREE.RawShaderMaterial( {

    uniforms: {
      time: { value: 1.0 }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    side: THREE.DoubleSide,
    transparent: true

  } );

  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  var time = performance.now();

  var object = scene.children[ 0 ];

  object.rotation.y = time * 0.0005;
  object.material.uniforms.time.value = time * 0.005;

  renderer.render( scene, camera );

}
