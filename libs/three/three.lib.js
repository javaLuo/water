/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",

    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform float opacity;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "void main() {",

    "vec4 texel = texture2D( tDiffuse, vUv );",
    "gl_FragColor = opacity * texel;",

    "}",
  ].join("\n"),
};

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS2DObject = function (element) {
  THREE.Object3D.call(this);

  this.element = element;
  this.element.style.position = "absolute";

  this.addEventListener("removed", function (event) {
    if (this.element.parentNode !== null) {
      this.element.parentNode.removeChild(this.element);
    }
  });
};

THREE.CSS2DObject.prototype = Object.create(THREE.Object3D.prototype);
THREE.CSS2DObject.prototype.constructor = THREE.CSS2DObject;

//

THREE.CSS2DRenderer = function () {
  console.log("THREE.CSS2DRenderer", THREE.REVISION);

  var _width, _height;
  var _widthHalf, _heightHalf;

  var vector = new THREE.Vector3();
  var viewMatrix = new THREE.Matrix4();
  var viewProjectionMatrix = new THREE.Matrix4();

  var domElement = document.createElement("div");
  domElement.style.overflow = "hidden";

  this.domElement = domElement;

  this.getSize = function () {
    return {
      width: _width,
      height: _height,
    };
  };

  this.setSize = function (width, height) {
    _width = width;
    _height = height;

    _widthHalf = _width / 2;
    _heightHalf = _height / 2;

    domElement.style.width = width + "px";
    domElement.style.height = height + "px";
  };

  var renderObject = function (object, camera) {
    if (object instanceof THREE.CSS2DObject) {
      vector.setFromMatrixPosition(object.matrixWorld);
      vector.applyMatrix4(viewProjectionMatrix);

      var element = object.element;
      var style =
        "translate(-50%,-50%) translate(" +
        (vector.x * _widthHalf + _widthHalf) +
        "px," +
        (-vector.y * _heightHalf + _heightHalf) +
        "px)";

      element.style.WebkitTransform = style;
      element.style.MozTransform = style;
      element.style.oTransform = style;
      element.style.transform = style;

      if (element.parentNode !== domElement) {
        domElement.appendChild(element);
      }
    }

    for (var i = 0, l = object.children.length; i < l; i++) {
      renderObject(object.children[i], camera);
    }
  };

  this.render = function (scene, camera) {
    scene.updateMatrixWorld();

    if (camera.parent === null) camera.updateMatrixWorld();

    viewMatrix.copy(camera.matrixWorldInverse);
    viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);

    renderObject(scene, camera);
  };
};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.DigitalGlitch = {
  uniforms: {
    tDiffuse: { value: null }, //diffuse texture
    tDisp: { value: null }, //displacement texture for digital glitch squares
    byp: { value: 0 }, //apply the glitch ?
    amount: { value: 0.08 },
    angle: { value: 0.02 },
    seed: { value: 0.02 },
    seed_x: { value: 0.02 }, //-1,1
    seed_y: { value: 0.02 }, //-1,1
    distortion_x: { value: 0.5 },
    distortion_y: { value: 0.6 },
    col_s: { value: 0.05 },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform int byp;", //should we apply the glitch ?

    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tDisp;",

    "uniform float amount;",
    "uniform float angle;",
    "uniform float seed;",
    "uniform float seed_x;",
    "uniform float seed_y;",
    "uniform float distortion_x;",
    "uniform float distortion_y;",
    "uniform float col_s;",

    "varying vec2 vUv;",

    "float rand(vec2 co){",
    "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "void main() {",
    "if(byp<1) {",
    "vec2 p = vUv;",
    "float xs = floor(gl_FragCoord.x / 0.5);",
    "float ys = floor(gl_FragCoord.y / 0.5);",
    //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    "vec4 normal = texture2D (tDisp, p*seed*seed);",
    "if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
    "if(seed_x>0.){",
    "p.y = 1. - (p.y + distortion_y);",
    "}",
    "else {",
    "p.y = distortion_y;",
    "}",
    "}",
    "if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
    "if(seed_y>0.){",
    "p.x=distortion_x;",
    "}",
    "else {",
    "p.x = 1. - (p.x + distortion_x);",
    "}",
    "}",
    "p.x+=normal.x*seed_x*(seed/5.);",
    "p.y+=normal.y*seed_y*(seed/5.);",
    //base from RGB shift shader
    "vec2 offset = amount * vec2( cos(angle), sin(angle));",
    "vec4 cr = texture2D(tDiffuse, p + offset);",
    "vec4 cga = texture2D(tDiffuse, p);",
    "vec4 cb = texture2D(tDiffuse, p - offset);",
    "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
    //add noise
    "vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
    "gl_FragColor = gl_FragColor+ snow;",
    "}",
    "else {",
    "gl_FragColor=texture2D (tDiffuse, vUv);",
    "}",
    "}",
  ].join("\n"),
};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function (renderer, renderTarget) {
  this.renderer = renderer;

  if (renderTarget === undefined) {
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    };

    var size = renderer.getDrawingBufferSize();
    renderTarget = new THREE.WebGLRenderTarget(
      size.width,
      size.height,
      parameters
    );
    renderTarget.texture.name = "EffectComposer.rt1";
  }

  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();
  this.renderTarget2.texture.name = "EffectComposer.rt2";

  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;

  this.passes = [];

  // dependencies

  if (THREE.CopyShader === undefined) {
    console.error("THREE.EffectComposer relies on THREE.CopyShader");
  }

  if (THREE.ShaderPass === undefined) {
    console.error("THREE.EffectComposer relies on THREE.ShaderPass");
  }

  this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
};

