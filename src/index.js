import {
  BufferGeometry,
  BufferAttribute,
  Color,
  DoubleSide,
  Mesh,
  RawShaderMaterial,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';

const LEFT_LINE = 0;
const RIGHT_LINE = 1;
const LEFT_SMOOTH_LINE = 2;
const RIGHT_SMOOTH_LINE = 3;

export class BlurredLine extends Mesh {
  constructor(curve, material, resolution = 1) {
    super(undefined, material);

    this.type = 'BlurredLine';

    this._resolution = resolution;

    this.lineWidth = 1.0;
    this.blurWidth = 1.0;
    this.blur = true;
    this.color = new Color();
    this.opacity = 1.0;

    this.upVector = new Vector3(0.0, 0.0, 1.0);

    this.closed = false;

    this.angleBisection = false; // true: good for 2d

    this.lineShapeVertices = [[]];

    // this.calculateNormals = true;

    this.lineVertices = [];
    this.curve = curve; // curve to read vertices from

    for (let i = 0; i < this._resolution + 1; i++) {
      this.lineVertices[i] = new Vector3();
    }

    this.lineShapeVertices = [];
    for (let i = 0; i < this._resolution + 1; i++) {
      var vertices = [];
      vertices[LEFT_LINE] = new Vector3();
      vertices[RIGHT_LINE] = new Vector3();
      vertices[LEFT_SMOOTH_LINE] = new Vector3();
      vertices[RIGHT_SMOOTH_LINE] = new Vector3();
      this.lineShapeVertices[i] = vertices;
    }

    this.createGeometry();
  }

  createGeometry() {
    var trianglesCount =
      (this.lineShapeVertices.length - 1) * (this.blur ? 6 : 2);
    this.geometry = new BufferGeometry();
    this.positions = new Float32Array(trianglesCount * 3 * 3);
    // this.normals = new Float32Array(trianglesCount * 3 * 3);
    this.vertexColors = new Float32Array(trianglesCount * 3 * 4);

    var positionAttribute = new BufferAttribute(this.positions, 3);
    // var normalAttribute = new BufferAttribute(this.normals, 3);
    var colorAttribute = new BufferAttribute(this.vertexColors, 4);

    this.geometry.setAttribute('position', positionAttribute);
    // this.geometry.setAttribute('normal', normalAttribute);
    this.geometry.setAttribute('color', colorAttribute);
    this.geometry.computeBoundingSphere();
  }

  updateGeometry(filled = false) {
    // console.log('updateGeometry()');

    if (this.curve !== null) {
      // console.log( this.curve.getPoints(this._resolution) );
      this.lineVertices = this.curve.getPoints(this._resolution);
      if (
        this.lineVertices.length > 0 &&
        this.lineVertices[0] instanceof Vector2
      ) {
        for (let i = 0; i < this.lineShapeVertices.length; i++) {
          var v = this.lineVertices[i];
          this.lineVertices[i] = new Vector3(v.x, v.y, 0.0);
        }
      }
    }

    if (this.lineVertices !== null) {
      this.geometry.attributes.position.needsUpdate = true;
      // this.geometry.attributes.normal.needsUpdate = true;

      this.updateLineShapeVertices();

      var lineShapeVertices = this.lineShapeVertices;

      for (let i = 0; i < this.lineShapeVertices.length - 1; i++) {
        var index = i * 3 * 3 * (this.blur ? 6 : 2);

        if (filled) {
          // lineAtoms[i].setVertices(this.lineShapeVertices[i][LEFT_LINE],
          //         lineVertices[i],
          //         lineVertices[i],
          //         lineVertices[i + 1],
          //         lineVertices[i + 1],
          //         lineShapeVertices[i + 1][LEFT_LINE],
          //         lineShapeVertices[i + 1][LEFT_SMOOTH_LINE],
          //         lineShapeVertices[i][LEFT_SMOOTH_LINE]);
        } else {
          // 6 triangles:

          // line
          updatePosition(
            this.positions,
            index,
            lineShapeVertices[i][LEFT_LINE]
          );
          updatePosition(
            this.positions,
            index + 3,
            lineShapeVertices[i + 1][LEFT_LINE]
          );
          updatePosition(
            this.positions,
            index + 6,
            lineShapeVertices[i][RIGHT_LINE]
          );

          updatePosition(
            this.positions,
            index + 9,
            lineShapeVertices[i][RIGHT_LINE]
          );
          updatePosition(
            this.positions,
            index + 12,
            lineShapeVertices[i + 1][LEFT_LINE]
          );
          updatePosition(
            this.positions,
            index + 15,
            lineShapeVertices[i + 1][RIGHT_LINE]
          );

          if (this.blur) {
            // left blur
            updatePosition(
              this.positions,
              index + 18,
              lineShapeVertices[i][LEFT_LINE]
            );
            updatePosition(
              this.positions,
              index + 21,
              lineShapeVertices[i][LEFT_SMOOTH_LINE]
            );
            updatePosition(
              this.positions,
              index + 24,
              lineShapeVertices[i + 1][LEFT_SMOOTH_LINE]
            );

            updatePosition(
              this.positions,
              index + 27,
              lineShapeVertices[i][LEFT_LINE]
            );
            updatePosition(
              this.positions,
              index + 30,
              lineShapeVertices[i + 1][LEFT_SMOOTH_LINE]
            );
            updatePosition(
              this.positions,
              index + 33,
              lineShapeVertices[i + 1][LEFT_LINE]
            );

            // right blur
            updatePosition(
              this.positions,
              index + 36,
              lineShapeVertices[i][RIGHT_LINE]
            );
            updatePosition(
              this.positions,
              index + 39,
              lineShapeVertices[i + 1][RIGHT_LINE]
            );
            updatePosition(
              this.positions,
              index + 42,
              lineShapeVertices[i][RIGHT_SMOOTH_LINE]
            );

            updatePosition(
              this.positions,
              index + 45,
              lineShapeVertices[i][RIGHT_SMOOTH_LINE]
            );
            updatePosition(
              this.positions,
              index + 48,
              lineShapeVertices[i + 1][RIGHT_LINE]
            );
            updatePosition(
              this.positions,
              index + 51,
              lineShapeVertices[i + 1][RIGHT_SMOOTH_LINE]
            );
          }

          // flat face normals
          // if(this.calculateNormals) {
          //   for(let c = 0; c < 6 * 9; c += 9) {
          //     var pA = new Vector3(this.positions[index + c + 0], this.positions[index + c + 1], this.positions[index + c + 2]);
          //     var pB = new Vector3(this.positions[index + c + 3], this.positions[index + c + 4], this.positions[index + c + 5]);
          //     var pC = new Vector3(this.positions[index + c + 6], this.positions[index + c + 7], this.positions[index + c + 8]);
          //     var cb = new Vector3().subVectors(pC, pB);
          //     var ab = new Vector3().subVectors(pA, pB);
          //     cb.cross(ab);
          //     cb.normalize();
          //     updatePosition(this.normals, index + c, cb);
          //     if(this.blur) {
          //       updatePosition(this.normals, index + c + 3, cb);
          //       updatePosition(this.normals, index + c + 6, cb);
          //     }
          //   }
          // } else {
          //   for(let c = 0; c < 6 * 9; c += 9) {
          //     updatePosition(this.normals, index + c, this.upVector);
          //     if(this.blur) {
          //       updatePosition(this.normals, index + c + 3, this.upVector);
          //       updatePosition(this.normals, index + c + 6, this.upVector);
          //     }
          //   }
          // }
        }
      }

      this.updateColors();

      // this.geometry.computeBoundingSphere();
    }
  }

  updateColors() {
    this.geometry.attributes.color.needsUpdate = true;

    for (let i = 0; i < this.lineShapeVertices.length - 1; i++) {
      var index = i * 3 * 4 * (this.blur ? 6 : 2);

      const p = i / (this._resolution - 1);
      var c = this._getColor(p);
      var o = this._getOpacity(p);

      // line
      updateColor(this.vertexColors, index, c, o);
      updateColor(this.vertexColors, index + 4, c, o);
      updateColor(this.vertexColors, index + 8, c, o);

      updateColor(this.vertexColors, index + 12, c, o);
      updateColor(this.vertexColors, index + 16, c, o);
      updateColor(this.vertexColors, index + 20, c, o);

      if (this.blur) {
        // left blur
        updateColor(this.vertexColors, index + 24, c, o);
        updateColor(this.vertexColors, index + 28, c, 0);
        updateColor(this.vertexColors, index + 32, c, 0);

        updateColor(this.vertexColors, index + 36, c, o);
        updateColor(this.vertexColors, index + 40, c, 0);
        updateColor(this.vertexColors, index + 44, c, o);

        // right blur
        updateColor(this.vertexColors, index + 48, c, o);
        updateColor(this.vertexColors, index + 52, c, o);
        updateColor(this.vertexColors, index + 56, c, 0);

        updateColor(this.vertexColors, index + 60, c, 0);
        updateColor(this.vertexColors, index + 64, c, o);
        updateColor(this.vertexColors, index + 68, c, 0);
      }
    }
  }

  getLength() {
    let l = 0.0;
    for (let i = 0; i < this.lineVertices.length - 1; i++) {
      l += this.lineVertices[i].distanceTo(this.lineVertices[i + 1]);
    }
    return l;
  }

  // scale widths and alpha by angle and distance ============================
  // @TODO can this be done in a more simple way?
  updateLineShapeVertices() {
    let distancePrevious, distanceCurrent;

    var vectorCurrent = new Vector3();
    var vectorPrevious = new Vector3();
    var vectorSide = new Vector3();
    var vectorSidePrevious = new Vector3();
    var vectorSideCopy = new Vector3();

    var lineVertices = this.lineVertices;

    for (let i = 0; i < this._resolution; i++) {
      this.lineShapeVertices[i][LEFT_LINE].copy(lineVertices[i]);
      this.lineShapeVertices[i][RIGHT_LINE].copy(lineVertices[i]);

      if (this.blur) {
        this.lineShapeVertices[i][LEFT_SMOOTH_LINE].copy(lineVertices[i]);
        this.lineShapeVertices[i][RIGHT_SMOOTH_LINE].copy(lineVertices[i]);
      }

      // previous point to current point ---------------------------------
      distancePrevious = 0.0;
      if (i > 0) {
        vectorPrevious.copy(lineVertices[i - 1]);
        vectorPrevious.sub(lineVertices[i]);
        distancePrevious = vectorPrevious.length();
      } else {
        if (this.closed) {
          vectorPrevious.copy(lineVertices[lineVertices.length - 1]);
          vectorPrevious.sub(lineVertices[i]);
          distancePrevious = vectorPrevious.length();
        } else {
          vectorPrevious.copy(0, 0, 0);
        }
      }
      if (distancePrevious > 0.0) {
        vectorPrevious.multiplyScalar(1.0 / distancePrevious); // normalize
      }

      // current point to next point -------------------------------------
      vectorCurrent.copy(lineVertices[i + 1]);
      vectorCurrent.sub(lineVertices[i]);
      distanceCurrent = vectorCurrent.length();

      if (distanceCurrent > 0.0) {
        vectorCurrent.multiplyScalar(1.0 / distanceCurrent); // normalize
      }

      if (this.angleBisection) {
        // calcuate angle bisection (good for 2d):
        vectorSide.copy(vectorCurrent);
        vectorSide.add(vectorPrevious);

        if ((distanceCurrent === 0 && distancePrevious === 0) || i === 0) {
          if (distanceCurrent === 0) {
            vectorCurrent.set(1, 0, 0);
          }
          if (this.closed) {
            vectorSide.copy(lineVertices[lineVertices.length - 1]);
            vectorSide.sub(lineVertices[0]);
          } else {
            vectorSide.copy(lineVertices[i + 1]);
            vectorSide.sub(lineVertices[i]);
          }

          vectorSide.set(-vectorSide.y, vectorSide.x, vectorSide.z);
        } else {
          // generate sideVector from upVector, if the sideVector could not be calculated from angle-bisection
          if (vectorSide.lengthSq() < 0.0001) {
            vectorSide.copy(this.upVector);
            vectorSide.cross(vectorCurrent);
          }

          vectorSidePrevious.copy(this.lineShapeVertices[i - 1][LEFT_LINE]);
          vectorSidePrevious.sub(lineVertices[i - 1]);
          if (vectorSide.dot(vectorSidePrevious) < 0) {
            vectorSide.negate();
          }
        }
      } else {
        this.calculateSideVector(vectorSide, vectorCurrent, vectorSidePrevious);
      }

      vectorSide.normalize();
      vectorSideCopy.copy(vectorSide);

      vectorSide.multiplyScalar(this._getLineWidth(i / this._resolution) / 2.0);

      this.lineShapeVertices[i][LEFT_LINE].add(vectorSide);
      this.lineShapeVertices[i][RIGHT_LINE].sub(vectorSide);

      if (this.blur) {
        const p = i / this._resolution;
        vectorSideCopy.multiplyScalar(
          this._getLineWidth(p) / 2.0 + this._getBlurWidth(p)
        );

        this.lineShapeVertices[i][LEFT_SMOOTH_LINE].add(vectorSideCopy);
        this.lineShapeVertices[i][RIGHT_SMOOTH_LINE].sub(vectorSideCopy);
      }
    }

    // add the end point ===================================================
    this.lineShapeVertices[this._resolution][LEFT_LINE].copy(
      lineVertices[this._resolution]
    );
    this.lineShapeVertices[this._resolution][RIGHT_LINE].copy(
      lineVertices[this._resolution]
    );

    if (this.blur) {
      this.lineShapeVertices[this._resolution][LEFT_SMOOTH_LINE].copy(
        lineVertices[this._resolution]
      );
      this.lineShapeVertices[this._resolution][RIGHT_SMOOTH_LINE].copy(
        lineVertices[this._resolution]
      );
    }

    // current point to next point -----------------------------------------
    vectorCurrent.copy(lineVertices[this._resolution]);
    vectorCurrent.sub(lineVertices[this._resolution - 1]);
    distanceCurrent = vectorCurrent.length();
    if (distanceCurrent > 0) {
      vectorCurrent.multiplyScalar(1.0 / distanceCurrent); // normalize
    }

    if (this.angleBisection) {
      // calcuate angle bisection (good for 2d):

      vectorSide.copy(vectorCurrent);
      vectorSide.set(-vectorSide.y, vectorSide.x, vectorSide.z);

      vectorSidePrevious.copy(
        this.lineShapeVertices[this._resolution - 1][LEFT_LINE]
      );
      vectorSidePrevious.sub(lineVertices[this._resolution - 1]);
      if (vectorSide.dot(vectorSidePrevious) < 0) {
        vectorSide.negate();
      }
    } else {
      this.calculateSideVector(vectorSide, vectorCurrent, vectorSidePrevious);
    }

    vectorSide.normalize();
    vectorSideCopy.copy(vectorSide);

    vectorSide.multiplyScalar(this._getLineWidth(1) / 2.0);

    this.lineShapeVertices[this._resolution][LEFT_LINE].add(vectorSide);
    this.lineShapeVertices[this._resolution][RIGHT_LINE].sub(vectorSide);

    if (this.blur) {
      vectorSideCopy.multiplyScalar(
        this._getLineWidth(1) / 2.0 + this._getBlurWidth(1)
      );

      this.lineShapeVertices[this._resolution][LEFT_SMOOTH_LINE].add(
        vectorSideCopy
      );
      this.lineShapeVertices[this._resolution][RIGHT_SMOOTH_LINE].sub(
        vectorSideCopy
      );
    }

    if (this.closed) {
      // this.lineShapeVertices[this._resolution] = this.lineShapeVertices[0];

      this.lineShapeVertices[this._resolution][LEFT_LINE].copy(
        this.lineShapeVertices[0][LEFT_LINE]
      );
      this.lineShapeVertices[this._resolution][RIGHT_LINE].copy(
        this.lineShapeVertices[0][RIGHT_LINE]
      );
      this.lineShapeVertices[this._resolution][LEFT_SMOOTH_LINE].copy(
        this.lineShapeVertices[0][LEFT_SMOOTH_LINE]
      );
      this.lineShapeVertices[this._resolution][RIGHT_SMOOTH_LINE].copy(
        this.lineShapeVertices[0][RIGHT_SMOOTH_LINE]
      );
    }
  }

  calculateSideVector(vectorSide, vectorCurrent, vectorSidePrevious) {
    // calculate side vector from upVector (better for 3d):

    vectorSide.copy(vectorCurrent);
    // if(Math.abs(this.upVector.z) === 1.0) {
    //   vectorSide.z = 0;
    // }
    vectorSide.cross(this.upVector);
    // vectorSide.lerp(vectorSidePrevious, 0.95);
    if (vectorSide.lengthSq() < 0.01) {
      // use previous side vector, if current side vector is too short:
      vectorSide.copy(vectorSidePrevious);
    }

    vectorSidePrevious.copy(vectorSide);
  }

  getInterpolatedPoint(pos) {
    // position irrespective of length between points:

    let startIndex = 0;
    let delta = 0.0;

    var totalLength = this.length();
    let currentLength = 0.0;
    for (let i = 0; i < this.lineVertices.length - 1; i++) {
      let l = this.lineVertices[i].distanceTo(this.lineVertices[i + 1]);
      currentLength += l;
      if (currentLength / totalLength > pos) {
        startIndex = i;

        let x = pos * totalLength;
        let xStart = currentLength - l;
        let xEnd = currentLength;

        delta = (x - xStart) / (xEnd - xStart);

        break;
      }
    }

    var point = new Vector3();

    if (startIndex < this.lineVertices.length - 1) {
      point.copy(this.lineVertices[startIndex]);
      point.lerp(this.lineVertices[startIndex + 1], delta);
    }
    return point;
  }

  _getLineWidth(p) {
    if (this.lineWidthModifier) {
      return this.lineWidth * this.lineWidthModifier(p);
    } else {
      return this.lineWidth;
    }
  }

  _getBlurWidth(p) {
    if (this.blurWidthModifier) {
      return this.blurWidth * this.blurWidthModifier(p);
    } else {
      return this.blurWidth;
    }
  }

  _getColor(p) {
    if (this.colorModifier) {
      return this.color.clone().multiply(this.colorModifier(p));
    } else {
      return this.color;
    }
  }

  _getOpacity(p) {
    if (this.opacityModifier) {
      return this.opacity * this.opacityModifier(p);
    } else {
      return this.opacity;
    }
  }

  toString() {
    return 'BlurredLine';
  }
}

function updatePosition(positions, index, point) {
  positions[index] = point.x;
  positions[index + 1] = point.y;
  positions[index + 2] = point.z;
}

function updateColor(colors, index, color, alpha = 1) {
  colors[index] = color.r;
  colors[index + 1] = color.g;
  colors[index + 2] = color.b;
  colors[index + 3] = alpha;
}

export class BlurredLineMaterial extends RawShaderMaterial {
  constructor(parameters) {
    super();

    if (!parameters) {
      parameters = {
        depthTest: false,
        side: DoubleSide,
        transparent: true,
      };
    } else {
      if (parameters.depthTest === undefined) parameters.depthTest = false;
      if (parameters.side === undefined) parameters.side = DoubleSide;
      if (parameters.transparent === undefined) parameters.transparent = true;
    }

    this.uniforms = {
      materialColor: { value: new Color(0xffffff) },
      opacity: { value: 1.0 },
    };

    this.color = new Color();

    this.vertexShader = `
        precision mediump float;
        precision mediump int;

        uniform mat4 modelViewMatrix; // optional
        uniform mat4 projectionMatrix; // optional

        attribute vec3 position;
        attribute vec4 color;

        uniform vec3 materialColor;
        uniform float opacity;

        // varying vec3 vPosition;
        varying vec4 vColor;

        void main()	{

          // vPosition = position;
          vColor = color * vec4( materialColor, opacity );

          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }
      `;

    this.fragmentShader = `
        precision mediump float;
        precision mediump int;

        // uniform float time;
        // uniform float color;
        // uniform float opacity;

        // varying vec3 vPosition;
        varying vec4 vColor;

        void main()	{

          vec4 c = vColor;
          // c.a *= opacity;
          // color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

          gl_FragColor = c;

        }
      `;

    this.type = 'BlurredLineMaterial';

    Object.defineProperties(this, {
      color: {
        enumerable: true,
        get: function () {
          return this.uniforms.materialColor.value;
        },
        set: function (value) {
          this.uniforms.materialColor.value = value;
        },
      },
      opacity: {
        enumerable: true,
        get: function () {
          return this.uniforms.opacity.value;
        },
        set: function (value) {
          this.uniforms.opacity.value = value;
        },
      },
    });

    this.setValues(parameters);
  }

  copy(source) {
    ShaderMaterial.prototype.copy.call(this, source);

    this.color.copy(source.color);
    this.opacity = source.opacity;

    return this;
  }
}
