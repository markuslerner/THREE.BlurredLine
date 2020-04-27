# THREE.BlurredLine

[![NPM Package](https://img.shields.io/npm/v/three.blurredline.svg?style=flat)](https://www.npmjs.com/package/three.blurredline)

Draw lines of varying widths with a soft blurry edge in [THREE.js](https://github.com/mrdoob/three.js/)

This libary draws lines as a mesh and internally creates a BufferGeometry.

It is useful not only for drawing wide soft lines, but also extreme thin lines neatly.


### Examples ####

* [Demo](https://www.markuslerner.com/github/three.blurredline/examples/index.html): Showcase of most of the features
* [Simple](https://www.markuslerner.com/github/three.blurredline/examples/simple.html): Simple Example
* [Modifiers](https://www.markuslerner.com/github/three.blurredline/examples/modifiers.html): Using modifier functions to draw varying line widths, blur widths and colors

### Usage ####

* Include script
* Create a [Curve](https://threejs.org/docs/#api/en/extras/core/Curve)
* Create a BlurredLineMaterial
* Create a BlurredLine supplying curve and material

#### Including the script ####

Include script after THREE is included:

```js
<script src="src/BlurredLine.js"></script>
```

or use npm to install it:

```
npm i three.blurredline
```

and include it in your code:
```js
import * as THREE from 'three';
import { BlurredLine, BlurredLineMaterial } from 'three.blurredline';
```


##### Create a Curve #####

First create a [Curve](https://threejs.org/docs/#api/en/extras/core/Curve) e.g. using THREE.CubicBezierCurve3, THREE.EllipseCurve, THREE.LineCurve3, THREE.Path or THREE.SplineCurve.

```js
var curve = new THREE.LineCurve3(
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(100, 0, 0),
);
```

##### Create a BlurredLineMaterial #####

```js
var material = new BlurredLineMaterial({
	color: new THREE.Color('#FF0000'),
	opacity: 1.0,
});
```

* ```color``` – ```THREE.Color```
* ```opacity``` – alpha value from 0 to 1

##### Create a BlurredLine #####

Use Curve and BlurredLineMaterial to create a BlurredLine mesh, call ```updateGeometry()``` and add it to the scene. The third parameter specifies the resolution:

```js
var line = new BlurredLine(curve, material, 50);
line.lineWidth = 2.0;
line.blurWidth = 10.0;
line.blur = true;
line.updateGeometry();
scene.add(line);
```

```updateGeometry()``` has to be called again whenever any parameter changes.

* ```color``` – color can be specified here as well. Defaults to white and is multiplied with material color while drawing.
* ```colorModifier``` – modifier function for the line color, e.g. transition between two colors: ```function(p) {
    return new THREE.Color(0x000000).lerp(new THREE.Color(0xff0000), p);
  }```
* ```lineWidth``` – thickness of the line
* ```lineWidthModifier``` – modifier function for the width of the line, e.g. cubic easing in: ```function(p) { return p * p; }```
* ```blurWidth``` – blur width of the line
* ```blurWidthModifier``` – modifier function for the blur width of the line, e.g. cubic easing in: ```function(p) { return p * p; }```
* ```blur``` – whether to use blurWidth or draw hard lines instead (uses less triangles when set to false)
* ```angleBisection``` – use angle bisection to calculate the side vectors (better for 2D lines)
* ```upVector``` – vector facing the camera
* ```closed``` – whether the line is closed (e.g. used for ellipses)

#### License ####

MIT licensed

Copyright (C) 2020 Markus Lerner, http://www.markuslerner.com