Object.assign(THREE.EffectComposer.prototype, {
  swapBuffers: function () {
    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  },

  addPass: function (pass) {
    this.passes.push(pass);

    var size = this.renderer.getDrawingBufferSize();
    pass.setSize(size.width, size.height);
  },

  insertPass: function (pass, index) {
    this.passes.splice(index, 0, pass);
  },

  render: function (delta) {
    var maskActive = false;

    var pass,
      i,
      il = this.passes.length;

    for (i = 0; i < il; i++) {
      pass = this.passes[i];

      if (pass.enabled === false) continue;

      pass.render(
        this.renderer,
        this.writeBuffer,
        this.readBuffer,
        delta,
        maskActive
      );

      if (pass.needsSwap) {
        if (maskActive) {
          var context = this.renderer.context;

          context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

          this.copyPass.render(
            this.renderer,
            this.writeBuffer,
            this.readBuffer,
            delta
          );

          context.stencilFunc(context.EQUAL, 1, 0xffffffff);
        }

        this.swapBuffers();
      }

      if (THREE.MaskPass !== undefined) {
        if (pass instanceof THREE.MaskPass) {
          maskActive = true;
        } else if (pass instanceof THREE.ClearMaskPass) {
          maskActive = false;
        }
      }
    }
  },

  reset: function (renderTarget) {
    if (renderTarget === undefined) {
      var size = this.renderer.getDrawingBufferSize();

      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(size.width, size.height);
    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  },

  setSize: function (width, height) {
    this.renderTarget1.setSize(width, height);
    this.renderTarget2.setSize(width, height);

    for (var i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(width, height);
    }
  },
});

THREE.Pass = function () {
  // if set to true, the pass is processed by the composer
  this.enabled = true;

  // if set to true, the pass indicates to swap read and write buffer after rendering
  this.needsSwap = true;

  // if set to true, the pass clears its buffer before rendering
  this.clear = false;

  // if set to true, the result of the pass is rendered to screen
  this.renderToScreen = false;
};

Object.assign(THREE.Pass.prototype, {
  setSize: function (width, height) {},

  render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  },
});

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1 / 1024, 1 / 512) },
  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",

    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n"),

  fragmentShader: [
    "precision highp float;",
    "",
    "uniform sampler2D tDiffuse;",
    "",
    "uniform vec2 resolution;",
    "",
    "varying vec2 vUv;",
    "",
    "// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)",
    "",
    "//----------------------------------------------------------------------------------",
    "// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag",
    "// SDK Version: v3.00",
    "// Email:       gameworks@nvidia.com",
    "// Site:        http://developer.nvidia.com/",
    "//",
    "// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.",
    "//",
    "// Redistribution and use in source and binary forms, with or without",
    "// modification, are permitted provided that the following conditions",
    "// are met:",
    "//  * Redistributions of source code must retain the above copyright",
    "//    notice, this list of conditions and the following disclaimer.",
    "//  * Redistributions in binary form must reproduce the above copyright",
    "//    notice, this list of conditions and the following disclaimer in the",
    "//    documentation and/or other materials provided with the distribution.",
    "//  * Neither the name of NVIDIA CORPORATION nor the names of its",
    "//    contributors may be used to endorse or promote products derived",
    "//    from this software without specific prior written permission.",
    "//",
    "// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY",
    "// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE",
    "// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR",
    "// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR",
    "// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,",
    "// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,",
    "// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR",
    "// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY",
    "// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT",
    "// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE",
    "// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
    "//",
    "//----------------------------------------------------------------------------------",
    "",
    "#define FXAA_PC 1",
    "#define FXAA_GLSL_100 1",
    "#define FXAA_QUALITY_PRESET 12",
    "",
    "#define FXAA_GREEN_AS_LUMA 1",
    "",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_PC_CONSOLE",
    "    //",
    "    // The console algorithm for PC is included",
    "    // for developers targeting really low spec machines.",
    "    // Likely better to just run FXAA_PC, and use a really low preset.",
    "    //",
    "    #define FXAA_PC_CONSOLE 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_GLSL_120",
    "    #define FXAA_GLSL_120 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_GLSL_130",
    "    #define FXAA_GLSL_130 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_HLSL_3",
    "    #define FXAA_HLSL_3 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_HLSL_4",
    "    #define FXAA_HLSL_4 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_HLSL_5",
    "    #define FXAA_HLSL_5 0",
    "#endif",
    "/*==========================================================================*/",
    "#ifndef FXAA_GREEN_AS_LUMA",
    "    //",
    "    // For those using non-linear color,",
    "    // and either not able to get luma in alpha, or not wanting to,",
    "    // this enables FXAA to run using green as a proxy for luma.",
    "    // So with this enabled, no need to pack luma in alpha.",
    "    //",
    "    // This will turn off AA on anything which lacks some amount of green.",
    "    // Pure red and blue or combination of only R and B, will get no AA.",
    "    //",
    "    // Might want to lower the settings for both,",
    "    //    fxaaConsoleEdgeThresholdMin",
    "    //    fxaaQualityEdgeThresholdMin",
    "    // In order to insure AA does not get turned off on colors",
    "    // which contain a minor amount of green.",
    "    //",
    "    // 1 = On.",
    "    // 0 = Off.",
    "    //",
    "    #define FXAA_GREEN_AS_LUMA 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_EARLY_EXIT",
    "    //",
    "    // Controls algorithm's early exit path.",
    "    // On PS3 turning this ON adds 2 cycles to the shader.",
    "    // On 360 turning this OFF adds 10ths of a millisecond to the shader.",
    "    // Turning this off on console will result in a more blurry image.",
    "    // So this defaults to on.",
    "    //",
    "    // 1 = On.",
    "    // 0 = Off.",
    "    //",
    "    #define FXAA_EARLY_EXIT 1",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_DISCARD",
    "    //",
    "    // Only valid for PC OpenGL currently.",
    "    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.",
    "    //",
    "    // 1 = Use discard on pixels which don't need AA.",
    "    //     For APIs which enable concurrent TEX+ROP from same surface.",
    "    // 0 = Return unchanged color on pixels which don't need AA.",
    "    //",
    "    #define FXAA_DISCARD 0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_FAST_PIXEL_OFFSET",
    "    //",
    "    // Used for GLSL 120 only.",
    "    //",
    "    // 1 = GL API supports fast pixel offsets",
    "    // 0 = do not use fast pixel offsets",
    "    //",
    "    #ifdef GL_EXT_gpu_shader4",
    "        #define FXAA_FAST_PIXEL_OFFSET 1",
    "    #endif",
    "    #ifdef GL_NV_gpu_shader5",
    "        #define FXAA_FAST_PIXEL_OFFSET 1",
    "    #endif",
    "    #ifdef GL_ARB_gpu_shader5",
    "        #define FXAA_FAST_PIXEL_OFFSET 1",
    "    #endif",
    "    #ifndef FXAA_FAST_PIXEL_OFFSET",
    "        #define FXAA_FAST_PIXEL_OFFSET 0",
    "    #endif",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#ifndef FXAA_GATHER4_ALPHA",
    "    //",
    "    // 1 = API supports gather4 on alpha channel.",
    "    // 0 = API does not support gather4 on alpha channel.",
    "    //",
    "    #if (FXAA_HLSL_5 == 1)",
    "        #define FXAA_GATHER4_ALPHA 1",
    "    #endif",
    "    #ifdef GL_ARB_gpu_shader5",
    "        #define FXAA_GATHER4_ALPHA 1",
    "    #endif",
    "    #ifdef GL_NV_gpu_shader5",
    "        #define FXAA_GATHER4_ALPHA 1",
    "    #endif",
    "    #ifndef FXAA_GATHER4_ALPHA",
    "        #define FXAA_GATHER4_ALPHA 0",
    "    #endif",
    "#endif",
    "",
    "",
    "/*============================================================================",
    "                        FXAA QUALITY - TUNING KNOBS",
    "------------------------------------------------------------------------------",
    "NOTE the other tuning knobs are now in the shader function inputs!",
    "============================================================================*/",
    "#ifndef FXAA_QUALITY_PRESET",
    "    //",
    "    // Choose the quality preset.",
    "    // This needs to be compiled into the shader as it effects code.",
    "    // Best option to include multiple presets is to",
    "    // in each shader define the preset, then include this file.",
    "    //",
    "    // OPTIONS",
    "    // -----------------------------------------------------------------------",
    "    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)",
    "    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)",
    "    // 39       - no dither, very expensive",
    "    //",
    "    // NOTES",
    "    // -----------------------------------------------------------------------",
    "    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)",
    "    // 13 = about same speed as FXAA 3.9 and better than 12",
    "    // 23 = closest to FXAA 3.9 visually and performance wise",
    "    //  _ = the lowest digit is directly related to performance",
    "    // _  = the highest digit is directly related to style",
    "    //",
    "    #define FXAA_QUALITY_PRESET 12",
    "#endif",
    "",
    "",
    "/*============================================================================",
    "",
    "                           FXAA QUALITY - PRESETS",
    "",
    "============================================================================*/",
    "",
    "/*============================================================================",
    "                     FXAA QUALITY - MEDIUM DITHER PRESETS",
    "============================================================================*/",
    "#if (FXAA_QUALITY_PRESET == 10)",
    "    #define FXAA_QUALITY_PS 3",
    "    #define FXAA_QUALITY_P0 1.5",
    "    #define FXAA_QUALITY_P1 3.0",
    "    #define FXAA_QUALITY_P2 12.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 11)",
    "    #define FXAA_QUALITY_PS 4",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 3.0",
    "    #define FXAA_QUALITY_P3 12.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 12)",
    "    #define FXAA_QUALITY_PS 5",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 4.0",
    "    #define FXAA_QUALITY_P4 12.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 13)",
    "    #define FXAA_QUALITY_PS 6",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 4.0",
    "    #define FXAA_QUALITY_P5 12.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 14)",
    "    #define FXAA_QUALITY_PS 7",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 4.0",
    "    #define FXAA_QUALITY_P6 12.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 15)",
    "    #define FXAA_QUALITY_PS 8",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 4.0",
    "    #define FXAA_QUALITY_P7 12.0",
    "#endif",
    "",
    "/*============================================================================",
    "                     FXAA QUALITY - LOW DITHER PRESETS",
    "============================================================================*/",
    "#if (FXAA_QUALITY_PRESET == 20)",
    "    #define FXAA_QUALITY_PS 3",
    "    #define FXAA_QUALITY_P0 1.5",
    "    #define FXAA_QUALITY_P1 2.0",
    "    #define FXAA_QUALITY_P2 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 21)",
    "    #define FXAA_QUALITY_PS 4",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 22)",
    "    #define FXAA_QUALITY_PS 5",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 23)",
    "    #define FXAA_QUALITY_PS 6",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 24)",
    "    #define FXAA_QUALITY_PS 7",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 3.0",
    "    #define FXAA_QUALITY_P6 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 25)",
    "    #define FXAA_QUALITY_PS 8",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 4.0",
    "    #define FXAA_QUALITY_P7 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 26)",
    "    #define FXAA_QUALITY_PS 9",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 2.0",
    "    #define FXAA_QUALITY_P7 4.0",
    "    #define FXAA_QUALITY_P8 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 27)",
    "    #define FXAA_QUALITY_PS 10",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 2.0",
    "    #define FXAA_QUALITY_P7 2.0",
    "    #define FXAA_QUALITY_P8 4.0",
    "    #define FXAA_QUALITY_P9 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 28)",
    "    #define FXAA_QUALITY_PS 11",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 2.0",
    "    #define FXAA_QUALITY_P7 2.0",
    "    #define FXAA_QUALITY_P8 2.0",
    "    #define FXAA_QUALITY_P9 4.0",
    "    #define FXAA_QUALITY_P10 8.0",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_QUALITY_PRESET == 29)",
    "    #define FXAA_QUALITY_PS 12",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.5",
    "    #define FXAA_QUALITY_P2 2.0",
    "    #define FXAA_QUALITY_P3 2.0",
    "    #define FXAA_QUALITY_P4 2.0",
    "    #define FXAA_QUALITY_P5 2.0",
    "    #define FXAA_QUALITY_P6 2.0",
    "    #define FXAA_QUALITY_P7 2.0",
    "    #define FXAA_QUALITY_P8 2.0",
    "    #define FXAA_QUALITY_P9 2.0",
    "    #define FXAA_QUALITY_P10 4.0",
    "    #define FXAA_QUALITY_P11 8.0",
    "#endif",
    "",
    "/*============================================================================",
    "                     FXAA QUALITY - EXTREME QUALITY",
    "============================================================================*/",
    "#if (FXAA_QUALITY_PRESET == 39)",
    "    #define FXAA_QUALITY_PS 12",
    "    #define FXAA_QUALITY_P0 1.0",
    "    #define FXAA_QUALITY_P1 1.0",
    "    #define FXAA_QUALITY_P2 1.0",
    "    #define FXAA_QUALITY_P3 1.0",
    "    #define FXAA_QUALITY_P4 1.0",
    "    #define FXAA_QUALITY_P5 1.5",
    "    #define FXAA_QUALITY_P6 2.0",
    "    #define FXAA_QUALITY_P7 2.0",
    "    #define FXAA_QUALITY_P8 2.0",
    "    #define FXAA_QUALITY_P9 2.0",
    "    #define FXAA_QUALITY_P10 4.0",
    "    #define FXAA_QUALITY_P11 8.0",
    "#endif",
    "",
    "",
    "",
    "/*============================================================================",
    "",
    "                                API PORTING",
    "",
    "============================================================================*/",
    "#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)",
    "    #define FxaaBool bool",
    "    #define FxaaDiscard discard",
    "    #define FxaaFloat float",
    "    #define FxaaFloat2 vec2",
    "    #define FxaaFloat3 vec3",
    "    #define FxaaFloat4 vec4",
    "    #define FxaaHalf float",
    "    #define FxaaHalf2 vec2",
    "    #define FxaaHalf3 vec3",
    "    #define FxaaHalf4 vec4",
    "    #define FxaaInt2 ivec2",
    "    #define FxaaSat(x) clamp(x, 0.0, 1.0)",
    "    #define FxaaTex sampler2D",
    "#else",
    "    #define FxaaBool bool",
    "    #define FxaaDiscard clip(-1)",
    "    #define FxaaFloat float",
    "    #define FxaaFloat2 float2",
    "    #define FxaaFloat3 float3",
    "    #define FxaaFloat4 float4",
    "    #define FxaaHalf half",
    "    #define FxaaHalf2 half2",
    "    #define FxaaHalf3 half3",
    "    #define FxaaHalf4 half4",
    "    #define FxaaSat(x) saturate(x)",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_GLSL_100 == 1)",
    "  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)",
    "  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_GLSL_120 == 1)",
    "    // Requires,",
    "    //  #version 120",
    "    // And at least,",
    "    //  #extension GL_EXT_gpu_shader4 : enable",
    "    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)",
    "    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)",
    "    #if (FXAA_FAST_PIXEL_OFFSET == 1)",
    "        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)",
    "    #else",
    "        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)",
    "    #endif",
    "    #if (FXAA_GATHER4_ALPHA == 1)",
    "        // use #extension GL_ARB_gpu_shader5 : enable",
    "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
    "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
    "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
    "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
    "    #endif",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_GLSL_130 == 1)",
    '    // Requires "#version 130" or better',
    "    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)",
    "    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)",
    "    #if (FXAA_GATHER4_ALPHA == 1)",
    "        // use #extension GL_ARB_gpu_shader5 : enable",
    "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
    "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
    "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
    "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
    "    #endif",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_HLSL_3 == 1)",
    "    #define FxaaInt2 float2",
    "    #define FxaaTex sampler2D",
    "    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))",
    "    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_HLSL_4 == 1)",
    "    #define FxaaInt2 int2",
    "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
    "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
    "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
    "#endif",
    "/*--------------------------------------------------------------------------*/",
    "#if (FXAA_HLSL_5 == 1)",
    "    #define FxaaInt2 int2",
    "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
    "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
    "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
    "    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)",
    "    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)",
    "    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)",
    "    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)",
    "#endif",
    "",
    "",
    "/*============================================================================",
    "                   GREEN AS LUMA OPTION SUPPORT FUNCTION",
    "============================================================================*/",
    "#if (FXAA_GREEN_AS_LUMA == 0)",
    "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }",
    "#else",
    "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }",
    "#endif",
    "",
    "",
    "",
    "",
    "/*============================================================================",
    "",
    "                             FXAA3 QUALITY - PC",
    "",
    "============================================================================*/",
    "#if (FXAA_PC == 1)",
    "/*--------------------------------------------------------------------------*/",
    "FxaaFloat4 FxaaPixelShader(",
    "    //",
    "    // Use noperspective interpolation here (turn off perspective interpolation).",
    "    // {xy} = center of pixel",
    "    FxaaFloat2 pos,",
    "    //",
    "    // Used only for FXAA Console, and not used on the 360 version.",
    "    // Use noperspective interpolation here (turn off perspective interpolation).",
    "    // {xy_} = upper left of pixel",
    "    // {_zw} = lower right of pixel",
    "    FxaaFloat4 fxaaConsolePosPos,",
    "    //",
    "    // Input color texture.",
    "    // {rgb_} = color in linear or perceptual color space",
    "    // if (FXAA_GREEN_AS_LUMA == 0)",
    "    //     {__a} = luma in perceptual color space (not linear)",
    "    FxaaTex tex,",
    "    //",
    "    // Only used on the optimized 360 version of FXAA Console.",
    '    // For everything but 360, just use the same input here as for "tex".',
    "    // For 360, same texture, just alias with a 2nd sampler.",
    "    // This sampler needs to have an exponent bias of -1.",
    "    FxaaTex fxaaConsole360TexExpBiasNegOne,",
    "    //",
    "    // Only used on the optimized 360 version of FXAA Console.",
    '    // For everything but 360, just use the same input here as for "tex".',
    "    // For 360, same texture, just alias with a 3nd sampler.",
    "    // This sampler needs to have an exponent bias of -2.",
    "    FxaaTex fxaaConsole360TexExpBiasNegTwo,",
    "    //",
    "    // Only used on FXAA Quality.",
    "    // This must be from a constant/uniform.",
    "    // {x_} = 1.0/screenWidthInPixels",
    "    // {_y} = 1.0/screenHeightInPixels",
    "    FxaaFloat2 fxaaQualityRcpFrame,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // This must be from a constant/uniform.",
    "    // This effects sub-pixel AA quality and inversely sharpness.",
    "    //   Where N ranges between,",
    "    //     N = 0.50 (default)",
    "    //     N = 0.33 (sharper)",
    "    // {x__} = -N/screenWidthInPixels",
    "    // {_y_} = -N/screenHeightInPixels",
    "    // {_z_} =  N/screenWidthInPixels",
    "    // {__w} =  N/screenHeightInPixels",
    "    FxaaFloat4 fxaaConsoleRcpFrameOpt,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // Not used on 360, but used on PS3 and PC.",
    "    // This must be from a constant/uniform.",
    "    // {x__} = -2.0/screenWidthInPixels",
    "    // {_y_} = -2.0/screenHeightInPixels",
    "    // {_z_} =  2.0/screenWidthInPixels",
    "    // {__w} =  2.0/screenHeightInPixels",
    "    FxaaFloat4 fxaaConsoleRcpFrameOpt2,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.",
    "    // This must be from a constant/uniform.",
    "    // {x__} =  8.0/screenWidthInPixels",
    "    // {_y_} =  8.0/screenHeightInPixels",
    "    // {_z_} = -4.0/screenWidthInPixels",
    "    // {__w} = -4.0/screenHeightInPixels",
    "    FxaaFloat4 fxaaConsole360RcpFrameOpt2,",
    "    //",
    "    // Only used on FXAA Quality.",
    "    // This used to be the FXAA_QUALITY_SUBPIX define.",
    "    // It is here now to allow easier tuning.",
    "    // Choose the amount of sub-pixel aliasing removal.",
    "    // This can effect sharpness.",
    "    //   1.00 - upper limit (softer)",
    "    //   0.75 - default amount of filtering",
    "    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)",
    "    //   0.25 - almost off",
    "    //   0.00 - completely off",
    "    FxaaFloat fxaaQualitySubpix,",
    "    //",
    "    // Only used on FXAA Quality.",
    "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.",
    "    // It is here now to allow easier tuning.",
    "    // The minimum amount of local contrast required to apply algorithm.",
    "    //   0.333 - too little (faster)",
    "    //   0.250 - low quality",
    "    //   0.166 - default",
    "    //   0.125 - high quality",
    "    //   0.063 - overkill (slower)",
    "    FxaaFloat fxaaQualityEdgeThreshold,",
    "    //",
    "    // Only used on FXAA Quality.",
    "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.",
    "    // It is here now to allow easier tuning.",
    "    // Trims the algorithm from processing darks.",
    "    //   0.0833 - upper limit (default, the start of visible unfiltered edges)",
    "    //   0.0625 - high quality (faster)",
    "    //   0.0312 - visible limit (slower)",
    "    // Special notes when using FXAA_GREEN_AS_LUMA,",
    "    //   Likely want to set this to zero.",
    "    //   As colors that are mostly not-green",
    "    //   will appear very dark in the green channel!",
    "    //   Tune by looking at mostly non-green content,",
    "    //   then start at zero and increase until aliasing is a problem.",
    "    FxaaFloat fxaaQualityEdgeThresholdMin,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.",
    "    // It is here now to allow easier tuning.",
    "    // This does not effect PS3, as this needs to be compiled in.",
    "    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.",
    "    //   Due to the PS3 being ALU bound,",
    "    //   there are only three safe values here: 2 and 4 and 8.",
    "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
    "    // For all other platforms can be a non-power of two.",
    "    //   8.0 is sharper (default!!!)",
    "    //   4.0 is softer",
    "    //   2.0 is really soft (good only for vector graphics inputs)",
    "    FxaaFloat fxaaConsoleEdgeSharpness,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.",
    "    // It is here now to allow easier tuning.",
    "    // This does not effect PS3, as this needs to be compiled in.",
    "    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.",
    "    //   Due to the PS3 being ALU bound,",
    "    //   there are only two safe values here: 1/4 and 1/8.",
    "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
    "    // The console setting has a different mapping than the quality setting.",
    "    // Other platforms can use other values.",
    "    //   0.125 leaves less aliasing, but is softer (default!!!)",
    "    //   0.25 leaves more aliasing, and is sharper",
    "    FxaaFloat fxaaConsoleEdgeThreshold,",
    "    //",
    "    // Only used on FXAA Console.",
    "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.",
    "    // It is here now to allow easier tuning.",
    "    // Trims the algorithm from processing darks.",
    "    // The console setting has a different mapping than the quality setting.",
    "    // This only applies when FXAA_EARLY_EXIT is 1.",
    "    // This does not apply to PS3,",
    "    // PS3 was simplified to avoid more shader instructions.",
    "    //   0.06 - faster but more aliasing in darks",
    "    //   0.05 - default",
    "    //   0.04 - slower and less aliasing in darks",
    "    // Special notes when using FXAA_GREEN_AS_LUMA,",
    "    //   Likely want to set this to zero.",
    "    //   As colors that are mostly not-green",
    "    //   will appear very dark in the green channel!",
    "    //   Tune by looking at mostly non-green content,",
    "    //   then start at zero and increase until aliasing is a problem.",
    "    FxaaFloat fxaaConsoleEdgeThresholdMin,",
    "    //",
    "    // Extra constants for 360 FXAA Console only.",
    "    // Use zeros or anything else for other platforms.",
    "    // These must be in physical constant registers and NOT immedates.",
    "    // Immedates will result in compiler un-optimizing.",
    "    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)",
    "    FxaaFloat4 fxaaConsole360ConstDir",
    ") {",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat2 posM;",
    "    posM.x = pos.x;",
    "    posM.y = pos.y;",
    "    #if (FXAA_GATHER4_ALPHA == 1)",
    "        #if (FXAA_DISCARD == 0)",
    "            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
    "            #if (FXAA_GREEN_AS_LUMA == 0)",
    "                #define lumaM rgbyM.w",
    "            #else",
    "                #define lumaM rgbyM.y",
    "            #endif",
    "        #endif",
    "        #if (FXAA_GREEN_AS_LUMA == 0)",
    "            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);",
    "            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));",
    "        #else",
    "            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);",
    "            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));",
    "        #endif",
    "        #if (FXAA_DISCARD == 1)",
    "            #define lumaM luma4A.w",
    "        #endif",
    "        #define lumaE luma4A.z",
    "        #define lumaS luma4A.x",
    "        #define lumaSE luma4A.y",
    "        #define lumaNW luma4B.w",
    "        #define lumaN luma4B.z",
    "        #define lumaW luma4B.x",
    "    #else",
    "        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
    "        #if (FXAA_GREEN_AS_LUMA == 0)",
    "            #define lumaM rgbyM.w",
    "        #else",
    "            #define lumaM rgbyM.y",
    "        #endif",
    "        #if (FXAA_GLSL_100 == 1)",
    "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));",
    "        #else",
    "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));",
    "        #endif",
    "    #endif",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat maxSM = max(lumaS, lumaM);",
    "    FxaaFloat minSM = min(lumaS, lumaM);",
    "    FxaaFloat maxESM = max(lumaE, maxSM);",
    "    FxaaFloat minESM = min(lumaE, minSM);",
    "    FxaaFloat maxWN = max(lumaN, lumaW);",
    "    FxaaFloat minWN = min(lumaN, lumaW);",
    "    FxaaFloat rangeMax = max(maxWN, maxESM);",
    "    FxaaFloat rangeMin = min(minWN, minESM);",
    "    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;",
    "    FxaaFloat range = rangeMax - rangeMin;",
    "    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);",
    "    FxaaBool earlyExit = range < rangeMaxClamped;",
    "/*--------------------------------------------------------------------------*/",
    "    if(earlyExit)",
    "        #if (FXAA_DISCARD == 1)",
    "            FxaaDiscard;",
    "        #else",
    "            return rgbyM;",
    "        #endif",
    "/*--------------------------------------------------------------------------*/",
    "    #if (FXAA_GATHER4_ALPHA == 0)",
    "        #if (FXAA_GLSL_100 == 1)",
    "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));",
    "        #else",
    "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));",
    "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
    "        #endif",
    "    #else",
    "        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));",
    "        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
    "    #endif",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat lumaNS = lumaN + lumaS;",
    "    FxaaFloat lumaWE = lumaW + lumaE;",
    "    FxaaFloat subpixRcpRange = 1.0/range;",
    "    FxaaFloat subpixNSWE = lumaNS + lumaWE;",
    "    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;",
    "    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat lumaNESE = lumaNE + lumaSE;",
    "    FxaaFloat lumaNWNE = lumaNW + lumaNE;",
    "    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;",
    "    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat lumaNWSW = lumaNW + lumaSW;",
    "    FxaaFloat lumaSWSE = lumaSW + lumaSE;",
    "    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);",
    "    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);",
    "    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;",
    "    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;",
    "    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;",
    "    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;",
    "    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;",
    "    FxaaBool horzSpan = edgeHorz >= edgeVert;",
    "    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;",
    "/*--------------------------------------------------------------------------*/",
    "    if(!horzSpan) lumaN = lumaW;",
    "    if(!horzSpan) lumaS = lumaE;",
    "    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;",
    "    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat gradientN = lumaN - lumaM;",
    "    FxaaFloat gradientS = lumaS - lumaM;",
    "    FxaaFloat lumaNN = lumaN + lumaM;",
    "    FxaaFloat lumaSS = lumaS + lumaM;",
    "    FxaaBool pairN = abs(gradientN) >= abs(gradientS);",
    "    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));",
    "    if(pairN) lengthSign = -lengthSign;",
    "    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat2 posB;",
    "    posB.x = posM.x;",
    "    posB.y = posM.y;",
    "    FxaaFloat2 offNP;",
    "    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;",
    "    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;",
    "    if(!horzSpan) posB.x += lengthSign * 0.5;",
    "    if( horzSpan) posB.y += lengthSign * 0.5;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat2 posN;",
    "    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;",
    "    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;",
    "    FxaaFloat2 posP;",
    "    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;",
    "    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;",
    "    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;",
    "    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));",
    "    FxaaFloat subpixE = subpixC * subpixC;",
    "    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));",
    "/*--------------------------------------------------------------------------*/",
    "    if(!pairN) lumaNN = lumaSS;",
    "    FxaaFloat gradientScaled = gradient * 1.0/4.0;",
    "    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;",
    "    FxaaFloat subpixF = subpixD * subpixE;",
    "    FxaaBool lumaMLTZero = lumaMM < 0.0;",
    "/*--------------------------------------------------------------------------*/",
    "    lumaEndN -= lumaNN * 0.5;",
    "    lumaEndP -= lumaNN * 0.5;",
    "    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;",
    "    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;",
    "    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;",
    "    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;",
    "    FxaaBool doneNP = (!doneN) || (!doneP);",
    "    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;",
    "    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;",
    "/*--------------------------------------------------------------------------*/",
    "    if(doneNP) {",
    "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "        doneN = abs(lumaEndN) >= gradientScaled;",
    "        doneP = abs(lumaEndP) >= gradientScaled;",
    "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;",
    "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;",
    "        doneNP = (!doneN) || (!doneP);",
    "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;",
    "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;",
    "/*--------------------------------------------------------------------------*/",
    "        #if (FXAA_QUALITY_PS > 3)",
    "        if(doneNP) {",
    "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "            doneN = abs(lumaEndN) >= gradientScaled;",
    "            doneP = abs(lumaEndP) >= gradientScaled;",
    "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;",
    "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;",
    "            doneNP = (!doneN) || (!doneP);",
    "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;",
    "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;",
    "/*--------------------------------------------------------------------------*/",
    "            #if (FXAA_QUALITY_PS > 4)",
    "            if(doneNP) {",
    "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                doneN = abs(lumaEndN) >= gradientScaled;",
    "                doneP = abs(lumaEndP) >= gradientScaled;",
    "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;",
    "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;",
    "                doneNP = (!doneN) || (!doneP);",
    "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;",
    "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;",
    "/*--------------------------------------------------------------------------*/",
    "                #if (FXAA_QUALITY_PS > 5)",
    "                if(doneNP) {",
    "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                    doneN = abs(lumaEndN) >= gradientScaled;",
    "                    doneP = abs(lumaEndP) >= gradientScaled;",
    "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;",
    "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;",
    "                    doneNP = (!doneN) || (!doneP);",
    "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;",
    "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;",
    "/*--------------------------------------------------------------------------*/",
    "                    #if (FXAA_QUALITY_PS > 6)",
    "                    if(doneNP) {",
    "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                        doneN = abs(lumaEndN) >= gradientScaled;",
    "                        doneP = abs(lumaEndP) >= gradientScaled;",
    "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;",
    "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;",
    "                        doneNP = (!doneN) || (!doneP);",
    "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;",
    "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;",
    "/*--------------------------------------------------------------------------*/",
    "                        #if (FXAA_QUALITY_PS > 7)",
    "                        if(doneNP) {",
    "                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                            doneN = abs(lumaEndN) >= gradientScaled;",
    "                            doneP = abs(lumaEndP) >= gradientScaled;",
    "                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;",
    "                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;",
    "                            doneNP = (!doneN) || (!doneP);",
    "                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;",
    "                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;",
    "/*--------------------------------------------------------------------------*/",
    "    #if (FXAA_QUALITY_PS > 8)",
    "    if(doneNP) {",
    "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "        doneN = abs(lumaEndN) >= gradientScaled;",
    "        doneP = abs(lumaEndP) >= gradientScaled;",
    "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;",
    "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;",
    "        doneNP = (!doneN) || (!doneP);",
    "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;",
    "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;",
    "/*--------------------------------------------------------------------------*/",
    "        #if (FXAA_QUALITY_PS > 9)",
    "        if(doneNP) {",
    "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "            doneN = abs(lumaEndN) >= gradientScaled;",
    "            doneP = abs(lumaEndP) >= gradientScaled;",
    "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;",
    "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;",
    "            doneNP = (!doneN) || (!doneP);",
    "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;",
    "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;",
    "/*--------------------------------------------------------------------------*/",
    "            #if (FXAA_QUALITY_PS > 10)",
    "            if(doneNP) {",
    "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                doneN = abs(lumaEndN) >= gradientScaled;",
    "                doneP = abs(lumaEndP) >= gradientScaled;",
    "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;",
    "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;",
    "                doneNP = (!doneN) || (!doneP);",
    "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;",
    "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;",
    "/*--------------------------------------------------------------------------*/",
    "                #if (FXAA_QUALITY_PS > 11)",
    "                if(doneNP) {",
    "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                    doneN = abs(lumaEndN) >= gradientScaled;",
    "                    doneP = abs(lumaEndP) >= gradientScaled;",
    "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;",
    "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;",
    "                    doneNP = (!doneN) || (!doneP);",
    "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;",
    "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;",
    "/*--------------------------------------------------------------------------*/",
    "                    #if (FXAA_QUALITY_PS > 12)",
    "                    if(doneNP) {",
    "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
    "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
    "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
    "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
    "                        doneN = abs(lumaEndN) >= gradientScaled;",
    "                        doneP = abs(lumaEndP) >= gradientScaled;",
    "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;",
    "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;",
    "                        doneNP = (!doneN) || (!doneP);",
    "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;",
    "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;",
    "/*--------------------------------------------------------------------------*/",
    "                    }",
    "                    #endif",
    "/*--------------------------------------------------------------------------*/",
    "                }",
    "                #endif",
    "/*--------------------------------------------------------------------------*/",
    "            }",
    "            #endif",
    "/*--------------------------------------------------------------------------*/",
    "        }",
    "        #endif",
    "/*--------------------------------------------------------------------------*/",
    "    }",
    "    #endif",
    "/*--------------------------------------------------------------------------*/",
    "                        }",
    "                        #endif",
    "/*--------------------------------------------------------------------------*/",
    "                    }",
    "                    #endif",
    "/*--------------------------------------------------------------------------*/",
    "                }",
    "                #endif",
    "/*--------------------------------------------------------------------------*/",
    "            }",
    "            #endif",
    "/*--------------------------------------------------------------------------*/",
    "        }",
    "        #endif",
    "/*--------------------------------------------------------------------------*/",
    "    }",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat dstN = posM.x - posN.x;",
    "    FxaaFloat dstP = posP.x - posM.x;",
    "    if(!horzSpan) dstN = posM.y - posN.y;",
    "    if(!horzSpan) dstP = posP.y - posM.y;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;",
    "    FxaaFloat spanLength = (dstP + dstN);",
    "    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;",
    "    FxaaFloat spanLengthRcp = 1.0/spanLength;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaBool directionN = dstN < dstP;",
    "    FxaaFloat dst = min(dstN, dstP);",
    "    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;",
    "    FxaaFloat subpixG = subpixF * subpixF;",
    "    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;",
    "    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;",
    "/*--------------------------------------------------------------------------*/",
    "    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;",
    "    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);",
    "    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;",
    "    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;",
    "    #if (FXAA_DISCARD == 1)",
    "        return FxaaTexTop(tex, posM);",
    "    #else",
    "        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);",
    "    #endif",
    "}",
    "/*==========================================================================*/",
    "#endif",
    "",
    "void main() {",
    "  gl_FragColor = FxaaPixelShader(",
    "    vUv,",
    "    vec4(0.0),",
    "    tDiffuse,",
    "    tDiffuse,",
    "    tDiffuse,",
    "    resolution,",
    "    vec4(0.0),",
    "    vec4(0.0),",
    "    vec4(0.0),",
    "    0.75,",
    "    0.166,",
    "    0.0833,",
    "    0.0,",
    "    0.0,",
    "    0.0,",
    "    vec4(0.0)",
    "  );",
    "",
    "  // TODO avoid querying texture twice for same texel",
    "  gl_FragColor.a = texture2D(tDiffuse, vUv).a;",
    "}",
  ].join("\n"),
};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GlitchPass = function (dt_size) {
  THREE.Pass.call(this);

  if (THREE.DigitalGlitch === undefined)
    console.error("THREE.GlitchPass relies on THREE.DigitalGlitch");

  var shader = THREE.DigitalGlitch;
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

  if (dt_size == undefined) dt_size = 64;

  this.uniforms["tDisp"].value = this.generateHeightmap(dt_size);

  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
  });

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  this.quad.frustumCulled = false; // Avoid getting clipped
  this.scene.add(this.quad);

  this.goWild = false;
  this.curF = 0;
  this.generateTrigger();
};

