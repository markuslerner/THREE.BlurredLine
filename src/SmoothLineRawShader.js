var LEFT_LINE = 0;
var RIGHT_LINE = 1;
var LEFT_SMOOTH_LINE = 2;
var RIGHT_SMOOTH_LINE = 3;

class SmoothLine {

  constructor(resolution = 1, smooth = true) {
    this._resolution = resolution;
    this._smooth = smooth;

    this.lineAtoms = [];

    this.strokeWidth = 1.0;
    this.smoothWidth = 1.0;

    this.strokeWidths = [];
    this.smoothWidths = [];
    this.colors = [];

    this.upVector = new THREE.Vector3(0.0, 0.0, 1.0);

    this.closed = false;

    this.useContantColor = true;
    this.useContantStrokeWidth = true;
    this.useContantSmoothWidth = true;
    this.angleBisection = false; // true: good for 2d

    this.lineShapeVertices = [[]];

    this.calculateNormals = true;

    this.color = new THREE.Color();
    // this.fadeColor = new THREE.Color(0x000000);

    this.opacity = 1.0;

    this.lineVertices = [];
    this.curve = null; // curve to read vertices from

    for(let i = 0; i < this._resolution + 1; i++) {
      this.lineVertices[i] = new THREE.Vector3();
    }

    if(this.colors === null) {
      this.colors = [];
      for(let i = 0; i < this._resolution + 1; i++) {
        this.colors[i] = new THREE.Color();
      }
    }

    if(this.strokeWidths === null) {
      this.strokeWidths = [];
      for(let i = 0; i < this._resolution + 1; i++) {
        this.strokeWidths[i] = 1.0;
      }
    }

    if(this.smoothWidths === null) {
      this.smoothWidths = [];
      for(let i = 0; i < this._resolution + 1; i++) {
        this.smoothWidths[i] = 0.0;
      }
    }

    this.lineShapeVertices = [];
    for(let i = 0; i < this._resolution + 1; i++) {
      var vertices = [];
      vertices[LEFT_LINE] = new THREE.Vector3();
      vertices[RIGHT_LINE] = new THREE.Vector3();
      vertices[LEFT_SMOOTH_LINE] = new THREE.Vector3();
      vertices[RIGHT_SMOOTH_LINE] = new THREE.Vector3();
      this.lineShapeVertices[i] = vertices;
    }

    this.createGeometry();

  }

  createGeometry() {
    var trianglesCount = (this.lineShapeVertices.length - 1) * (this._smooth ? 6 : 2);
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(trianglesCount * 3 * 3);
    // this.positions = [];
    // for(var i = 0; i < trianglesCount * 3 * 3; i++) {
    //   this.positions.push( Math.random() - 0.5 );
    // }
    this.normals = new Float32Array(trianglesCount * 3 * 3);
    this.vertexColors = new Float32Array(trianglesCount * 3 * 4);
    // this.vertexColors = [];
    // for(var i = 0; i < trianglesCount * 3 * 4; i++) {
    //   this.vertexColors.push( Math.random() * 255 );
    // }

    var positionAttribute = new THREE.BufferAttribute(this.positions, 3);
    // var positionAttribute = new THREE.Float32BufferAttribute(this.positions, 3);
    var normalAttribute = new THREE.BufferAttribute(this.normals, 3);
    var colorAttribute = new THREE.BufferAttribute(this.vertexColors, 4);
    // var colorAttribute = new THREE.Uint8BufferAttribute(this.vertexColors, 4);
    // colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader

    this.geometry.setAttribute('position', positionAttribute);
    // this.geometry.setAttribute('normal', normalAttribute);
    this.geometry.setAttribute('color', colorAttribute);
    this.geometry.computeBoundingSphere();

  }

