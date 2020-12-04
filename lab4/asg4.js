// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = a_Normal;
    v_Normal = normalize( vec3(u_NormalMatrix * vec4(a_Normal, 1)) );
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform bool u_Lighting;
  uniform int u_TextureType;
  uniform float u_Speckle;
  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  varying vec4 v_VertPos;

  void main() {
    if (u_TextureType == -3)
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); // use normal to calculate color
    else if (u_TextureType == -2)
      gl_FragColor = u_FragColor;
    else if (u_TextureType == -1)
      gl_FragColor = vec4(v_UV, 1.0, 1.0); // UV covers r, g; b=1; alpha = 1
    else if (u_TextureType == 0)
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    else if (u_TextureType == 1)
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    else if (u_TextureType == 2)
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    else 
      gl_FragColor = vec4(1, 0.5, 0.5, 1);
        
    //  for visualizing the light radius using red/green
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1, 0, 0, 1);
    // } else if (r < 2.0){
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // }
    
    if(u_Lighting){
      vec3 lightVector = u_LightPos - vec3(v_VertPos);
      float r = length(lightVector);
      
      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);

      // Reflection R
      vec3 R = reflect(-L, N);

      // eye position
      vec3 E = normalize(u_CameraPos - vec3(v_VertPos));

      // specular
      float specular = u_Speckle * pow(max(dot(E,R), 0.0), 100.0);
      
      vec3 ambient = vec3(gl_FragColor) * 0.4; // can tweak this constant or even change it based on the shape?
      vec3 diffuse = vec3(gl_FragColor) * nDotL;

      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }
  }`


// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;

let u_FragColor;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Lighting
let u_TextureType;
let u_LightPos;
let u_CameraPos;
let u_VertPos;

let identityM;
let tempMatrix;
let vertexBuffer;
let cam; 

let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
let lighting = true;
let renderNorm = false;
let lightBool = true;
let g_globalAngle = document.getElementById('camAngle').value;
let g_lightPos = [document.getElementById('lightX').value / -100,
                  document.getElementById('lightY').value / 100, 
                  document.getElementById('lightZ').value / -100];
let g_faceAnim = false;
let g_boomerAnim = false;

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

function main() {
  // set up WebGL context, shaders, etc.
  setUpWebGL();
  connectVariablesToGLSL();
  addUI();
  //initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  cam = new Camera();
  //console.log(cam);

  makeEnv();
  makeHead();
  //makeBody();
  makeScarf();
  makeLimbs();
  renderAllShapes();
  requestAnimationFrame(tick);

  document.onkeydown = keydown;
}

//var g_shapeList = []; // The array to store the shapes
let worldShapes = [];
let bodyShapes = [];
let headShapes = [];
let scarfShapes = [];
let limbShapes = [];
let boomerangShapes = [];

let headPosMatrix;
let neckMatrix;
let upperBodyPosMatrix;
let lowerBodyPosMatrix;
let jawPosMatrix;
let boomerangArmPos;
let eye1Pos;

let globalRotMat;

function setUpWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas, false);
  gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Create a buffer object
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the vertex buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Lighting = gl.getUniformLocation(gl.program, 'u_Lighting');
  if(!u_Lighting) {
    console.log('Failed to get the storage location of u_Lighting');
    return;
  }

  u_TextureType = gl.getUniformLocation(gl.program, 'u_TextureType');
  if(!u_TextureType) {
    console.log('Failed to get the storage location of u_TextureType');
    return;
  }

  u_Speckle = gl.getUniformLocation(gl.program, 'u_Speckle');
  if(!u_Speckle) {
    console.log('Failed to get the storage location of u_Speckle');
    return;
  }

  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if(!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return;
  }

  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if(!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
    return;
  }

  //identityM = new Matrix4();
  //gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addUI() {
  // camera slider
  document.getElementById('camAngle').addEventListener('mousemove', function(ev) { if(ev.buttons){g_globalAngle = this.value; renderAllShapes();} } );

  document.getElementById('lightingToggle').onclick = function() { lighting = !lighting; renderAllShapes();}
  document.getElementById('lightToggle').onclick = function() { lightBool = !lightBool;
                                                                g_startTime = performance.now() / 1000.0;
                                                                requestAnimationFrame(tick);};
  document.getElementById('lightX').addEventListener('mousemove', function(ev) { if(ev.buttons){lightBool = false; g_lightPos[0] = -this.value/100; renderAllShapes();} } );
  document.getElementById('lightY').addEventListener('mousemove', function(ev) { if(ev.buttons){lightBool = false; g_lightPos[1] = this.value/100; renderAllShapes();} } );
  document.getElementById('lightZ').addEventListener('mousemove', function(ev) { if(ev.buttons){lightBool = false; g_lightPos[2] = -this.value/100; renderAllShapes();} } );

  document.getElementById('normToggle').onclick = function() { renderNorm = !renderNorm; renderAllShapes();} // reverse renderNorm 

  document.getElementById('eyeAnimOn').onclick = function() { g_faceAnim = !g_faceAnim;
                                                              g_startTime = performance.now() / 1000.0;
                                                              requestAnimationFrame(tick);};
  document.getElementById('boomAnimOn').onclick = function() {  g_boomerAnim = !g_boomerAnim; 
                                                                g_startTime = performance.now() / 1000.0;
                                                                requestAnimationFrame(tick);};
}

function keydown(ev) {                  // Set up keybindings
  if (ev.keyCode == 87) { // 'w' key --> move forward
    cam.moveForward();
  }
  else if (ev.keyCode == 65) { // 'a' key --> move left
    cam.moveLeft();
  }
  else if (ev.keyCode == 83) { // 's' key --> move back
    cam.moveBack();
  }
  else if (ev.keyCode == 68) { // 'd' key --> move right
    cam.moveRight();
  }
  else if (ev.keyCode == 81) { // 'q' key
    cam.panLeft();
  }
  else if (ev.keyCode == 69) { // 'e' key
    cam.panRight();
  }
  else if (ev.keyCode == 32) { // 'SPACE' key
    cam.moveUp();
  }
  else if (ev.keyCode == 17) { // 'ctrl' key
    cam.moveDown();
  }

  else{ // ignore all other key commands
    return;
  }
  renderAllShapes();
}


////////////////////////////
// texture stuff (in case)//
////////////////////////////

function initTextures(){              // Initialize textures to be used
  var image0 = new Image();
  if(!image0) {
    console.log('Failed to create the image');
    return false;
  }
  image0.onload = function(){ loadTexture(image0, 0); };
  image0.src = 'textures/lava.jpg'

  // initialize more textures 
  var image1 = new Image();
  if(!image1) {
    console.log('Failed to create the image');
    return false;
  }
  image1.onload = function(){ loadTexture(image1, 1); };
  image1.src = 'textures/desert.jpg'

  var image2 = new Image();
  if(!image2) {
    console.log('Failed to create the image');
    return false;
  }
  image2.onload = function(){ loadTexture(image2, 2); };
  image2.src = 'textures/wood.jpg';

  return true;
}

function loadTexture(image, texNum) {           // Load Textures and render shapes
  var texture = gl.createTexture();
  if (texNum == 0){
    //console.log("texture0");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    // Make the texture unit active
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, texNum);
  }

  if (texNum == 1){
    //console.log("texture1");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    // Make the texture unit active
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, texNum);
  }

  if (texNum == 2){
    //console.log("texture1");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    // Make the texture unit active
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, texNum);
  }

  renderAllShapes();
}