THREE.GlitchPass.prototype = Object.assign(
  Object.create(THREE.Pass.prototype),
  {
    constructor: THREE.GlitchPass,

    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
      this.uniforms["tDiffuse"].value = readBuffer.texture;
      this.uniforms["seed"].value = Math.random(); //default seeding
      this.uniforms["byp"].value = 0;

      if (this.curF % this.randX == 0 || this.goWild == true) {
        this.uniforms["amount"].value = Math.random() / 30;
        this.uniforms["angle"].value = THREE.Math.randFloat(-Math.PI, Math.PI);
        this.uniforms["seed_x"].value = THREE.Math.randFloat(-1, 1);
        this.uniforms["seed_y"].value = THREE.Math.randFloat(-1, 1);
        this.uniforms["distortion_x"].value = THREE.Math.randFloat(0, 1);
        this.uniforms["distortion_y"].value = THREE.Math.randFloat(0, 1);
        this.curF = 0;
        this.generateTrigger();
      } else if (this.curF % this.randX < this.randX / 5) {
        this.uniforms["amount"].value = Math.random() / 90;
        this.uniforms["angle"].value = THREE.Math.randFloat(-Math.PI, Math.PI);
        this.uniforms["distortion_x"].value = THREE.Math.randFloat(0, 1);
        this.uniforms["distortion_y"].value = THREE.Math.randFloat(0, 1);
        this.uniforms["seed_x"].value = THREE.Math.randFloat(-0.3, 0.3);
        this.uniforms["seed_y"].value = THREE.Math.randFloat(-0.3, 0.3);
      } else if (this.goWild == false) {
        this.uniforms["byp"].value = 1;
      }

      this.curF++;
      this.quad.material = this.material;

      if (this.renderToScreen) {
        renderer.render(this.scene, this.camera);
      } else {
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);
      }
    },

    generateTrigger: function () {
      this.randX = THREE.Math.randInt(120, 240);
    },

    generateHeightmap: function (dt_size) {
      var data_arr = new Float32Array(dt_size * dt_size * 3);
      var length = dt_size * dt_size;

      for (var i = 0; i < length; i++) {
        var val = THREE.Math.randFloat(0, 1);
        data_arr[i * 3 + 0] = val;
        data_arr[i * 3 + 1] = val;
        data_arr[i * 3 + 2] = val;
      }

      var texture = new THREE.DataTexture(
        data_arr,
        dt_size,
        dt_size,
        THREE.RGBFormat,
        THREE.FloatType
      );
      texture.needsUpdate = true;
      return texture;
    },
  }
);

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or arrow keys / touch: two-finger move