  updateGeometry(filled = false) {
    if(this.curve !== null) {
      // console.log( this.curve.getPoints(this._resolution) );
      this.lineVertices = this.curve.getPoints(this._resolution);
    }

    if(!this.useContantColor && this.colors.length <= this._resolution) {
      console.error('Line.updateGeometry: colors Array length needs to be resolution + 1', this);
    }

    if(this.lineVertices !== null) {
      this.updateLineShapeVertices();

      var lineShapeVertices = this.lineShapeVertices;

      var colorWithOpacity = this.color;
      // var colorWithOpacity = this.color.clone();
      // if(this.opacity < 1.0) {
      //   colorWithOpacity.lerp(this.fadeColor, 1.0 - this.opacity);
      // }

      for(let i = 0; i < this.lineShapeVertices.length - 1; i++) {
        var index = i * 3 * 3 * (this._smooth ? 6 : 2);

        if(filled) {
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

          // stroke
          updatePosition(this.positions, index, lineShapeVertices[i][LEFT_LINE]);
          updatePosition(this.positions, index + 3, lineShapeVertices[i + 1][LEFT_LINE]);
          updatePosition(this.positions, index + 6, lineShapeVertices[i][RIGHT_LINE]);

          updatePosition(this.positions, index + 9, lineShapeVertices[i][RIGHT_LINE]);
          updatePosition(this.positions, index + 12, lineShapeVertices[i + 1][LEFT_LINE]);
          updatePosition(this.positions, index + 15, lineShapeVertices[i + 1][RIGHT_LINE]);

          if(this._smooth) {
            // left smooth
            updatePosition(this.positions, index + 18, lineShapeVertices[i][LEFT_LINE]);
            updatePosition(this.positions, index + 21, lineShapeVertices[i][LEFT_SMOOTH_LINE]);
            updatePosition(this.positions, index + 24, lineShapeVertices[i + 1][LEFT_SMOOTH_LINE]);

            updatePosition(this.positions, index + 27, lineShapeVertices[i][LEFT_LINE]);
            updatePosition(this.positions, index + 30, lineShapeVertices[i + 1][LEFT_SMOOTH_LINE]);
            updatePosition(this.positions, index + 33, lineShapeVertices[i + 1][LEFT_LINE]);

            // right smooth
            updatePosition(this.positions, index + 36, lineShapeVertices[i][RIGHT_LINE]);
            updatePosition(this.positions, index + 39, lineShapeVertices[i + 1][RIGHT_LINE]);
            updatePosition(this.positions, index + 42, lineShapeVertices[i][RIGHT_SMOOTH_LINE]);

            updatePosition(this.positions, index + 45, lineShapeVertices[i][RIGHT_SMOOTH_LINE]);
            updatePosition(this.positions, index + 48, lineShapeVertices[i + 1][RIGHT_LINE]);
            updatePosition(this.positions, index + 51, lineShapeVertices[i + 1][RIGHT_SMOOTH_LINE]);
          }

          // flat face normals
          if(this.calculateNormals) {
            for(let c = 0; c < 6 * 9; c += 9) {
              var pA = new THREE.Vector3(this.positions[index + c + 0], this.positions[index + c + 1], this.positions[index + c + 2]);
              var pB = new THREE.Vector3(this.positions[index + c + 3], this.positions[index + c + 4], this.positions[index + c + 5]);
              var pC = new THREE.Vector3(this.positions[index + c + 6], this.positions[index + c + 7], this.positions[index + c + 8]);
              var cb = new THREE.Vector3().subVectors(pC, pB);
              var ab = new THREE.Vector3().subVectors(pA, pB);
              cb.cross(ab);
              cb.normalize();
              updatePosition(this.normals, index + c, cb);
              if(this._smooth) {
                updatePosition(this.normals, index + c + 3, cb);
                updatePosition(this.normals, index + c + 6, cb);
              }
            }
          } else {
            for(let c = 0; c < 6 * 9; c += 9) {
              updatePosition(this.normals, index + c, this.upVector);
              if(this._smooth) {
                updatePosition(this.normals, index + c + 3, this.upVector);
                updatePosition(this.normals, index + c + 6, this.upVector);
              }
            }
          }

        }

      }


      for(let i = 0; i < this.lineShapeVertices.length - 1; i++) {
        var index = i * 3 * 4 * (this._smooth ? 6 : 2);

        if(this.useContantColor || this.colors.length <= this._resolution) {
          var c = colorWithOpacity;

          // stroke
          updateColor(this.vertexColors, index, c);
          updateColor(this.vertexColors, index + 4, c);
          updateColor(this.vertexColors, index + 8, c);

          updateColor(this.vertexColors, index + 12, c);
          updateColor(this.vertexColors, index + 16, c);
          updateColor(this.vertexColors, index + 20, c);

          if(this._smooth) {
            // left smooth
            updateColor(this.vertexColors, index + 24, c);
            updateColor(this.vertexColors, index + 28, c, 0);
            updateColor(this.vertexColors, index + 32, c, 0);

            updateColor(this.vertexColors, index + 36, c);
            updateColor(this.vertexColors, index + 40, c, 0);
            updateColor(this.vertexColors, index + 44, c);

            // right smooth
            updateColor(this.vertexColors, index + 48, c);
            updateColor(this.vertexColors, index + 52, c);
            updateColor(this.vertexColors, index + 56, c, 0);

            updateColor(this.vertexColors, index + 60, c, 0);
            updateColor(this.vertexColors, index + 64, c);
            updateColor(this.vertexColors, index + 68, c, 0);
          }

        } else {
          var c = this.colors[i].clone();
          // if(this.opacity < 1.0) {
          //   c.lerp(this.fadeColor, 1.0 - this.opacity);
          // }
          var c2 = this.colors[i + 1].clone();
          // if(this.opacity < 1.0) {
          //   c2.lerp(this.fadeColor, 1.0 - this.opacity);
          // }

          // stroke
          updateColor(this.vertexColors, index, c);
          updateColor(this.vertexColors, index + 4, c2);
          updateColor(this.vertexColors, index + 8, c);

          updateColor(this.vertexColors, index + 12, c);
          updateColor(this.vertexColors, index + 16, c2);
          updateColor(this.vertexColors, index + 20, c2);

          if(this._smooth) {
            // left smooth
            updateColor(this.vertexColors, index + 24, c);
            updateColor(this.vertexColors, index + 28, c, 0);
            updateColor(this.vertexColors, index + 32, c, 0);

            updateColor(this.vertexColors, index + 36, c);
            updateColor(this.vertexColors, index + 40, c, 0);
            updateColor(this.vertexColors, index + 44, c2);

            // right smooth
            updateColor(this.vertexColors, index + 48, c);
            updateColor(this.vertexColors, index + 52, c2);
            updateColor(this.vertexColors, index + 56, c, 0);

            updateColor(this.vertexColors, index + 60, c, 0);
            updateColor(this.vertexColors, index + 64, c2);
            updateColor(this.vertexColors, index + 68, c, 0);
          }
        }

      }


      this.geometry.attributes.position.needsUpdate = true;
      // this.geometry.attributes.normal.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;

      // this.geometry.computeBoundingSphere();

    }
  }

