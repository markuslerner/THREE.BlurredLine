# THREE.BlurredLine

[![NPM Package](https://img.shields.io/npm/v/three.blurredline.svg?style=flat)](https://www.npmjs.com/package/three.blurredline)

Draw lines of varying width, blur, color and opacity in [THREE.js](https://github.com/mrdoob/three.js/)

This libary draws lines as a mesh and internally creates a BufferGeometry.

It is useful not only for drawing wide soft lines, but also extremely thin lines neatly.

## Examples

- [All features](https://dev.markuslerner.com/three.blurredline/examples/all.html): Demo of all the features
- [Simple](https://dev.markuslerner.com/three.blurredline/examples/simple.html): Simple Example
- [Modifiers](https://dev.markuslerner.com/three.blurredline/examples/modifiers.html): Using modifier functions to draw varying line widths, blur widths and colors

## Usage

- Include script
- Create a [Curve](https://threejs.org/docs/#api/en/extras/core/Curve)
- Create a BlurredLineMaterial
- Create a BlurredLine supplying curve and material

### Including the script

Include script after THREE is included:

```js
<script src="src/index.js"></script>
```

or include directly from unpkg.com:

```js
<script src="https://unpkg.com/three.blurredline"></script>
```

or use npm to install it:

```
npm i three.blurredline
```

or use yarn to install it:

```
yarn add three.blurredline
```

and include it in your code:

```js
import * as THREE from 'three';
import { BlurredLine, BlurredLineMaterial } from 'three.blurredline';
```

#### Create a Curve

First create a [Curve](https://threejs.org/docs/#api/en/extras/core/Curve) e.g. using THREE.CubicBezierCurve3, THREE.EllipseCurve, THREE.LineCurve3, THREE.Path or THREE.SplineCurve.

```js
var curve = new THREE.LineCurve3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(100, 0, 0)
);
```

#### Create a BlurredLineMaterial

```js
var material = new BlurredLineMaterial({
  color: new THREE.Color('#FF0000'),
  opacity: 1.0,
});
```

- `color` – `THREE.Color`
- `opacity` – alpha value from 0 to 1

#### Create a BlurredLine

Use Curve and BlurredLineMaterial to create a BlurredLine mesh, call `updateGeometry()` and add it to the scene. The third parameter specifies the resolution:

```js
var line = new BlurredLine(curve, material, 50);
line.lineWidth = 2.0;
line.blurWidth = 10.0;
line.blur = true;
line.updateGeometry();
scene.add(line);
```

`updateGeometry()` needs to be called again whenever any parameter affecting the geometry changes (angleBisection, blur, blurWidth, blurWidthModifier, curve, lineWidth, lineWidthModifier, upVector).

## API

### BlurredLine class

Extends [THREE.Mesh](https://threejs.org/docs/#api/en/objects/Mesh).

**Constructor:**

BlurredLine(curve : THREE.Curve, material: BlurredLineMaterial, resolution : number)

**Variables:**

`angleBisection`: boolean – use angle bisection to calculate the side vectors (better for 2D lines)

`blur`: boolean – whether to use blurWidth or draw hard lines instead (uses less triangles when set to false)

`blurWidth`: number – blur width of the line

`blurWidthModifier`: function – modifier function for the blur width of the line. Has to return a number. For example cubic easing in: `(p) => { return p * p; }`

`closed`: boolean – whether the line is closed (e.g. used for ellipses)

`color`: THREE.Color – defaults to white and is multiplied with material color while drawing.

`colorModifier`: function – modifier function for the line color. Has to return a THREE.Color. colorModifier is multiplied with color and material color while drawing. For example for a transition between two colors: `(p) => { return new THREE.Color(0x000000).lerp(new THREE.Color(0xff0000), p); }`

`curve`: THREE.Curve – base curve

`lineWidth`: number – thickness of the line

`lineWidthModifier`: function – modifier function for the width of the line. Has to return a number. For example cubic easing in: `(p) => { return p * p; }`

`opacity`: number – opacity of the line, is multiplied with material opacity while drawing.

`opacityModifier`: function – modifier function for the opacity of the line. Has to return a number. opacityModifier is multiplied with color and material color while drawing. For example cubic easing in: `(p) => { return p * p; }`

`upVector`: THREE.Vector3 – upvector, e.g. vector facing the camera, defaults to (0.0, 0.0, 1.0).

**Methods:**

`updateColors()` – needs to be called again whenever any parameter affecting the color changes (color, colorModifier, opacity, opacityModifier). Material parameter changes are updated automatically.

`updateGeometry()` – needs to be called again whenever any parameter affecting the geometry changes (angleBisection, blur, blurWidth, blurWidthModifier, curve, lineWidth, lineWidthModifier, upVector). Internally calls updateColors() as well. Material parameter changes are updated automatically.

### BlurredLineMaterial class

Extends [THREE.RawShaderMaterial](https://threejs.org/docs/#api/en/materials/RawShaderMaterial).

**Constructor:**

BlurredLineMaterial(parameters : Object)
parameters – (optional) an object with one or more properties defining the material's appearance. Any property of the material (including any property inherited from Material and ShaderMaterial) can be passed in here.

**Properties:**

Also see the base [THREE.RawShaderMaterial](https://threejs.org/docs/#api/en/materials/RawShaderMaterial) class for common properties.

`color` (THREE.Color) – defaults to white and is multiplied with material color while drawing.

`opacity` (number) – opacity of the line, is multiplied with material opacity while drawing.

**Methods:**

See the base [THREE.RawShaderMaterial](https://threejs.org/docs/#api/en/materials/RawShaderMaterial) class for common methods.

### License

MIT licensed

Copyright (C) 2021 Markus Lerner, http://www.markuslerner.com