THREE.OrbitControls = function (object, domElement) {
  this.object = object;

  this.domElement = domElement !== undefined ? domElement : document;

  // Set to false to disable this control
  this.enabled = true;

  // "target" sets the location of focus, where the object orbits around
  this.target = new THREE.Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  this.minDistance = 0;
  this.maxDistance = Infinity;

  // How far you can zoom in and out ( OrthographicCamera only )
  this.minZoom = 0;
  this.maxZoom = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
  this.minAzimuthAngle = -Infinity; // radians
  this.maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  this.enableDamping = false;
  this.dampingFactor = 0.25;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  this.enableZoom = true;
  this.zoomSpeed = 1.0;

  // Set to false to disable rotating
  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  // Set to false to disable panning
  this.enablePan = true;
  this.panSpeed = 1.0;
  this.screenSpacePanning = false; // if true, pan in screen-space
  this.keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

  // Set to false to disable use of the keys
  this.enableKeys = true;

  // The four arrow keys
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

  // Mouse buttons
  this.mouseButtons = {
    ORBIT: THREE.MOUSE.LEFT,
    ZOOM: THREE.MOUSE.MIDDLE,
    PAN: THREE.MOUSE.RIGHT,
  };

  // for reset
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.zoom0 = this.object.zoom;

  //
  // public methods
  //

  this.getPolarAngle = function () {
    return spherical.phi;
  };

  this.getAzimuthalAngle = function () {
    return spherical.theta;
  };

  this.saveState = function () {
    scope.target0.copy(scope.target);
    scope.position0.copy(scope.object.position);
    scope.zoom0 = scope.object.zoom;
  };

  this.reset = function () {
    scope.target.copy(scope.target0);
    scope.object.position.copy(scope.position0);
    scope.object.zoom = scope.zoom0;

    scope.object.updateProjectionMatrix();
    scope.dispatchEvent(changeEvent);

    scope.update();

    state = STATE.NONE;
  };

  // this method is exposed, but perhaps it would be better if we can make it private...
  this.update = (function () {
    var offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    var quat = new THREE.Quaternion().setFromUnitVectors(
      object.up,
      new THREE.Vector3(0, 1, 0)
    );
    var quatInverse = quat.clone().inverse();

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    return function update() {
      var position = scope.object.position;

      offset.copy(position).sub(scope.target);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);

      // angle from z-axis around y-axis
      spherical.setFromVector3(offset);

      if (scope.autoRotate && state === STATE.NONE) {
        rotateLeft(getAutoRotationAngle());
      }

      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;

      // restrict theta to be between desired limits
      spherical.theta = Math.max(
        scope.minAzimuthAngle,
        Math.min(scope.maxAzimuthAngle, spherical.theta)
      );

      // restrict phi to be between desired limits
      spherical.phi = Math.max(
        scope.minPolarAngle,
        Math.min(scope.maxPolarAngle, spherical.phi)
      );

      spherical.makeSafe();

      spherical.radius *= scale;

      // restrict radius to be between desired limits
      spherical.radius = Math.max(
        scope.minDistance,
        Math.min(scope.maxDistance, spherical.radius)
      );

      // move target to panned location
      scope.target.add(panOffset);

      offset.setFromSpherical(spherical);

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);

      position.copy(scope.target).add(offset);

      scope.object.lookAt(scope.target);

      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;

        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);

        panOffset.set(0, 0, 0);
      }

      scale = 1;

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (
        zoomChanged ||
        lastPosition.distanceToSquared(scope.object.position) > EPS ||
        8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
      ) {
        scope.dispatchEvent(changeEvent);

        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;

        return true;
      }

      return false;
    };
  })();

  this.dispose = function () {
    scope.domElement.removeEventListener("contextmenu", onContextMenu, false);
    scope.domElement.removeEventListener("mousedown", onMouseDown, false);
    scope.domElement.removeEventListener("wheel", onMouseWheel, false);

    scope.domElement.removeEventListener("touchstart", onTouchStart, false);
    scope.domElement.removeEventListener("touchend", onTouchEnd, false);
    scope.domElement.removeEventListener("touchmove", onTouchMove, false);

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener("mouseup", onMouseUp, false);

    window.removeEventListener("keydown", onKeyDown, false);

    //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
  };

  //
  // internals
  //

  var scope = this;

  var changeEvent = { type: "change" };
  var startEvent = { type: "start" };
  var endEvent = { type: "end" };

  var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY_PAN: 4,
  };

  var state = STATE.NONE;

  var EPS = 0.000001;

  // current position in spherical coordinates
  var spherical = new THREE.Spherical();
  var sphericalDelta = new THREE.Spherical();

  var scale = 1;
  var panOffset = new THREE.Vector3();
  var zoomChanged = false;

  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();

  var panStart = new THREE.Vector2();
  var panEnd = new THREE.Vector2();
  var panDelta = new THREE.Vector2();

  var dollyStart = new THREE.Vector2();
  var dollyEnd = new THREE.Vector2();
  var dollyDelta = new THREE.Vector2();

  function getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }

  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }

  var panLeft = (function () {
    var v = new THREE.Vector3();

    return function panLeft(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(-distance);

      panOffset.add(v);
    };
  })();

  var panUp = (function () {
    var v = new THREE.Vector3();

    return function panUp(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }

      v.multiplyScalar(distance);

      panOffset.add(v);
    };
  })();

  // deltaX and deltaY are in pixels; right and down are positive
  var pan = (function () {
    var offset = new THREE.Vector3();

    return function pan(deltaX, deltaY) {
      var element =
        scope.domElement === document
          ? scope.domElement.body
          : scope.domElement;

      if (scope.object.isPerspectiveCamera) {
        // perspective
        var position = scope.object.position;
        offset.copy(position).sub(scope.target);
        var targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(((scope.object.fov / 2) * Math.PI) / 180.0);

        // we use only clientHeight here so aspect ratio does not distort speed
        panLeft(
          (2 * deltaX * targetDistance) / element.clientHeight,
          scope.object.matrix
        );
        panUp(
          (2 * deltaY * targetDistance) / element.clientHeight,
          scope.object.matrix
        );
      } else if (scope.object.isOrthographicCamera) {
        // orthographic
        panLeft(
          (deltaX * (scope.object.right - scope.object.left)) /
            scope.object.zoom /
            element.clientWidth,
          scope.object.matrix
        );
        panUp(
          (deltaY * (scope.object.top - scope.object.bottom)) /
            scope.object.zoom /
            element.clientHeight,
          scope.object.matrix
        );
      } else {
        // camera neither orthographic nor perspective
        console.warn(
          "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
        );
        scope.enablePan = false;
      }
    };
  })();

  function dollyIn(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale /= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(
        scope.minZoom,
        Math.min(scope.maxZoom, scope.object.zoom * dollyScale)
      );
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
      );
      scope.enableZoom = false;
    }
  }

  function dollyOut(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale *= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(
        scope.minZoom,
        Math.min(scope.maxZoom, scope.object.zoom / dollyScale)
      );
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn(
        "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
      );
      scope.enableZoom = false;
    }
  }

  //
  // event callbacks - update the object state
  //

  function handleMouseDownRotate(event) {
    //console.log( 'handleMouseDownRotate' );

    rotateStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownDolly(event) {
    //console.log( 'handleMouseDownDolly' );

    dollyStart.set(event.clientX, event.clientY);
  }

  function handleMouseDownPan(event) {
    //console.log( 'handleMouseDownPan' );

    panStart.set(event.clientX, event.clientY);
  }

  function handleMouseMoveRotate(event) {
    //console.log( 'handleMouseMoveRotate' );

    rotateEnd.set(event.clientX, event.clientY);

    rotateDelta
      .subVectors(rotateEnd, rotateStart)
      .multiplyScalar(scope.rotateSpeed);

    var element =
      scope.domElement === document ? scope.domElement.body : scope.domElement;

    // rotating across whole screen goes 360 degrees around
    rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientWidth);

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleMouseMoveDolly(event) {
    //console.log( 'handleMouseMoveDolly' );

    dollyEnd.set(event.clientX, event.clientY);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {
      dollyIn(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyOut(getZoomScale());
    }

    dollyStart.copy(dollyEnd);

    scope.update();
  }

  function handleMouseMovePan(event) {
    //console.log( 'handleMouseMovePan' );

    panEnd.set(event.clientX, event.clientY);

    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

    pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    scope.update();
  }

  function handleMouseUp(event) {
    // console.log( 'handleMouseUp' );
  }

  function handleMouseWheel(event) {
    // console.log( 'handleMouseWheel' );

    if (event.deltaY < 0) {
      dollyOut(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyIn(getZoomScale());
    }

    scope.update();
  }

  function handleKeyDown(event) {
    //console.log( 'handleKeyDown' );

    switch (event.keyCode) {
      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        scope.update();
        break;

      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        scope.update();
        break;

      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        scope.update();
        break;

      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        scope.update();
        break;
    }
  }

  function handleTouchStartRotate(event) {
    //console.log( 'handleTouchStartRotate' );

    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  }

  function handleTouchStartDollyPan(event) {
    //console.log( 'handleTouchStartDollyPan' );

    if (scope.enableZoom) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    if (scope.enablePan) {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      panStart.set(x, y);
    }
  }

  function handleTouchMoveRotate(event) {
    //console.log( 'handleTouchMoveRotate' );

    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

    rotateDelta
      .subVectors(rotateEnd, rotateStart)
      .multiplyScalar(scope.rotateSpeed);

    var element =
      scope.domElement === document ? scope.domElement.body : scope.domElement;

    // rotating across whole screen goes 360 degrees around
    rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientWidth);

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleTouchMoveDollyPan(event) {
    //console.log( 'handleTouchMoveDollyPan' );

    if (scope.enableZoom) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

      dollyIn(dollyDelta.y);

      dollyStart.copy(dollyEnd);
    }

    if (scope.enablePan) {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      panEnd.set(x, y);

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);
    }

    scope.update();
  }

  function handleTouchEnd(event) {
    //console.log( 'handleTouchEnd' );
  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  function onMouseDown(event) {
    if (scope.enabled === false) return;

    event.preventDefault();

    switch (event.button) {
      case scope.mouseButtons.ORBIT:
        if (scope.enableRotate === false) return;

        handleMouseDownRotate(event);

        state = STATE.ROTATE;

        break;

      case scope.mouseButtons.ZOOM:
        if (scope.enableZoom === false) return;

        handleMouseDownDolly(event);

        state = STATE.DOLLY;

        break;

      case scope.mouseButtons.PAN:
        if (scope.enablePan === false) return;

        handleMouseDownPan(event);

        state = STATE.PAN;

        break;
    }

    if (state !== STATE.NONE) {
      document.addEventListener("mousemove", onMouseMove, false);
      document.addEventListener("mouseup", onMouseUp, false);

      scope.dispatchEvent(startEvent);
    }
  }

  function onMouseMove(event) {
    if (scope.enabled === false) return;

    event.preventDefault();

    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false) return;

        handleMouseMoveRotate(event);

        break;

      case STATE.DOLLY:
        if (scope.enableZoom === false) return;

        handleMouseMoveDolly(event);

        break;

      case STATE.PAN:
        if (scope.enablePan === false) return;

        handleMouseMovePan(event);

        break;
    }
  }

  function onMouseUp(event) {
    if (scope.enabled === false) return;

    handleMouseUp(event);

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener("mouseup", onMouseUp, false);

    scope.dispatchEvent(endEvent);

    state = STATE.NONE;
  }

  function onMouseWheel(event) {
    if (
      scope.enabled === false ||
      scope.enableZoom === false ||
      (state !== STATE.NONE && state !== STATE.ROTATE)
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    scope.dispatchEvent(startEvent);

    handleMouseWheel(event);

    scope.dispatchEvent(endEvent);
  }

  function onKeyDown(event) {
    if (
      scope.enabled === false ||
      scope.enableKeys === false ||
      scope.enablePan === false
    )
      return;

    handleKeyDown(event);
  }

  function onTouchStart(event) {
    if (scope.enabled === false) return;

    event.preventDefault();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (scope.enableRotate === false) return;

        handleTouchStartRotate(event);

        state = STATE.TOUCH_ROTATE;

        break;

      case 2: // two-fingered touch: dolly-pan
        if (scope.enableZoom === false && scope.enablePan === false) return;

        handleTouchStartDollyPan(event);

        state = STATE.TOUCH_DOLLY_PAN;

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent);
    }
  }

  function onTouchMove(event) {
    if (scope.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (scope.enableRotate === false) return;
        if (state !== STATE.TOUCH_ROTATE) return; // is this needed?

        handleTouchMoveRotate(event);

        break;

      case 2: // two-fingered touch: dolly-pan
        if (scope.enableZoom === false && scope.enablePan === false) return;
        if (state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

        handleTouchMoveDollyPan(event);

        break;

      default:
        state = STATE.NONE;
    }
  }

  function onTouchEnd(event) {
    if (scope.enabled === false) return;

    handleTouchEnd(event);

    scope.dispatchEvent(endEvent);

    state = STATE.NONE;
  }

  function onContextMenu(event) {
    if (scope.enabled === false) return;

    event.preventDefault();
  }

  //

  scope.domElement.addEventListener("contextmenu", onContextMenu, false);

  scope.domElement.addEventListener("mousedown", onMouseDown, false);
  scope.domElement.addEventListener("wheel", onMouseWheel, false);

  scope.domElement.addEventListener("touchstart", onTouchStart, false);
  scope.domElement.addEventListener("touchend", onTouchEnd, false);
  scope.domElement.addEventListener("touchmove", onTouchMove, false);

  window.addEventListener("keydown", onKeyDown, false);

  // force an update at start

  this.update();
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties(THREE.OrbitControls.prototype, {
  center: {
    get: function () {
      console.warn("THREE.OrbitControls: .center has been renamed to .target");
      return this.target;
    },
  },

  // backward compatibility

  noZoom: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
      );
      return !this.enableZoom;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."
      );
      this.enableZoom = !value;
    },
  },

  noRotate: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
      );
      return !this.enableRotate;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."
      );
      this.enableRotate = !value;
    },
  },

  noPan: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
      );
      return !this.enablePan;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."
      );
      this.enablePan = !value;
    },
  },

  noKeys: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
      );
      return !this.enableKeys;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."
      );
      this.enableKeys = !value;
    },
  },

  staticMoving: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
      );
      return !this.enableDamping;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."
      );
      this.enableDamping = !value;
    },
  },

  dynamicDampingFactor: {
    get: function () {
      console.warn(
        "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
      );
      return this.dampingFactor;
    },

    set: function (value) {
      console.warn(
        "THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."
      );
      this.dampingFactor = value;
    },
  },
});