  getLength() {
    let l = 0.0;
    for(let i = 0; i < this.lineVertices.length - 1; i++) {
      l += this.lineVertices[i].distanceTo(this.lineVertices[i + 1]);
    }
    return l;
  }

  // scale widths and alpha by angle and distance ============================
  // @TODO can this be done in a more simple way?
  updateLineShapeVertices() {
    let distancePrevious, distanceCurrent;

    var vectorCurrent = new THREE.Vector3();
    var vectorPrevious = new THREE.Vector3();
    var vectorSide = new THREE.Vector3();
    var vectorSidePrevious = new THREE.Vector3();
    var vectorSideCopy = new THREE.Vector3();

    var lineVertices = this.lineVertices;

    for(let i = 0; i < this._resolution; i++) {
      this.lineShapeVertices[i][LEFT_LINE].copy(lineVertices[i]);
      this.lineShapeVertices[i][RIGHT_LINE].copy(lineVertices[i]);

      if(this._smooth) {
        this.lineShapeVertices[i][LEFT_SMOOTH_LINE].copy(lineVertices[i]);
        this.lineShapeVertices[i][RIGHT_SMOOTH_LINE].copy(lineVertices[i]);
      }

      // previous point to current point ---------------------------------
      distancePrevious = 0.0;
      if(i > 0) {
        vectorPrevious.copy(lineVertices[i - 1]);
        vectorPrevious.sub(lineVertices[i]);
        distancePrevious = vectorPrevious.length();
      } else {
        if(closed) {
          vectorPrevious.copy(lineVertices[lineVertices.length - 1]);
          vectorPrevious.sub(lineVertices[i]);
          distancePrevious = vectorPrevious.length();
        } else {
          vectorPrevious.copy(0, 0, 0);
        }
      }
      if(distancePrevious > 0.0) {
        vectorPrevious.multiplyScalar(1.0 / distancePrevious); // normalize
      }

      // current point to next point -------------------------------------
      vectorCurrent.copy(lineVertices[i + 1]);
      vectorCurrent.sub(lineVertices[i]);
      distanceCurrent = vectorCurrent.length();

      if(distanceCurrent > 0.0) {
        vectorCurrent.multiplyScalar(1.0 / distanceCurrent); // normalize
      }

      if(this.angleBisection) {
        // calcuate angle bisection (good for 2d):
        vectorSide.copy(vectorCurrent);
        vectorSide.add(vectorPrevious);

        if((distanceCurrent === 0 && distancePrevious === 0) || i === 0) {
          if(distanceCurrent === 0) {
            vectorCurrent.set(1, 0, 0);
          }
          if(closed) {
            vectorSide.copy(lineVertices[lineVertices.length - 1]);
            vectorSide.sub(lineVertices[0]);
          } else {
            vectorSide.copy(lineVertices[i + 1]);
            vectorSide.sub(lineVertices[i]);
          }

          vectorSide.set(-vectorSide.y, vectorSide.x, vectorSide.z);

        } else {
          // generate sideVector from upVector, if the sideVector could not be calculated from angle-bisection
          if(vectorSide.lengthSq() < 0.0001) {
            vectorSide.copy(this.upVector);
            vectorSide.cross(vectorCurrent);
          }

          vectorSidePrevious.copy(this.lineShapeVertices[i - 1][LEFT_LINE]);
          vectorSidePrevious.sub(lineVertices[i - 1]);
          if(vectorSide.dot(vectorSidePrevious) < 0) {
            vectorSide.negate();
          }
        }

      } else {
        this.calculateSideVector(vectorSide, vectorCurrent, vectorSidePrevious);

      }

      vectorSide.normalize();
      vectorSideCopy.copy(vectorSide);

      if(this.useContantStrokeWidth) {
        vectorSide.multiplyScalar(this.strokeWidth / 2.0);
      } else {
        vectorSide.multiplyScalar(this.strokeWidths[i] / 2.0);
      }

      this.lineShapeVertices[i][LEFT_LINE].add(vectorSide);
      this.lineShapeVertices[i][RIGHT_LINE].sub(vectorSide);

      if(this._smooth) {
        if(this.useContantStrokeWidth) {
          if(this.useContantSmoothWidth) {
            vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidth));
          } else {
            vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidths[i]));
          }
        } else {
          if(this.useContantSmoothWidth) {
            vectorSideCopy.multiplyScalar((this.strokeWidths[i] / 2.0 + this.smoothWidth));
          } else {
            vectorSideCopy.multiplyScalar((this.strokeWidths[i] / 2.0 + this.smoothWidths[i]));
          }
        }

        this.lineShapeVertices[i][LEFT_SMOOTH_LINE].add(vectorSideCopy);
        this.lineShapeVertices[i][RIGHT_SMOOTH_LINE].sub(vectorSideCopy);
      }
    }

    // add the end point ===================================================
    this.lineShapeVertices[this._resolution][LEFT_LINE].copy(lineVertices[this._resolution]);
    this.lineShapeVertices[this._resolution][RIGHT_LINE].copy(lineVertices[this._resolution]);

    if(this._smooth) {
      this.lineShapeVertices[this._resolution][LEFT_SMOOTH_LINE].copy(lineVertices[this._resolution]);
      this.lineShapeVertices[this._resolution][RIGHT_SMOOTH_LINE].copy(lineVertices[this._resolution]);
    }

    // current point to next point -----------------------------------------
    vectorCurrent.copy(lineVertices[this._resolution]);
    vectorCurrent.sub(lineVertices[this._resolution - 1]);
    distanceCurrent = vectorCurrent.length();
    if(distanceCurrent > 0) {
      vectorCurrent.multiplyScalar(1.0 / distanceCurrent); // normalize
    }

    if(this.angleBisection) {
      // calcuate angle bisection (good for 2d):

      if(closed) {
        vectorSide.copy(lineVertices[lineVertices.length - 1]);
        vectorSide.sub(lineVertices[0]);
      } else {
        vectorSide.copy(vectorCurrent);
      }
      vectorSide.set(-vectorSide.y, vectorSide.x, vectorSide.z);

      vectorSidePrevious.copy(this.lineShapeVertices[this._resolution - 1][LEFT_LINE]);
      vectorSidePrevious.sub(lineVertices[this._resolution - 1]);
      if(vectorSide.dot(vectorSidePrevious) < 0) {
        vectorSide.negate();
      }

    } else {
      this.calculateSideVector(vectorSide, vectorCurrent, vectorSidePrevious);

    }

    vectorSide.normalize();
    vectorSideCopy.copy(vectorSide);

    if(this.useContantStrokeWidth) {
      vectorSide.multiplyScalar(this.strokeWidth / 2.0);
    } else {
      vectorSide.multiplyScalar(this.strokeWidths[this._resolution] / 2.0);
    }

    this.lineShapeVertices[this._resolution][LEFT_LINE].add(vectorSide);
    this.lineShapeVertices[this._resolution][RIGHT_LINE].sub(vectorSide);

    if(this._smooth) {
      if(this.useContantStrokeWidth) {
        if(this.useContantSmoothWidth) {
          vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidth));
        } else {
          vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidths[this._resolution]));
        }
      } else {
        if(this.useContantSmoothWidth) {
          vectorSideCopy.multiplyScalar((this.strokeWidths[this._resolution] / 2.0 + this.smoothWidth));
        } else {
          vectorSideCopy.multiplyScalar((this.strokeWidths[this._resolution] / 2.0 + this.smoothWidths[this._resolution]));
        }
      }

      this.lineShapeVertices[this._resolution][LEFT_SMOOTH_LINE].add(vectorSideCopy);
      this.lineShapeVertices[this._resolution][RIGHT_SMOOTH_LINE].sub(vectorSideCopy);
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
    if(vectorSide.lengthSq() < 0.01) {
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
    for(let i = 0; i < this.lineVertices.length - 1; i++) {
      let l = this.lineVertices[i].distanceTo(this.lineVertices[i + 1]);
      currentLength += l;
      if(currentLength / totalLength > pos) {
        startIndex = i;

        let x = pos * totalLength;
        let xStart = (currentLength - l);
        let xEnd = currentLength;

        delta = (x - xStart) / (xEnd - xStart);

        break;
      }
    }

    var point = new THREE.Vector3();

    if(startIndex < this.lineVertices.length - 1) {
      point.copy(this.lineVertices[startIndex]);
      point.lerp(this.lineVertices[startIndex + 1], delta);
    }
    return point;
  }

  toString() {
    return 'SmoothLine';
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
