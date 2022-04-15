import{BufferGeometry as w,BufferAttribute as V,Color as m,DoubleSide as _,Mesh as W,RawShaderMaterial as L,ShaderMaterial as M,Vector2 as P,Vector3 as c}from"three";var u=0,p=1,v=2,g=3,b=class extends W{constructor(i,e,s=1){super(void 0,e),this.type="BlurredLine",this._resolution=s,this.lineWidth=1,this.blurWidth=1,this.blur=!0,this.color=new m,this.upVector=new c(0,0,1),this.closed=!1,this.angleBisection=!1,this.lineShapeVertices=[[]],this.lineVertices=[],this.curve=i;for(let t=0;t<this._resolution+1;t++)this.lineVertices[t]=new c;this.lineShapeVertices=[];for(let t=0;t<this._resolution+1;t++){var o=[];o[u]=new c,o[p]=new c,o[v]=new c,o[g]=new c,this.lineShapeVertices[t]=o}this.createGeometry()}createGeometry(){var i=(this.lineShapeVertices.length-1)*(this.blur?6:2);this.geometry=new w,this.positions=new Float32Array(i*3*3),this.vertexColors=new Float32Array(i*3*4);var e=new V(this.positions,3),s=new V(this.vertexColors,4);this.geometry.setAttribute("position",e),this.geometry.setAttribute("color",s),this.geometry.computeBoundingSphere()}updateGeometry(i=!1){if(this.curve!==null&&(this.lineVertices=this.curve.getPoints(this._resolution),this.lineVertices.length>0&&this.lineVertices[0]instanceof P))for(let t=0;t<this.lineShapeVertices.length;t++){var e=this.lineVertices[t];this.lineVertices[t]=new c(e.x,e.y,0)}if(this.lineVertices!==null){this.geometry.attributes.position.needsUpdate=!0,this.updateLineShapeVertices();var s=this.lineShapeVertices;for(let t=0;t<this.lineShapeVertices.length-1;t++){var o=t*3*3*(this.blur?6:2);i||(h(this.positions,o,s[t][u]),h(this.positions,o+3,s[t+1][u]),h(this.positions,o+6,s[t][p]),h(this.positions,o+9,s[t][p]),h(this.positions,o+12,s[t+1][u]),h(this.positions,o+15,s[t+1][p]),this.blur&&(h(this.positions,o+18,s[t][u]),h(this.positions,o+21,s[t][v]),h(this.positions,o+24,s[t+1][v]),h(this.positions,o+27,s[t][u]),h(this.positions,o+30,s[t+1][v]),h(this.positions,o+33,s[t+1][u]),h(this.positions,o+36,s[t][p]),h(this.positions,o+39,s[t+1][p]),h(this.positions,o+42,s[t][g]),h(this.positions,o+45,s[t][g]),h(this.positions,o+48,s[t+1][p]),h(this.positions,o+51,s[t+1][g])))}this.updateColors()}}updateColors(){this.geometry.attributes.color.needsUpdate=!0;for(let s=0;s<this.lineShapeVertices.length-1;s++){var i=s*3*4*(this.blur?6:2),e=this._getColor(s/(this._resolution-1));n(this.vertexColors,i,e),n(this.vertexColors,i+4,e),n(this.vertexColors,i+8,e),n(this.vertexColors,i+12,e),n(this.vertexColors,i+16,e),n(this.vertexColors,i+20,e),this.blur&&(n(this.vertexColors,i+24,e),n(this.vertexColors,i+28,e,0),n(this.vertexColors,i+32,e,0),n(this.vertexColors,i+36,e),n(this.vertexColors,i+40,e,0),n(this.vertexColors,i+44,e),n(this.vertexColors,i+48,e),n(this.vertexColors,i+52,e),n(this.vertexColors,i+56,e,0),n(this.vertexColors,i+60,e,0),n(this.vertexColors,i+64,e),n(this.vertexColors,i+68,e,0))}}getLength(){let i=0;for(let e=0;e<this.lineVertices.length-1;e++)i+=this.lineVertices[e].distanceTo(this.lineVertices[e+1]);return i}updateLineShapeVertices(){let i,e;var s=new c,o=new c,t=new c,f=new c,a=new c,l=this.lineVertices;for(let r=0;r<this._resolution;r++)if(this.lineShapeVertices[r][u].copy(l[r]),this.lineShapeVertices[r][p].copy(l[r]),this.blur&&(this.lineShapeVertices[r][v].copy(l[r]),this.lineShapeVertices[r][g].copy(l[r])),i=0,r>0?(o.copy(l[r-1]),o.sub(l[r]),i=o.length()):this.closed?(o.copy(l[l.length-1]),o.sub(l[r]),i=o.length()):o.copy(0,0,0),i>0&&o.multiplyScalar(1/i),s.copy(l[r+1]),s.sub(l[r]),e=s.length(),e>0&&s.multiplyScalar(1/e),this.angleBisection?(t.copy(s),t.add(o),e===0&&i===0||r===0?(e===0&&s.set(1,0,0),this.closed?(t.copy(l[l.length-1]),t.sub(l[0])):(t.copy(l[r+1]),t.sub(l[r])),t.set(-t.y,t.x,t.z)):(t.lengthSq()<1e-4&&(t.copy(this.upVector),t.cross(s)),f.copy(this.lineShapeVertices[r-1][u]),f.sub(l[r-1]),t.dot(f)<0&&t.negate())):this.calculateSideVector(t,s,f),t.normalize(),a.copy(t),t.multiplyScalar(this._getLineWidth(r/this._resolution)/2),this.lineShapeVertices[r][u].add(t),this.lineShapeVertices[r][p].sub(t),this.blur){let d=r/this._resolution;a.multiplyScalar(this._getLineWidth(d)/2+this._getBlurWidth(d)),this.lineShapeVertices[r][v].add(a),this.lineShapeVertices[r][g].sub(a)}this.lineShapeVertices[this._resolution][u].copy(l[this._resolution]),this.lineShapeVertices[this._resolution][p].copy(l[this._resolution]),this.blur&&(this.lineShapeVertices[this._resolution][v].copy(l[this._resolution]),this.lineShapeVertices[this._resolution][g].copy(l[this._resolution])),s.copy(l[this._resolution]),s.sub(l[this._resolution-1]),e=s.length(),e>0&&s.multiplyScalar(1/e),this.angleBisection?(t.copy(s),t.set(-t.y,t.x,t.z),f.copy(this.lineShapeVertices[this._resolution-1][u]),f.sub(l[this._resolution-1]),t.dot(f)<0&&t.negate()):this.calculateSideVector(t,s,f),t.normalize(),a.copy(t),t.multiplyScalar(this._getLineWidth(1)/2),this.lineShapeVertices[this._resolution][u].add(t),this.lineShapeVertices[this._resolution][p].sub(t),this.blur&&(a.multiplyScalar(this._getLineWidth(1)/2+this._getBlurWidth(1)),this.lineShapeVertices[this._resolution][v].add(a),this.lineShapeVertices[this._resolution][g].sub(a)),this.closed&&(this.lineShapeVertices[this._resolution][u].copy(this.lineShapeVertices[0][u]),this.lineShapeVertices[this._resolution][p].copy(this.lineShapeVertices[0][p]),this.lineShapeVertices[this._resolution][v].copy(this.lineShapeVertices[0][v]),this.lineShapeVertices[this._resolution][g].copy(this.lineShapeVertices[0][g]))}calculateSideVector(i,e,s){i.copy(e),i.cross(this.upVector),i.lengthSq()<.01&&i.copy(s),s.copy(i)}getInterpolatedPoint(i){let e=0,s=0;var o=this.length();let t=0;for(let a=0;a<this.lineVertices.length-1;a++){let l=this.lineVertices[a].distanceTo(this.lineVertices[a+1]);if(t+=l,t/o>i){e=a;let r=i*o,d=t-l,S=t;s=(r-d)/(S-d);break}}var f=new c;return e<this.lineVertices.length-1&&(f.copy(this.lineVertices[e]),f.lerp(this.lineVertices[e+1],s)),f}_getLineWidth(i){return this.lineWidthModifier?this.lineWidth*this.lineWidthModifier(i):this.lineWidth}_getBlurWidth(i){return this.blurWidthModifier?this.blurWidth*this.blurWidthModifier(i):this.blurWidth}_getColor(i){return this.colorModifier?this.color.clone().multiply(this.colorModifier(i)):this.color}toString(){return"BlurredLine"}};function h(y,i,e){y[i]=e.x,y[i+1]=e.y,y[i+2]=e.z}function n(y,i,e,s=1){y[i]=e.r,y[i+1]=e.g,y[i+2]=e.b,y[i+3]=s}var C=class extends L{constructor(i){super(),i?(i.depthTest===void 0&&(i.depthTest=!1),i.side===void 0&&(i.side=_),i.transparent===void 0&&(i.transparent=!0)):i={depthTest:!1,side:_,transparent:!0},this.uniforms={materialColor:{value:new m(16777215)},opacity:{value:1}},this.color=new m,this.vertexShader=`
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
      `,this.fragmentShader=`
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
      `,this.type="BlurredLineMaterial",Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.materialColor.value},set:function(e){this.uniforms.materialColor.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}}}),this.setValues(i)}copy(i){return M.prototype.copy.call(this,i),this.color.copy(i.color),this.opacity=i.opacity,this}};export{b as BlurredLine,C as BlurredLineMaterial};
//# sourceMappingURL=three.interactive.js.map