/**
 * @author spidersharma / http://eduperiment.com/
 */

THREE.OutlinePass = function (resolution, scene, camera, selectedObjects) {
  this.renderScene = scene;
  this.renderCamera = camera;
  this.selectedObjects = selectedObjects !== undefined ? selectedObjects : [];
  this.visibleEdgeColor = new THREE.Color(1, 1, 1);
  this.hiddenEdgeColor = new THREE.Color(0.1, 0.04, 0.02);
  this.edgeGlow = 0.0;
  this.usePatternTexture = false;
  this.edgeThickness = 1.0;
  this.edgeStrength = 3.0;
  this.downSampleRatio = 2;
  this.pulsePeriod = 0;

  THREE.Pass.call(this);

  this.resolution =
    resolution !== undefined
      ? new THREE.Vector2(resolution.x, resolution.y)
      : new THREE.Vector2(256, 256);

  var pars = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  };

  var resx = Math.round(this.resolution.x / this.downSampleRatio);
  var resy = Math.round(this.resolution.y / this.downSampleRatio);

  this.maskBufferMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.maskBufferMaterial.side = THREE.DoubleSide;
  this.renderTargetMaskBuffer = new THREE.WebGLRenderTarget(
    this.resolution.x,
    this.resolution.y,
    pars
  );
  this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
  this.renderTargetMaskBuffer.texture.generateMipmaps = false;

  this.depthMaterial = new THREE.MeshDepthMaterial();
  this.depthMaterial.side = THREE.DoubleSide;
  this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
  this.depthMaterial.blending = THREE.NoBlending;

  this.prepareMaskMaterial = this.getPrepareMaskMaterial();
  this.prepareMaskMaterial.side = THREE.DoubleSide;
  this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(
    this.prepareMaskMaterial.fragmentShader,
    this.renderCamera
  );

  this.renderTargetDepthBuffer = new THREE.WebGLRenderTarget(
    this.resolution.x,
    this.resolution.y,
    pars
  );
  this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
  this.renderTargetDepthBuffer.texture.generateMipmaps = false;

  this.renderTargetMaskDownSampleBuffer = new THREE.WebGLRenderTarget(
    resx,
    resy,
    pars
  );
  this.renderTargetMaskDownSampleBuffer.texture.name =
    "OutlinePass.depthDownSample";
  this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

  this.renderTargetBlurBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
  this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
  this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
  this.renderTargetBlurBuffer2 = new THREE.WebGLRenderTarget(
    Math.round(resx / 2),
    Math.round(resy / 2),
    pars
  );
  this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
  this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

  this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
  this.renderTargetEdgeBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
  this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
  this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
  this.renderTargetEdgeBuffer2 = new THREE.WebGLRenderTarget(
    Math.round(resx / 2),
    Math.round(resy / 2),
    pars
  );
  this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
  this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;

  var MAX_EDGE_THICKNESS = 4;
  var MAX_EDGE_GLOW = 4;

  this.separableBlurMaterial1 =
    this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
  this.separableBlurMaterial1.uniforms["texSize"].value = new THREE.Vector2(
    resx,
    resy
  );
  this.separableBlurMaterial1.uniforms["kernelRadius"].value = 1;
  this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
  this.separableBlurMaterial2.uniforms["texSize"].value = new THREE.Vector2(
    Math.round(resx / 2),
    Math.round(resy / 2)
  );
  this.separableBlurMaterial2.uniforms["kernelRadius"].value = MAX_EDGE_GLOW;

  // Overlay material
  this.overlayMaterial = this.getOverlayMaterial();

  // copy material
  if (THREE.CopyShader === undefined)
    console.error("THREE.OutlinePass relies on THREE.CopyShader");

  var copyShader = THREE.CopyShader;

  this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
  this.copyUniforms["opacity"].value = 1.0;

  this.materialCopy = new THREE.ShaderMaterial({
    uniforms: this.copyUniforms,
    vertexShader: copyShader.vertexShader,
    fragmentShader: copyShader.fragmentShader,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

  this.enabled = true;
  this.needsSwap = false;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  this.quad.frustumCulled = false; // Avoid getting clipped
  this.scene.add(this.quad);

  this.tempPulseColor1 = new THREE.Color();
  this.tempPulseColor2 = new THREE.Color();
  this.textureMatrix = new THREE.Matrix4();

  function replaceDepthToViewZ(string, camera) {
    var type = camera.isPerspectiveCamera ? "perspective" : "orthographic";

    return string.replace(/DEPTH_TO_VIEW_Z/g, type + "DepthToViewZ");
  }
};

THREE.OutlinePass.prototype = Object.assign(
  Object.create(THREE.Pass.prototype),
  {
    constructor: THREE.OutlinePass,

    dispose: function () {
      this.renderTargetMaskBuffer.dispose();
      this.renderTargetDepthBuffer.dispose();
      this.renderTargetMaskDownSampleBuffer.dispose();
      this.renderTargetBlurBuffer1.dispose();
      this.renderTargetBlurBuffer2.dispose();
      this.renderTargetEdgeBuffer1.dispose();
      this.renderTargetEdgeBuffer2.dispose();
    },

    setSize: function (width, height) {
      this.renderTargetMaskBuffer.setSize(width, height);

      var resx = Math.round(width / this.downSampleRatio);
      var resy = Math.round(height / this.downSampleRatio);
      this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
      this.renderTargetBlurBuffer1.setSize(resx, resy);
      this.renderTargetEdgeBuffer1.setSize(resx, resy);
      this.separableBlurMaterial1.uniforms["texSize"].value = new THREE.Vector2(
        resx,
        resy
      );

      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);

      this.renderTargetBlurBuffer2.setSize(resx, resy);
      this.renderTargetEdgeBuffer2.setSize(resx, resy);

      this.separableBlurMaterial2.uniforms["texSize"].value = new THREE.Vector2(
        resx,
        resy
      );
    },

    changeVisibilityOfSelectedObjects: function (bVisible) {
      function gatherSelectedMeshesCallBack(object) {
        if (object.isMesh) {
          if (bVisible) {
            object.visible = object.userData.oldVisible;
            delete object.userData.oldVisible;
          } else {
            object.userData.oldVisible = object.visible;
            object.visible = bVisible;
          }
        }
      }

      for (var i = 0; i < this.selectedObjects.length; i++) {
        var selectedObject = this.selectedObjects[i];
        selectedObject.traverse(gatherSelectedMeshesCallBack);
      }
    },

    changeVisibilityOfNonSelectedObjects: function (bVisible) {
      var selectedMeshes = [];

      function gatherSelectedMeshesCallBack(object) {
        if (object.isMesh) selectedMeshes.push(object);
      }

      for (var i = 0; i < this.selectedObjects.length; i++) {
        var selectedObject = this.selectedObjects[i];
        selectedObject.traverse(gatherSelectedMeshesCallBack);
      }

      function VisibilityChangeCallBack(object) {
        if (object.isMesh || object.isLine || object.isSprite) {
          var bFound = false;

          for (var i = 0; i < selectedMeshes.length; i++) {
            var selectedObjectId = selectedMeshes[i].id;

            if (selectedObjectId === object.id) {
              bFound = true;
              break;
            }
          }

          if (!bFound) {
            var visibility = object.visible;

            if (!bVisible || object.bVisible) object.visible = bVisible;

            object.bVisible = visibility;
          }
        }
      }

      this.renderScene.traverse(VisibilityChangeCallBack);
    },

    updateTextureMatrix: function () {
      this.textureMatrix.set(
        0.5,
        0.0,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        0.0,
        0.0,
        0.0,
        1.0
      );
      this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
      this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
    },

    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
      if (this.selectedObjects.length > 0) {
        this.oldClearColor.copy(renderer.getClearColor());
        this.oldClearAlpha = renderer.getClearAlpha();
        var oldAutoClear = renderer.autoClear;

        renderer.autoClear = false;

        if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

        renderer.setClearColor(0xffffff, 1);

        // Make selected objects invisible
        this.changeVisibilityOfSelectedObjects(false);

        var currentBackground = this.renderScene.background;
        this.renderScene.background = null;

        // 1. Draw Non Selected objects in the depth buffer
        this.renderScene.overrideMaterial = this.depthMaterial;
        renderer.render(
          this.renderScene,
          this.renderCamera,
          this.renderTargetDepthBuffer,
          true
        );

        // Make selected objects visible
        this.changeVisibilityOfSelectedObjects(true);

        // Update Texture Matrix for Depth compare
        this.updateTextureMatrix();

        // Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects
        this.changeVisibilityOfNonSelectedObjects(false);
        this.renderScene.overrideMaterial = this.prepareMaskMaterial;
        this.prepareMaskMaterial.uniforms["cameraNearFar"].value =
          new THREE.Vector2(this.renderCamera.near, this.renderCamera.far);
        this.prepareMaskMaterial.uniforms["depthTexture"].value =
          this.renderTargetDepthBuffer.texture;
        this.prepareMaskMaterial.uniforms["textureMatrix"].value =
          this.textureMatrix;
        renderer.render(
          this.renderScene,
          this.renderCamera,
          this.renderTargetMaskBuffer,
          true
        );
        this.renderScene.overrideMaterial = null;
        this.changeVisibilityOfNonSelectedObjects(true);

        this.renderScene.background = currentBackground;

        // 2. Downsample to Half resolution
        this.quad.material = this.materialCopy;
        this.copyUniforms["tDiffuse"].value =
          this.renderTargetMaskBuffer.texture;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetMaskDownSampleBuffer,
          true
        );

        this.tempPulseColor1.copy(this.visibleEdgeColor);
        this.tempPulseColor2.copy(this.hiddenEdgeColor);

        if (this.pulsePeriod > 0) {
          var scalar =
            (1 + 0.25) / 2 +
            (Math.cos((performance.now() * 0.01) / this.pulsePeriod) *
              (1.0 - 0.25)) /
              2;
          this.tempPulseColor1.multiplyScalar(scalar);
          this.tempPulseColor2.multiplyScalar(scalar);
        }

        // 3. Apply Edge Detection Pass
        this.quad.material = this.edgeDetectionMaterial;
        this.edgeDetectionMaterial.uniforms["maskTexture"].value =
          this.renderTargetMaskDownSampleBuffer.texture;
        this.edgeDetectionMaterial.uniforms["texSize"].value =
          new THREE.Vector2(
            this.renderTargetMaskDownSampleBuffer.width,
            this.renderTargetMaskDownSampleBuffer.height
          );
        this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value =
          this.tempPulseColor1;
        this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value =
          this.tempPulseColor2;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetEdgeBuffer1,
          true
        );

        // 4. Apply Blur on Half res
        this.quad.material = this.separableBlurMaterial1;
        this.separableBlurMaterial1.uniforms["colorTexture"].value =
          this.renderTargetEdgeBuffer1.texture;
        this.separableBlurMaterial1.uniforms["direction"].value =
          THREE.OutlinePass.BlurDirectionX;
        this.separableBlurMaterial1.uniforms["kernelRadius"].value =
          this.edgeThickness;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetBlurBuffer1,
          true
        );
        this.separableBlurMaterial1.uniforms["colorTexture"].value =
          this.renderTargetBlurBuffer1.texture;
        this.separableBlurMaterial1.uniforms["direction"].value =
          THREE.OutlinePass.BlurDirectionY;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetEdgeBuffer1,
          true
        );

        // Apply Blur on quarter res
        this.quad.material = this.separableBlurMaterial2;
        this.separableBlurMaterial2.uniforms["colorTexture"].value =
          this.renderTargetEdgeBuffer1.texture;
        this.separableBlurMaterial2.uniforms["direction"].value =
          THREE.OutlinePass.BlurDirectionX;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetBlurBuffer2,
          true
        );
        this.separableBlurMaterial2.uniforms["colorTexture"].value =
          this.renderTargetBlurBuffer2.texture;
        this.separableBlurMaterial2.uniforms["direction"].value =
          THREE.OutlinePass.BlurDirectionY;
        renderer.render(
          this.scene,
          this.camera,
          this.renderTargetEdgeBuffer2,
          true
        );

        // Blend it additively over the input texture
        this.quad.material = this.overlayMaterial;
        this.overlayMaterial.uniforms["maskTexture"].value =
          this.renderTargetMaskBuffer.texture;
        this.overlayMaterial.uniforms["edgeTexture1"].value =
          this.renderTargetEdgeBuffer1.texture;
        this.overlayMaterial.uniforms["edgeTexture2"].value =
          this.renderTargetEdgeBuffer2.texture;
        this.overlayMaterial.uniforms["patternTexture"].value =
          this.patternTexture;
        this.overlayMaterial.uniforms["edgeStrength"].value = this.edgeStrength;
        this.overlayMaterial.uniforms["edgeGlow"].value = this.edgeGlow;
        this.overlayMaterial.uniforms["usePatternTexture"].value =
          this.usePatternTexture;

        if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

        renderer.render(this.scene, this.camera, readBuffer, false);

        renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
        renderer.autoClear = oldAutoClear;
      }

      if (this.renderToScreen) {
        this.quad.material = this.materialCopy;
        this.copyUniforms["tDiffuse"].value = readBuffer.texture;
        renderer.render(this.scene, this.camera);
      }
    },

    getPrepareMaskMaterial: function () {
      return new THREE.ShaderMaterial({
        uniforms: {
          depthTexture: { value: null },
          cameraNearFar: { value: new THREE.Vector2(0.5, 0.5) },
          textureMatrix: { value: new THREE.Matrix4() },
        },

        vertexShader: [
          "varying vec4 projTexCoord;",
          "varying vec4 vPosition;",
          "uniform mat4 textureMatrix;",

          "void main() {",

          "	vPosition = modelViewMatrix * vec4( position, 1.0 );",
          "	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
          "	projTexCoord = textureMatrix * worldPosition;",
          "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

          "}",
        ].join("\n"),

        fragmentShader: [
          "#include <packing>",
          "varying vec4 vPosition;",
          "varying vec4 projTexCoord;",
          "uniform sampler2D depthTexture;",
          "uniform vec2 cameraNearFar;",

          "void main() {",

          "	float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));",
          "	float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );",
          "	float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;",
          "	gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);",

          "}",
        ].join("\n"),
      });
    },

    getEdgeDetectionMaterial: function () {
      return new THREE.ShaderMaterial({
        uniforms: {
          maskTexture: { value: null },
          texSize: { value: new THREE.Vector2(0.5, 0.5) },
          visibleEdgeColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
          hiddenEdgeColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        },

        vertexShader:
          "varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

        fragmentShader:
          "varying vec2 vUv;\
				uniform sampler2D maskTexture;\
				uniform vec2 texSize;\
				uniform vec3 visibleEdgeColor;\
				uniform vec3 hiddenEdgeColor;\
				\
				void main() {\n\
					vec2 invSize = 1.0 / texSize;\
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);\
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);\
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);\
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);\
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);\
					float diff1 = (c1.r - c2.r)*0.5;\
					float diff2 = (c3.r - c4.r)*0.5;\
					float d = length( vec2(diff1, diff2) );\
					float a1 = min(c1.g, c2.g);\
					float a2 = min(c3.g, c4.g);\
					float visibilityFactor = min(a1, a2);\
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;\
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);\
				}",
      });
    },

    getSeperableBlurMaterial: function (maxRadius) {
      return new THREE.ShaderMaterial({
        defines: {
          MAX_RADIUS: maxRadius,
        },

        uniforms: {
          colorTexture: { value: null },
          texSize: { value: new THREE.Vector2(0.5, 0.5) },
          direction: { value: new THREE.Vector2(0.5, 0.5) },
          kernelRadius: { value: 1.0 },
        },

        vertexShader:
          "varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

        fragmentShader:
          "#include <common>\
				varying vec2 vUv;\
				uniform sampler2D colorTexture;\
				uniform vec2 texSize;\
				uniform vec2 direction;\
				uniform float kernelRadius;\
				\
				float gaussianPdf(in float x, in float sigma) {\
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
				}\
				void main() {\
					vec2 invSize = 1.0 / texSize;\
					float weightSum = gaussianPdf(0.0, kernelRadius);\
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\
					vec2 uvOffset = delta;\
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {\
						float w = gaussianPdf(uvOffset.x, kernelRadius);\
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\
						diffuseSum += ((sample1 + sample2) * w);\
						weightSum += (2.0 * w);\
						uvOffset += delta;\
					}\
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);\
				}",
      });
    },

    getOverlayMaterial: function () {
      return new THREE.ShaderMaterial({
        uniforms: {
          maskTexture: { value: null },
          edgeTexture1: { value: null },
          edgeTexture2: { value: null },
          patternTexture: { value: null },
          edgeStrength: { value: 1.0 },
          edgeGlow: { value: 1.0 },
          usePatternTexture: { value: 0.0 },
        },

        vertexShader:
          "varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

        fragmentShader:
          "varying vec2 vUv;\
				uniform sampler2D maskTexture;\
				uniform sampler2D edgeTexture1;\
				uniform sampler2D edgeTexture2;\
				uniform sampler2D patternTexture;\
				uniform float edgeStrength;\
				uniform float edgeGlow;\
				uniform bool usePatternTexture;\
				\
				void main() {\
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);\
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);\
					vec4 maskColor = texture2D(maskTexture, vUv);\
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);\
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;\
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;\
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;\
					if(usePatternTexture)\
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);\
					gl_FragColor = finalColor;\
				}",
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      });
    },
  }
);

