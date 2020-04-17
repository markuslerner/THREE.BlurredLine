var LEFT_LINE = 0;
var RIGHT_LINE = 1;
var LEFT_SMOOTH_LINE = 2;
var RIGHT_SMOOTH_LINE = 3;

class SmoothLine {

  constructor(resolution = 1) {
    this.resolution = resolution;

    this.lineAtoms = [];

    this.strokeWidth = 1.0;
    this.smoothWidth = 1.0;

    this.strokeWidths = [];
    this.smoothWidths = [];
    this.colors = [];

    this.resolution;

    this.upVector = new THREE.Vector3(0.0, 0.0, 1.0);

    this.dynamic = false;
    this.closed = false;
    this.smooth = true;
    this.stippled = false;

    this.useContantColor = true;
    this.useContantStrokeWidth = true;
    this.useContantSmoothWidth = true;
    this.useAngleBisection = false; // true: good for 2d

    this.lineShapeVertices = [[]];

    this.calculateNormals = true;

    this.color = new THREE.Color();
    this.fadeColor = new THREE.Color(0x000000);

    this.opacity = 1.0;

    this.lineVertices = [];
    this.curve = null; // curve to read vertices from

    for(let i = 0; i < this.resolution + 1; i++) {
      this.lineVertices[i] = new THREE.Vector3();
    }

    if(this.colors === null) {
      this.colors = [];
      for(let i = 0; i < this.resolution + 1; i++) {
        this.colors[i] = new THREE.Color();
      }
    }

    if(this.strokeWidths === null) {
      this.strokeWidths = [];
      for(let i = 0; i < this.resolution + 1; i++) {
        this.strokeWidths[i] = 1.0;
      }
    }

    if(this.smoothWidths === null) {
      this.smoothWidths = [];
      for(let i = 0; i < this.resolution + 1; i++) {
        this.smoothWidths[i] = 0.0;
      }
    }

    this.lineShapeVertices = [];
    for(let i = 0; i < this.resolution + 1; i++) {
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
    var trianglesCount = (this.lineShapeVertices.length - 1) * 6;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(trianglesCount * 3 * 3);
    this.normals = new Float32Array(trianglesCount * 3 * 3);
    this.vertexColors = new Float32Array(trianglesCount * 3 * 3);

    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3));
    this.geometry.addAttribute('color', new THREE.BufferAttribute(this.vertexColors, 3));
    this.geometry.computeBoundingSphere();
  }

  updateGeometry(filled = false) {
    if(this.curve !== null) {
      // console.log( this.curve.getPoints(this.resolution) );
      this.setLineVertices(this.curve.getPoints(this.resolution));
    }

    if(!this.useContantColor && this.colors.length <= this.resolution) {
      console.error('Line.updateGeometry: colors Array length needs to be resolution + 1', this);
    }

    if(this.lineVertices != null) {
      this.updateLineShapeVertices();

      var lineShapeVertices = this.lineShapeVertices;

      var colorWithOpacity = this.color.clone();
      if(this.opacity < 1.0) {
        colorWithOpacity.lerp(this.fadeColor, 1.0 - this.opacity);
      }

      for(let i = 0; i < this.lineShapeVertices.length - 1; i++) {
        var index = i * 3 * 3 * 6;

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
              updatePosition(this.normals, index + c + 3, cb);
              updatePosition(this.normals, index + c + 6, cb);
            }
          } else {
            for(let c = 0; c < 6 * 9; c += 9) {
              updatePosition(this.normals, index + c, this.upVector);
              updatePosition(this.normals, index + c + 3, this.upVector);
              updatePosition(this.normals, index + c + 6, this.upVector);
            }
          }

        }

        if(this.useContantColor || this.colors.length <= this.resolution) {
          var c = colorWithOpacity;

          // stroke
          updateColor(this.vertexColors, index, c);
          updateColor(this.vertexColors, index + 3, c);
          updateColor(this.vertexColors, index + 6, c);

          updateColor(this.vertexColors, index + 9, c);
          updateColor(this.vertexColors, index + 12, c);
          updateColor(this.vertexColors, index + 15, c);

          // left smooth
          updateColor(this.vertexColors, index + 18, c);
          updateColor(this.vertexColors, index + 21, this.fadeColor);
          updateColor(this.vertexColors, index + 24, this.fadeColor);

          updateColor(this.vertexColors, index + 27, c);
          updateColor(this.vertexColors, index + 30, this.fadeColor);
          updateColor(this.vertexColors, index + 33, c);

          // right smooth
          updateColor(this.vertexColors, index + 36, c);
          updateColor(this.vertexColors, index + 39, c);
          updateColor(this.vertexColors, index + 42, this.fadeColor);

          updateColor(this.vertexColors, index + 45, this.fadeColor);
          updateColor(this.vertexColors, index + 48, c);
          updateColor(this.vertexColors, index + 51, this.fadeColor);

        } else {
          var c = this.colors[i].clone();
          if(this.opacity < 1.0) {
            c.lerp(this.fadeColor, 1.0 - this.opacity);
          }
          var c2 = this.colors[i + 1].clone();
          if(this.opacity < 1.0) {
            c2.lerp(this.fadeColor, 1.0 - this.opacity);
          }

          // stroke
          updateColor(this.vertexColors, index, c);
          updateColor(this.vertexColors, index + 3, c2);
          updateColor(this.vertexColors, index + 6, c);

          updateColor(this.vertexColors, index + 9, c);
          updateColor(this.vertexColors, index + 12, c2);
          updateColor(this.vertexColors, index + 15, c2);

          // left smooth
          updateColor(this.vertexColors, index + 18, c);
          updateColor(this.vertexColors, index + 21, this.fadeColor);
          updateColor(this.vertexColors, index + 24, this.fadeColor);

          updateColor(this.vertexColors, index + 27, c);
          updateColor(this.vertexColors, index + 30, this.fadeColor);
          updateColor(this.vertexColors, index + 33, c2);

          // right smooth
          updateColor(this.vertexColors, index + 36, c);
          updateColor(this.vertexColors, index + 39, c2);
          updateColor(this.vertexColors, index + 42, this.fadeColor);

          updateColor(this.vertexColors, index + 45, this.fadeColor);
          updateColor(this.vertexColors, index + 48, c2);
          updateColor(this.vertexColors, index + 51, this.fadeColor);

        }

      }

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.normal.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;

      // this.geometry.computeBoundingSphere();

    }
  }

  getColor() {
    return this.color;
  }

  getFadeColor() {
    return this.fadeColor;
  }

  getColors() {
    return this.colors;
  }

  getLineAtoms() {
    return this.lineAtoms;
  }

  getResolution() {
    return this.resolution;
  }

  getSmoothWidths() {
    return this.smoothWidths;
  }

  getUpVector() {
    return this.upVector;
  }

  getLineVertices() {
    return this.lineVertices;
  }

  getVertices() {
    return this.lineVertices;
  }

  getStrokeWidths() {
    return this.strokeWidths;
  }

  setCurve(curve) {
    this.curve = curve;
  }

  setVertices(lineVertices) {
    this.lineVertices = lineVertices;
  }

  setDynamic(dynamic) {
    this.dynamic = dynamic;
  }

  setColor(color) {
    this.color = color;
  }

  setColors(colors) {
    this.colors = colors;
  }

  setFadeColor(fadeColor) {
    this.fadeColor = fadeColor;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
  }

  setLineAtoms(lineAtoms) {
    this.lineAtoms = lineAtoms;
  }

  setResolution(resolution) {
    this.resolution = resolution;
  }

  setSmoothWidths(smoothWidths) {
    this.smoothWidths = smoothWidths;
  }

  setUpVector(upVector) {
    this.upVector = upVector;
  }

  setLineVertices(lineVertices) {
    this.lineVertices = lineVertices;
  }

  setStrokeWidths(strokeWidths) {
    this.strokeWidths = strokeWidths;
  }

  setSmooth(smooth) {
    this.smooth = smooth;
  }

  isDynamic() {
    return this.dynamic;
  }

  isSmooth() {
    return this.smooth;
  }

  isUseContantColor() {
    return this.useContantColor;
  }

  isUseContantSmoothWidth() {
    return this.useContantSmoothWidth;
  }

  isUseContantStrokeWidth() {
    return this.useContantStrokeWidth;
  }

  setUseContantColor(useContantColor) {
    this.useContantColor = useContantColor;
  }

  setUseContantSmoothWidth(useContantSmoothWidth) {
    this.useContantSmoothWidth = useContantSmoothWidth;
  }

  setUseContantStrokeWidth(useContantStrokeWidth) {
    this.useContantStrokeWidth = useContantStrokeWidth;
  }

  setUseAngleBisection(useAngleBisection) {
    this.useAngleBisection = useAngleBisection;
  }

  isUseAngleBisection() {
    return this.useAngleBisection;
  }

  getSmoothWidth() {
    return this.smoothWidth;
  }

  getStrokeWidth() {
    return this.strokeWidth;
  }

  setSmoothWidth(smoothWidth) {
    this.smoothWidth = smoothWidth;
  }

  setStrokeWidth(strokeWidth) {
    this.strokeWidth = strokeWidth;
  }

  isClosed() {
    return this.closed;
  }

  setClosed(closed) {
    this.closed = closed;
  }

  isStippled() {
    return this.stippled;
  }

  setStippled(stippled) {
    this.stippled = stippled;
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

    for(let i = 0; i < this.resolution; i++) {
      this.lineShapeVertices[i][LEFT_LINE].copy(lineVertices[i]);
      this.lineShapeVertices[i][RIGHT_LINE].copy(lineVertices[i]);
      this.lineShapeVertices[i][LEFT_SMOOTH_LINE].copy(lineVertices[i]);
      this.lineShapeVertices[i][RIGHT_SMOOTH_LINE].copy(lineVertices[i]);

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

      if(this.useAngleBisection) {
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

    // add the end point ===================================================
    this.lineShapeVertices[this.resolution][LEFT_LINE].copy(lineVertices[this.resolution]);
    this.lineShapeVertices[this.resolution][RIGHT_LINE].copy(lineVertices[this.resolution]);
    this.lineShapeVertices[this.resolution][LEFT_SMOOTH_LINE].copy(lineVertices[this.resolution]);
    this.lineShapeVertices[this.resolution][RIGHT_SMOOTH_LINE].copy(lineVertices[this.resolution]);

    // current point to next point -----------------------------------------
    vectorCurrent.copy(lineVertices[this.resolution]);
    vectorCurrent.sub(lineVertices[this.resolution - 1]);
    distanceCurrent = vectorCurrent.length();
    if(distanceCurrent > 0) {
      vectorCurrent.multiplyScalar(1.0 / distanceCurrent); // normalize
    }

    if(this.useAngleBisection) {
      // calcuate angle bisection (good for 2d):

      if(closed) {
        vectorSide.copy(lineVertices[lineVertices.length - 1]);
        vectorSide.sub(lineVertices[0]);
      } else {
        vectorSide.copy(vectorCurrent);
      }
      vectorSide.set(-vectorSide.y, vectorSide.x, vectorSide.z);

      vectorSidePrevious.copy(this.lineShapeVertices[this.resolution - 1][LEFT_LINE]);
      vectorSidePrevious.sub(lineVertices[this.resolution - 1]);
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
      vectorSide.multiplyScalar(this.strokeWidths[this.resolution] / 2.0);
    }

    this.lineShapeVertices[this.resolution][LEFT_LINE].add(vectorSide);
    this.lineShapeVertices[this.resolution][RIGHT_LINE].sub(vectorSide);

    if(this.useContantStrokeWidth) {
      if(this.useContantSmoothWidth) {
        vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidth));
      } else {
        vectorSideCopy.multiplyScalar((this.strokeWidth / 2.0 + this.smoothWidths[this.resolution]));
      }
    } else {
      if(this.useContantSmoothWidth) {
        vectorSideCopy.multiplyScalar((this.strokeWidths[this.resolution] / 2.0 + this.smoothWidth));
      } else {
        vectorSideCopy.multiplyScalar((this.strokeWidths[this.resolution] / 2.0 + this.smoothWidths[this.resolution]));
      }
    }

    this.lineShapeVertices[this.resolution][LEFT_SMOOTH_LINE].add(vectorSideCopy);
    this.lineShapeVertices[this.resolution][RIGHT_SMOOTH_LINE].sub(vectorSideCopy);

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
    return 'AbstractLine';
  }

}

function updatePosition(positions, index, point) {
  positions[index] = point.x;
  positions[index + 1] = point.y;
  positions[index + 2] = point.z;
}

function updateColor(colors, index, color) {
  colors[index] = color.r;
  colors[index + 1] = color.g;
  colors[index + 2] = color.b;
}
