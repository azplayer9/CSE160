// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_TextureType;

  void main() {
    if (u_TextureType == -2)
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
  }`


// Global Vars
let canvas;
let gl;
let vertexBuffer;
//let uvBuffer;

let a_Position;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_FragColor;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_TextureType;

// let cam;
// let identityM;
// let tempMatrix;
let blockType = 0;
//let g_globalAngle1 = document.getElementById('camAngle1').value;
//let g_globalAngle2 = document.getElementById('camAngle2').value;
let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
// let g_faceAnim = false;



///////////////////
// MAIN FUNCTION //
///////////////////

function main() {
  // set up WebGL context, shaders, etc.
  setUpWebGL();
  connectVariablesToGLSL();
  addUI();
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //cam = new Camera();
  buildWorld(worldArray);

  canvas.onmousedown = click;
  document.onkeydown = keydown;
  
  //renderAllShapes();
  //requestAnimationFrame(tick);
}



////////////////////////////////////
// SET UP WEBGL AND LOAD TEXTURES //
////////////////////////////////////

function setUpWebGL(){                // Set up WebGL and create buffers
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas, false, {preserveDrawingBuffer: true } );
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Create a vertex buffer
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the vertex buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // enable gl.DEPTH_TEST
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){    // Link variables from shaders to JavaScript
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

  u_TextureType = gl.getUniformLocation(gl.program, 'u_TextureType');
  if(!u_TextureType) {
    console.log('Failed to get the storage location of u_TextureType');
    return;
  }

  //identityM = new Matrix4();
  //gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addUI() {                    // Add UI Functionality from HTML Page
  // camera slider
  // document.getElementById('camAngle1').addEventListener('mousemove',  function(ev) { if(ev.buttons){ g_globalAngle1 = this.value; renderAllShapes();} } );

  document.getElementById('bt0').onclick = function() { blockType = 0; };
  document.getElementById('bt1').onclick = function() { blockType = 1; };
  document.getElementById('bt2').onclick = function() { blockType = 2; };
  document.getElementById('bt3').onclick = function() { blockType = -1; };
}

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
  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
  renderAllShapes();
}

function inBounds(eye){ // check to see if eye is colliding with a block
  //console.log(eye);
  // check world boundaries
  if (eye[0] > 14 || eye[0] < -15 || eye[1] > 4  || eye[1] < 0  || eye[2] > 14 || eye[2] < -15)
    return false;
  
  //console.log(worldArray[eye[0] + 16][eye[2] + 16]);
  if (eye[1] < worldArray[Math.round(eye[2] + 16)][Math.round(eye[0] + 16)]){   
    return false;
  }

  for(let i = generatedBlocks; i < worldShapes.length; i++){
    let temp = new Vector3([worldShapes[i].matrix.elements[12], 
                            worldShapes[i].matrix.elements[13], 
                            worldShapes[i].matrix.elements[14] ]).elements;
    if(temp[0] == Math.round(eye[0]) && temp[1] == Math.round(eye[1]) && temp[2] == Math.round(eye[2])){
      return false;
    }
  }
  //console.log("eye is in bounds");
  return true;
}

var rotate = 1;

function click(ev) {
  let d = new Vector3(g_at.elements);   // d = at - eye
  d.sub(g_eye);

  let blockPos = new Vector3(g_eye.elements).add(d.normalize());
  //console.log("blockPos: " + blockPos.elements);
  // round off blockPosition so it fits cleanly into the world
  blockPos = new Vector3([Math.round(blockPos.elements[0]), 
                          Math.round(blockPos.elements[1]), 
                          Math.round(blockPos.elements[2])]).elements;

  if(ev.button == 0){
    //console.log("trying to add block at: " + blockPos);
    if(inBounds(blockPos)){
      newBlock = new Cube();
      newBlock.textureType = blockType;
      newBlock.matrix.translate(Math.round(blockPos[0]), 
                                Math.round(blockPos[1]), 
                                Math.round(blockPos[2]) );
      //console.log(newBlock);
      worldShapes.push(newBlock);
      //console.log("Added block at: " + blockPos);
    }
    //else console.log("Can't place block there.");
  }
  else if(ev.button == 1 || ev.button == 2){
    for(let i = generatedBlocks; i < worldShapes.length; i++){
      //console.log(worldShapes[i].matrix);
      temp = new Vector3([worldShapes[i].matrix.elements[12], 
                          worldShapes[i].matrix.elements[13], 
                          worldShapes[i].matrix.elements[14] ]).elements;
      //console.log(temp);
      //console.log(blockPos);
      if(temp[0] == blockPos[0] && temp[1] == blockPos[1] && temp[2] == blockPos[2]){
        worldShapes.splice(i,1);
        break;
      }
    }
    //console.log("delete blocks at: " + blockPos);
  }
  // clear the canvas and then draw all shapes 
  renderAllShapes();
}

function keydown(ev) {                  // Set up keybindings
  // console.log("eye: " + g_eye.elements);
  // console.log("at: " + g_at.elements);
  
  let d = new Vector3(g_at.elements);   // d = at - eye
  d.sub(g_eye);
  //console.log("d: " + d.elements);

  if (ev.keyCode == 87) { // 'w' key --> move forward
    g_eye.add(d.normalize());
    g_at.add(d);
    
    if (!inBounds(g_eye.elements)){ // check if move was legal
      g_eye.sub(d);
      g_at.sub(d);
    }
  }
  else if (ev.keyCode == 65) { // 'a' key --> move left
    let c = Vector3.cross(d.normalize(), g_up);
    g_eye.sub(c);
    g_at.sub(c);

    if (!inBounds(g_eye.elements)){ // check if move was legal
      g_eye.add(c);
      g_at.add(c);
    }
  }
  else if (ev.keyCode == 83) { // 's' key --> move back
    g_eye.sub(d.normalize());
    g_at.sub(d);
    
    if (!inBounds(g_eye.elements)){ // check if move was legal
      g_eye.add(d);
      g_at.add(d);
    }
  }
  else if (ev.keyCode == 68) { // 'd' key --> move right
    let c = Vector3.cross(d.normalize(), g_up);
    g_eye.add(c);
    g_at.add(c);

    if (!inBounds(g_eye.elements)){ // check if move was legal
      g_eye.sub(c);
      g_at.sub(c);
    }
  }
  else if (ev.keyCode == 81) { // 'q' key
    //console.log("Rotate camera left");
    // g_eye[0] += 0.2;
    let r = d.magnitude();
    let theta = Math.atan(d.elements[0]/d.elements[2]);
    
    //let rotated = false;
    //console.log("rotate: " + rotate);
    if(Math.round(theta * 180/Math.PI) == -90){
      //rotated = true;
      rotate *= -1;
      //console.log("rotate changed: " + rotate);
    }
    //console.log("init theta: " + theta * 180/Math.PI);
    theta += 5 / 180 * Math.PI;
    //console.log("new theta: " + theta * 180/Math.PI);

    let newD = new Vector3( [ r * Math.sin(theta) * rotate, 
                              0, 
                              r * Math.cos(theta) * rotate] );

    //console.log("newD: " + newD.elements);
    let theta2 = Math.atan(newD.elements[0]/newD.elements[2]);
    //console.log("updated theta check: " + theta2 * 180/Math.PI);

    if(Math.round(theta * 180/Math.PI) != Math.round(theta2 * 180/Math.PI) && Math.round(theta2 * 180/Math.PI) != 90 
                                                                           && Math.round(theta2 * 180/Math.PI)!= -90){
      rotate *= -1;
      //console.log("rotate changed: " + rotate);
    }

    g_at = new Vector3(g_eye.elements).sub(newD);
  }
  else if (ev.keyCode == 69) { // 'e' key
    //console.log("Rotate camera right");
    // g_eye[0] += 0.2;
    let r = d.magnitude();
    let theta = Math.atan(d.elements[0]/d.elements[2]);
    
    //let rotated = false;
    //console.log("rotate: " + rotate);
    if(Math.round(theta * 180/Math.PI) == 90){
      //rotated = true;
      rotate *= -1;
      //console.log("rotate changed: " + rotate);
    }
    //console.log("init theta: " + theta * 180/Math.PI);
    theta -= 5 / 180 * Math.PI;
    //console.log("new theta: " + theta * 180/Math.PI);

    let newD = new Vector3( [ r * Math.sin(theta) * rotate, 
                              0, 
                              r * Math.cos(theta) * rotate] );

    //console.log("newD: " + newD.elements);
    let theta2 = Math.atan(newD.elements[0]/newD.elements[2]);
    //console.log("updated theta check: " + theta2 * 180/Math.PI);

    if(Math.round(theta * 180/Math.PI) != Math.round(theta2 * 180/Math.PI) && Math.round(theta2 * 180/Math.PI) != 90 
                                                                           && Math.round(theta2 * 180/Math.PI)!= -90){
      rotate *= -1;
      //console.log("rotate changed: " + rotate);
    }

    g_at = new Vector3(g_eye.elements).sub(newD);
  }
  else if (ev.keyCode == 32) { // 'SPACE' key
    if(g_eye.elements[1] <= 3){
      g_eye.elements[1] += 1;
      g_at.elements[1] += 1;
    }
  }
  else if (ev.keyCode == 17) { // 'ctrl' key
    if(g_eye.elements[1] >= 1){
      g_eye.elements[1] -=1;
      g_at.elements[1] -= 1;
    }
  }

  else{ // ignore all other key commands
    return;
  }
  
  //console.log("eye after moving:" + g_eye.elements);
  //console.log("at after moving:" + g_at.elements);
  //console.log("");
  renderAllShapes();
}



/////////////////////////
// RENDER/BUILD SHAPES //
/////////////////////////

// Global Camera Matrices
let globalRotMat = new Matrix4();
let viewMat = new Matrix4();
let projMat = new Matrix4();

// ViewMatrix vectors:
let g_eye = new Vector3([0, 0, 1]);
let g_at = new Vector3([0, 0, -100]);
let g_up = new Vector3([0, 1, 0]);

//var g_shapeList = []; // The array to store the shapes
var worldArray = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
var worldShapes = []; // array to hold all blocks in the world including sky and ground
var generatedBlocks = 2;

// global COLOR variables:
//var BODY_COLOR  = [0.90, 0.40, 0.25, 1.0];    // primary body color
var SKYCOLOR = [.7, .8, 1, 1];
var GROUNDCOLOR = [.3, .5, .3, 1];


function buildWorld(worldArray){ // create cubes to put into worldShapes given the array worldArray
  let sky = new Cube();
  sky.color = SKYCOLOR;
  sky.textureType = -2;
  sky.matrix.translate(0, 2, 0);
  sky.matrix.scale(32, 5, 32);
  worldShapes.push(sky);

  let ground = new Cube();
  ground.color = GROUNDCOLOR;
  ground.textureType = -2;
  ground.matrix.translate(0, -0.5, 0);
  ground.matrix.scale(32, 0.01, 32);
  worldShapes.push(ground);

  for(let i = 0; i < worldArray.length; i++){
    for(let j = 0; j < worldArray[i].length; j++){
      for(let n = 0; n < worldArray[i][j]; n++){
        let temp = new Cube();
        temp.textureType = 0;
        temp.matrix.translate(j-16, n, i-16);
        worldShapes.push(temp);
        generatedBlocks++;
      }
    }    
  }
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 50); // (degrees wide, aspect ratio, near plane, far plane)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
}


function renderAllShapes(){
  // check time at start of function
  //var startTime = performance.now();

  //globalRotMat = new Matrix4().rotate(-g_globalAngle1, 0, 1, 0);
  //globalRotMat.rotate(-g_globalAngle2, 1, 0, 0);
  //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  viewMat.setLookAt(g_eye.elements[0], g_eye.elements[1], g_eye.elements[2], 
                    g_at.elements[0],  g_at.elements[1],  g_at.elements[2], 
                    g_up.elements[0],  g_up.elements[1],  g_up.elements[2]  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // projMat.setPerspective(60, canvas.width/canvas.height, .1, 50); // (degrees wide, aspect ratio, near plane, far plane)
  // gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < worldShapes.length; i++) {
    worldShapes[i].render();
  }

}