THREE.OutlinePass.BlurDirectionX = new THREE.Vector2(1.0, 0.0);
THREE.OutlinePass.BlurDirectionY = new THREE.Vector2(0.0, 1.0);

/**
 * @author Slayvin / http://slayvin.net
 */

THREE.Reflector = function (geometry, options) {
  THREE.Mesh.call(this, geometry);

  this.type = "Reflector";

  var scope = this;

  options = options || {};

  var color =
    options.color !== undefined
      ? new THREE.Color(options.color)
      : new THREE.Color(0x7f7f7f);
  var textureWidth = options.textureWidth || 512;
  var textureHeight = options.textureHeight || 512;
  var clipBias = options.clipBias || 0;
  var shader = options.shader || THREE.Reflector.ReflectorShader;
  var recursion = options.recursion !== undefined ? options.recursion : 0;

  //

  var reflectorPlane = new THREE.Plane();
  var normal = new THREE.Vector3();
  var reflectorWorldPosition = new THREE.Vector3();
  var cameraWorldPosition = new THREE.Vector3();
  var rotationMatrix = new THREE.Matrix4();
  var lookAtPosition = new THREE.Vector3(0, 0, -1);
  var clipPlane = new THREE.Vector4();
  var viewport = new THREE.Vector4();

  var view = new THREE.Vector3();
  var target = new THREE.Vector3();
  var q = new THREE.Vector4();

  var textureMatrix = new THREE.Matrix4();
  var virtualCamera = new THREE.PerspectiveCamera();

  var parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false,
  };

  var renderTarget = new THREE.WebGLRenderTarget(
    textureWidth,
    textureHeight,
    parameters
  );

  if (
    !THREE.Math.isPowerOfTwo(textureWidth) ||
    !THREE.Math.isPowerOfTwo(textureHeight)
  ) {
    renderTarget.texture.generateMipmaps = false;
  }

  var material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(shader.uniforms),
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
  });

  material.uniforms.tDiffuse.value = renderTarget.texture;
  material.uniforms.color.value = color;
  material.uniforms.textureMatrix.value = textureMatrix;

  this.material = material;

  this.onBeforeRender = function (renderer, scene, camera) {
    if ("recursion" in camera.userData) {
      if (camera.userData.recursion === recursion) return;

      camera.userData.recursion++;
    }

    reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
    cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

    rotationMatrix.extractRotation(scope.matrixWorld);

    normal.set(0, 0, 1);
    normal.applyMatrix4(rotationMatrix);

    view.subVectors(reflectorWorldPosition, cameraWorldPosition);

    // Avoid rendering when reflector is facing away

    if (view.dot(normal) > 0) return;

    view.reflect(normal).negate();
    view.add(reflectorWorldPosition);

    rotationMatrix.extractRotation(camera.matrixWorld);

    lookAtPosition.set(0, 0, -1);
    lookAtPosition.applyMatrix4(rotationMatrix);
    lookAtPosition.add(cameraWorldPosition);

    target.subVectors(reflectorWorldPosition, lookAtPosition);
    target.reflect(normal).negate();
    target.add(reflectorWorldPosition);

    virtualCamera.position.copy(view);
    virtualCamera.up.set(0, 1, 0);
    virtualCamera.up.applyMatrix4(rotationMatrix);
    virtualCamera.up.reflect(normal);
    virtualCamera.lookAt(target);

    virtualCamera.far = camera.far; // Used in WebGLBackground

    virtualCamera.updateMatrixWorld();
    virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

    virtualCamera.userData.recursion = 0;

    // Update the texture matrix
    textureMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
    );
    textureMatrix.multiply(virtualCamera.projectionMatrix);
    textureMatrix.multiply(virtualCamera.matrixWorldInverse);
    textureMatrix.multiply(scope.matrixWorld);

    // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
    // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    reflectorPlane.setFromNormalAndCoplanarPoint(
      normal,
      reflectorWorldPosition
    );
    reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

    clipPlane.set(
      reflectorPlane.normal.x,
      reflectorPlane.normal.y,
      reflectorPlane.normal.z,
      reflectorPlane.constant
    );

    var projectionMatrix = virtualCamera.projectionMatrix;

    q.x =
      (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) /
      projectionMatrix.elements[0];
    q.y =
      (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) /
      projectionMatrix.elements[5];
    q.z = -1.0;
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    // Calculate the scaled plane vector
    clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = clipPlane.x;
    projectionMatrix.elements[6] = clipPlane.y;
    projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
    projectionMatrix.elements[14] = clipPlane.w;

    // Render

    scope.visible = false;

    var currentRenderTarget = renderer.getRenderTarget();

    var currentVrEnabled = renderer.vr.enabled;
    var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

    renderer.vr.enabled = false; // Avoid camera modification and recursion
    renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

    renderer.render(scene, virtualCamera, renderTarget, true);

    renderer.vr.enabled = currentVrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

    renderer.setRenderTarget(currentRenderTarget);

    // Restore viewport

    var bounds = camera.bounds;

    if (bounds !== undefined) {
      var size = renderer.getSize();
      var pixelRatio = renderer.getPixelRatio();

      viewport.x = bounds.x * size.width * pixelRatio;
      viewport.y = bounds.y * size.height * pixelRatio;
      viewport.z = bounds.z * size.width * pixelRatio;
      viewport.w = bounds.w * size.height * pixelRatio;

      renderer.state.viewport(viewport);
    }

    scope.visible = true;
  };

  this.getRenderTarget = function () {
    return renderTarget;
  };
};

THREE.Reflector.prototype = Object.create(THREE.Mesh.prototype);
THREE.Reflector.prototype.constructor = THREE.Reflector;

THREE.Reflector.ReflectorShader = {
  uniforms: {
    color: {
      type: "c",
      value: null,
    },

    tDiffuse: {
      type: "t",
      value: null,
    },

    textureMatrix: {
      type: "m4",
      value: null,
    },
  },

  vertexShader: [
    "uniform mat4 textureMatrix;",
    "varying vec4 vUv;",

    "void main() {",

    "	vUv = textureMatrix * vec4( position, 1.0 );",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform vec3 color;",
    "uniform sampler2D tDiffuse;",
    "varying vec4 vUv;",

    "float blendOverlay( float base, float blend ) {",

    "	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );",

    "}",

    "vec3 blendOverlay( vec3 base, vec3 blend ) {",

    "	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );",

    "}",

    "void main() {",

    "	vec4 base = texture2DProj( tDiffuse, vUv );",
    "	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",

    "}",
  ].join("\n"),
};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function (
  scene,
  camera,
  overrideMaterial,
  clearColor,
  clearAlpha
) {
  THREE.Pass.call(this);

  this.scene = scene;
  this.camera = camera;

  this.overrideMaterial = overrideMaterial;

  this.clearColor = clearColor;
  this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

  this.clear = true;
  this.clearDepth = false;
  this.needsSwap = false;
};

THREE.RenderPass.prototype = Object.assign(
  Object.create(THREE.Pass.prototype),
  {
    constructor: THREE.RenderPass,

    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
      var oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;

      this.scene.overrideMaterial = this.overrideMaterial;

      var oldClearColor, oldClearAlpha;

      if (this.clearColor) {
        oldClearColor = renderer.getClearColor().getHex();
        oldClearAlpha = renderer.getClearAlpha();

        renderer.setClearColor(this.clearColor, this.clearAlpha);
      }

      if (this.clearDepth) {
        renderer.clearDepth();
      }

      renderer.render(
        this.scene,
        this.camera,
        this.renderToScreen ? null : readBuffer,
        this.clear
      );

      if (this.clearColor) {
        renderer.setClearColor(oldClearColor, oldClearAlpha);
      }

      this.scene.overrideMaterial = null;
      renderer.autoClear = oldAutoClear;
    },
  }
);

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function (shader, textureID) {
  THREE.Pass.call(this);

  this.textureID = textureID !== undefined ? textureID : "tDiffuse";

  if (shader instanceof THREE.ShaderMaterial) {
    this.uniforms = shader.uniforms;

    this.material = shader;
  } else if (shader) {
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.material = new THREE.ShaderMaterial({
      defines: Object.assign({}, shader.defines),
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });
  }

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  this.quad.frustumCulled = false; // Avoid getting clipped
  this.scene.add(this.quad);
};

THREE.ShaderPass.prototype = Object.assign(
  Object.create(THREE.Pass.prototype),
  {
    constructor: THREE.ShaderPass,

    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
      if (this.uniforms[this.textureID]) {
        this.uniforms[this.textureID].value = readBuffer.texture;
      }

      this.quad.material = this.material;

      if (this.renderToScreen) {
        renderer.render(this.scene, this.camera);
      } else {
        renderer.render(this.scene, this.camera, writeBuffer, this.clear);
      }
    },
  }
);
