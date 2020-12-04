// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`


// Global Vars
let canvas;
let gl;
let a_Position;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_FragColor;
let identityM;
let tempMatrix;
let vertexBuffer;
let g_globalAngle = document.getElementById('camAngle').value;
let g_armAngle1 = document.getElementById('armAngle1').value;
let g_armAngle2 = document.getElementById('armAngle2').value;
let g_faceAnim = false;
let g_boomerAnim = false;

function setUpWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
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

  //identityM = new Matrix4();
  //gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function addUI() {
  // camera slider
  document.getElementById('camAngle').addEventListener('mousemove', function(ev) { if(ev.buttons){g_globalAngle = this.value; renderAllShapes();} } );
  document.getElementById('armAngle1').addEventListener('mousemove', function(ev) { if(ev.buttons){g_armAngle1 = this.value; renderAllShapes(); } } );
  document.getElementById('armAngle2').addEventListener('mousemove', function(ev) { if(ev.buttons){g_armAngle2 = this.value; renderAllShapes(); } } );
  document.getElementById('eyeAnimOn').onclick = function() { g_faceAnim = true;
                                                              //g_boomerAnim = false; 
                                                              g_startTime = performance.now() / 1000.0;
                                                              requestAnimationFrame(tick);};
  document.getElementById('boomAnimOn').onclick = function() {  //g_faceAnim = false;
                                                                g_boomerAnim = true; 
                                                                g_startTime = performance.now() / 1000.0;
                                                                requestAnimationFrame(tick);};
  document.getElementById('animOff').onclick = function() { g_faceAnim = false;
                                                            //g_boomerAnim = false;
                                                            requestAnimationFrame(tick);};
  document.getElementById('animOff2').onclick = function() {g_boomerAnim = false;
                                                            requestAnimationFrame(tick);};
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function main() {
  // set up WebGL context, shaders, etc.
  setUpWebGL();
  connectVariablesToGLSL();
  addUI();
  var b = new Cube();
  b.render();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  makeHead();
  makeBody();
  makeScarf();
  makeLimbs();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function tick(){
  //
  //console.log(g_seconds);
  g_seconds = performance.now() / 1000.0 - g_startTime;
  
  // animate
  updateShapes();
  // draw
  renderAllShapes();
  
  if(g_faceAnim || g_boomerAnim){
    // update again when animation
    requestAnimationFrame(tick);
  }
  else{
    g_startTime = performance.now() / 1000.0;
  }
}


//var g_shapeList = []; // The array to store the shapes
var bodyShapes = [];
var headShapes = [];
var scarfShapes = [];
var limbShapes = [];
var boomerangShapes = [];

let headPosMatrix;
let upperBodyPosMatrix;
let lowerBodyPosMatrix;
let jawPosMatrix;
let boomerangArmPos;
let eye1Pos;
let globalRotMat

// global COLOR variables:
let BODY_COLOR  = [0.90, 0.40, 0.25, 1.0];    // primary body color
let LIGHT_BODY  = [0.95, 0.85, 0.70, 1.0];    // lighter body tone for belly and fur colorings
let EAR_COLOR   = [0.75, 0.45, 0.95, 1.0];    // color for inner ear
let CLOTH_COLOR = [0.65, 0.25, 0.25, 1.0];    // color for scarf and undies
let BLUE_FUR    = [0.40, 0.35, 0.85, 1.0];    // color for blue tints on tail and ear
let BONE_COLOR  = [0.90, 0.85, 0.50, 1.0];    // color for teeth, skull, and boomerang
let PINK_COLOR  = [1.00, 0.30, 0.30, 1.0];    // color for lips/mouth and nose
let BLACK_COLOR = [0.10, 0.10, 0.10, 1.0];    // color for eyes and open mouth


function renderAllShapes(){
  // check time at start of function
  //var startTime = performance.now();

  globalRotMat = new Matrix4().rotate(-g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // render each part from each mainpart list
  renderHead();
  renderEyes();
  renderBody();
  renderScarf();
  renderLimbs();
  renderBoomerangArm();
  renderBoomerang();

  //var duration = performance.now() - startTime;
}



//////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------- RENDERING FUNCTIONS------------------------------------//
//////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////
//-- FOR HEAD --//
//////////////////

// render all shapes in headshapes
function renderHead(){
  for (i = 0; i < headShapes.length; i++){
    headShapes[i].render();
  }
}
// draws the head shapes and adds them to headShapes list (real-time)
function makeHead(){
  // base head
  var head = new Cube();
  head.color = BODY_COLOR;
  head.matrix.translate(0, 0.15, 0);
  headPosMatrix = new Matrix4(head.matrix);
  head.matrix.scale(.25, .18, .18);
  tempMatrix = new Matrix4(head.matrix);
  //head.render();
  headShapes.push(head);
  
  var jaw = new Cube();
  jaw.color = BODY_COLOR;
  jaw.matrix = new Matrix4(headPosMatrix);
  jaw.matrix.translate(0, -0.08, -0.01);
  jawPosMatrix = new Matrix4(jaw.matrix);
  jaw.matrix.scale(0.3, 0.09, 0.2);
  //jaw.render();
  headShapes.push(jaw);

  // skull on head
  var skull1 = new Cube();
  skull1.color = BONE_COLOR;
  skull1.matrix = new Matrix4(head.matrix);
  skull1.matrix.translate(0, 0.7, -0.05);
  tempMatrix = new Matrix4(skull1.matrix);
  skull1.matrix.scale(0.5, .4, 0.6);
  //skull1.render();
  headShapes.push(skull1);
  
  var skull2 = new Pyramid();
  skull2.color = BONE_COLOR;
  skull2.matrix = new Matrix4(head.matrix);
  skull2.matrix.translate(0, 0.5, -0.51);
  skull2.matrix.rotate(60, 1, 0, 0);
  skull2.matrix.scale(0.35, -.6, 0.25);
  //skull2.render();
  headShapes.push(skull2);

  var skull3 = new Pyramid();
  skull3.color = BONE_COLOR;
  skull3.matrix = new Matrix4(tempMatrix);
  skull3.matrix.rotate(55, 0, 0, 1);
  tempMatrix = new Matrix4(skull3.matrix);
  skull3.matrix.scale(0.2, 1, 0.2);
  skull3.matrix.translate(-.5, 0.5, 0.3);
  skull3.matrix.rotate(15, 1, 0, 0);
  //skull3.render();
  headShapes.push(skull3);

  var skull4 = new Pyramid();
  skull4.color = BONE_COLOR;
  skull4.matrix = new Matrix4(tempMatrix);
  skull4.matrix.rotate(-110, 0, 0, 1);
  skull4.matrix.scale(0.2, 1, 0.2);
  skull4.matrix.translate(.5, 0.5, 0.3);
  skull4.matrix.rotate(15, 1, 0, 0);
  //skull4.render();
  headShapes.push(skull4);

  // left ear (from front)
  var ear1 = new Pyramid();
  ear1.color = BODY_COLOR;
  ear1.matrix = new Matrix4(head.matrix);
  ear1.matrix.translate(-0.85, 0.35, 0.3);
  ear1.matrix.scale(1, 0.7, 0.2);
  tempMatrix = new Matrix4(ear1.matrix);
  ear1.matrix.rotate(55, -0.1, 0, 1);
  //ear1.render();
  headShapes.push(ear1);

  var l_eartip1 = new Pyramid();
  l_eartip1.color = EAR_COLOR;
  l_eartip1.matrix = new Matrix4(tempMatrix);
  l_eartip1.matrix.rotate(55, -0.1, 0, 1);
  l_eartip1.matrix.scale(0.9, 0.9, 0.8)
  l_eartip1.matrix.translate(-.07, -0.1, -0.25)
  //l_eartip1.render();
  headShapes.push(l_eartip1);

  var l_eartip2 = new Pyramid();
  l_eartip2.color = BLUE_FUR;
  l_eartip2.matrix = new Matrix4(tempMatrix);
  l_eartip2.matrix.rotate(55, 0, 0, 1);
  l_eartip2.matrix.scale(0.4, 0.4, 0.5)
  l_eartip2.matrix.translate(0, 0.85, -0.05)
  //l_eartip2.render();
  headShapes.push(l_eartip2);

  // right ear (from front)
  var ear2 = new Pyramid();
  ear2.color = BODY_COLOR;
  ear2.matrix = new Matrix4(tempMatrix);
  ear2.matrix.translate(1.7, 0, 0);
  tempMatrix = new Matrix4(ear2.matrix);
  ear2.matrix.rotate(-55, 0.1, 0, 1);
  //ear2.render();
  headShapes.push(ear2);
  
  var r_eartip1 = new Pyramid();
  r_eartip1.color = EAR_COLOR;
  r_eartip1.matrix = new Matrix4(ear2.matrix);
  r_eartip1.matrix.scale(0.9, 0.9, 0.8)
  r_eartip1.matrix.translate(.07, -0.1, -0.25)
  //r_eartip1.render();
  headShapes.push(r_eartip1);
  
  var r_eartip2 = new Pyramid();
  r_eartip2.color = BLUE_FUR;
  r_eartip2.matrix = new Matrix4(tempMatrix);
  r_eartip2.matrix.rotate(-55, 0, 0, 1);
  r_eartip2.matrix.scale(0.4, 0.4, 0.5)
  r_eartip2.matrix.translate(0, 0.85, -0.05)
  //r_eartip2.render();
  headShapes.push(r_eartip2);
  
  // NOSE AREA
  var snout = new Cube();
  snout.color = LIGHT_BODY;
  snout.matrix = new Matrix4(jawPosMatrix);
  snout.matrix.translate(0, -0, -0.1);
  snout.matrix.scale(0.11, 0.09, 0.001);
  //snout.render();
  headShapes.push(snout);
  
  var nose = new Pyramid();
  nose.color = PINK_COLOR; // some kind of pink
  nose.matrix = new Matrix4(snout.matrix);
  nose.matrix.translate(0, 0.41, -0.5)
  nose.matrix.scale(.5, -.2, 1);
  //nose.render();
  headShapes.push(nose);

  var mouth = new Cube();
  mouth.color = BLACK_COLOR;
  mouth.matrix = new Matrix4(snout.matrix);
  mouth.matrix.translate(0, -0.1, -0.01);
  mouth.matrix.scale(1.6, 0.6, 1);
  //mouth.render();
  headShapes.push(mouth);
}


//////////////////
//-- FOR FACE --//
//////////////////

// render all face shapes(real-time)
function renderEyes() {
  // for rendering EYES
  var eye1 = new Cube();
  eye1.color = BLACK_COLOR;
  eye1.matrix = new Matrix4(headPosMatrix);
  eye1.matrix.translate(-0.06, -0.0, -0.088);
  eye1Pos = new Matrix4(eye1.matrix);
  eye1.matrix.scale(0.075, eyeScale, .01);
  eye1.render();
  //headShapes.push(eye1);

  var pupil1 = new Cube(); // color should be white
  pupil1.matrix = new Matrix4(eye1.matrix);
  pupil1.matrix.translate(0.05, 0.2, -0.1)
  pupil1.matrix.scale(.2, .2, 1);
  pupil1.render();
  //headShapes.push(pupil1);

  var eye2 = new Cube();
  eye2.color = [0.1, 0.1, 0.1, 1]; // almost black eyes
  eye2.matrix = new Matrix4(eye1.matrix)
  eye2.matrix.translate(1.6, 0, 0);
  eye2.render();
  //headShapes.push(eye2);

  var pupil2 = new Cube(); // color should be white
  pupil2.matrix = new Matrix4(eye2.matrix);
  pupil2.matrix.translate(-0.05, 0.2, -0.1)
  pupil2.matrix.scale(.2, .2, 1);
  pupil2.render();
  //headShapes.push(pupil2);

  var eyebrow1 = new Cube();
  eyebrow1.color = LIGHT_BODY;
  eyebrow1.matrix = new Matrix4(eye1Pos);
  eyebrow1.matrix.translate(0, 0.056, -0.008);
  eyebrow1.matrix.scale(.075, 0.014, .001);//0.075, 0.07, .01)
  eyebrow1.render();
  //headShapes.push(eyebrow1);

  var eyebrow2 = new Cube();
  eyebrow2.color = LIGHT_BODY;
  eyebrow2.matrix = new Matrix4(eyebrow1.matrix);
  eyebrow2.matrix.translate(1.6, 0, 0);
  //eyebrow2.matrix.scale(1, 0.2, 1);
  eyebrow2.render();
  //headShapes.push(eyebrow2);

  var fang1 = new Pyramid();
  fang1.color = BONE_COLOR;
  fang1.matrix = new Matrix4(jawPosMatrix);
  fang1.matrix.translate(-.07, 0.02, -.12);
  fang1.matrix.rotate(-45 + fangRotation, 1, 0, 0);
  tempMatrix = new Matrix4(fang1.matrix);
  fang1.matrix.rotate(15, 0, 0, 1);  
  fang1.matrix.scale(.05, .09, .05);
  //headShapes.push(fang1);
  fang1.render();
  
  var fang2 = new Pyramid();
  fang2.color = BONE_COLOR;
  fang2.matrix = tempMatrix;
  fang2.matrix.translate(.14, 0, 0);
  fang2.matrix.rotate(-15, 0, 0, 1);
  fang2.matrix.scale(.05, .09, .05);
  //headShapes.push(fang2);
  fang2.render();
}


//////////////////
//-- FOR BODY --//
//////////////////

// renders all shapes in bodyShapes list
function renderBody(){
  for (i = 0; i < bodyShapes.length; i++){
    bodyShapes[i].render();
  }
}
// Draws shapes and adds them to bodyShapes list
function makeBody(){
  var neck = new Cube();
  neck.color = BODY_COLOR;
  neck.matrix.scale(.05, .15, .05);
  bodyShapes.push(neck);
  //neck.render();

  var body1 = new Cube();
  body1.color = BODY_COLOR;
  body1.matrix.translate(0, -.04, 0);
  upperBodyPosMatrix = new Matrix4(body1.matrix);
  tempMatrix = new Matrix4(body1.matrix);
  body1.matrix.scale(0.1, 0.05, 0.1);
  bodyShapes.push(body1);
  //body1.render();
  
  var body2 = new Cube();
  body2.color = BODY_COLOR;
  body2.matrix = tempMatrix;
  body2.matrix.translate(0, -.065, 0);
  tempMatrix = new Matrix4(body2.matrix);
  body2.matrix.scale(.12, .085, .11);
  bodyShapes.push(body2);
  //body2.render();
  
  var belly = new Cube();
  belly.color = LIGHT_BODY;
  belly.matrix = tempMatrix;
  belly.matrix.translate(0, 0, -0.051);
  belly.matrix.scale(.072, 0.09, .01);
  bodyShapes.push(belly);
  //belly.render();

}


///////////////////
//-- FOR CLOTH --//
///////////////////

// renders all shapes in scarfShapes list
function renderScarf(){
  for (i = 0; i < scarfShapes.length; i++){
    scarfShapes[i].render();
  }
}
// makes SCARF shapes and adds to scarfShapes list
function makeScarf(){

  //front of scarf from left to right
  var scarf1 = new Cube();
  scarf1.color = CLOTH_COLOR;
  scarf1.matrix.translate(-.07, -.01, -.01);
  tempMatrix = new Matrix4(scarf1.matrix);
  scarf1.matrix.scale(0.05, 0.05, 0.05);
  scarfShapes.push(scarf1);

  var scarf2 = new Cube();
  scarf2.color = CLOTH_COLOR;
  scarf2.matrix = tempMatrix;
  scarf2.matrix.translate(.02, -0.015, -.05);
  tempMatrix = new Matrix4(scarf2.matrix);
  scarf2.matrix.scale(0.06, 0.06, 0.06);
  scarfShapes.push(scarf2);
  
  var scarf3 = new Cube();
  scarf3.color = CLOTH_COLOR;
  scarf3.matrix = tempMatrix;
  scarf3.matrix.translate(.05, -0.015, -.03);
  tempMatrix = new Matrix4(scarf3.matrix);
  scarf3.matrix.scale(0.08, 0.08, 0.08);
  scarfShapes.push(scarf3);
  
  var scarf4 = new Cube();
  scarf4.color = CLOTH_COLOR;
  scarf4.matrix = tempMatrix;
  scarf4.matrix.translate(.05, 0.015, 0.03);
  tempMatrix = new Matrix4(scarf4.matrix);
  scarf4.matrix.scale(0.06, 0.06, 0.06);
  scarfShapes.push(scarf4);

  var scarf5 = new Cube();
  scarf5.color = CLOTH_COLOR;
  scarf5.matrix = tempMatrix;
  scarf5.matrix.translate(.02, 0.015, 0.05);
  tempMatrix = new Matrix4(scarf5.matrix);
  scarf5.matrix.scale(0.05, 0.05, 0.05);
  scarfShapes.push(scarf5);

  // back of scarf
  var scarf6 = new Cube();
  scarf6.color = CLOTH_COLOR;
  scarf6.matrix = tempMatrix;
  scarf6.matrix.translate(-0.07, 0.01, 0.04);
  tempMatrix = new Matrix4(scarf6.matrix);
  scarf6.matrix.scale(0.15, 0.045, 0.04);
  scarfShapes.push(scarf6);

  var scarf7 = new Cube();
  scarf7.color = CLOTH_COLOR;
  scarf7.matrix = tempMatrix;
  scarf7.matrix.translate(0, 0, .03);
  scarf7.matrix.scale(0.08, 0.03, 0.03);
  scarfShapes.push(scarf7);

  // undies and tail
  var undy1 = new Cube();
  undy1.color = CLOTH_COLOR;
  undy1.matrix = new Matrix4(upperBodyPosMatrix);
  undy1.matrix.translate(0, -.12, 0);
  lowerBodyMatrix = new Matrix4(undy1.matrix);
  undy1.matrix.scale(0.13, 0.03, 0.12);
  scarfShapes.push(undy1);

  var undy2 = new Pyramid();
  undy2.color = CLOTH_COLOR;
  undy2.matrix = new Matrix4(undy1.matrix);
  undy2.matrix.translate(0, -1, -0.35);
  undy2.matrix.scale(.9, -3, .35);
  scarfShapes.push(undy2);

  // for rendering TAIL
  var tail1 = new Pyramid();
  tail1.color = BODY_COLOR;
  tail1.matrix = new Matrix4(lowerBodyMatrix);
  tail1.matrix.scale(0.09, 0.09, -0.2);
  tail1.matrix.rotate(80, 1, 0, 0);
  tempMatrix = new Matrix4(tail1.matrix);
  tail1.matrix.translate(0, -0.5, -0.2);
  bodyShapes.push(tail1);
  
  var tail2 = new Pyramid();
  tail2.color = BLUE_FUR;
  tail2.matrix = tempMatrix;
  tail2.matrix.translate(0, -1.25, -0.2);
  tail2.matrix.scale(1, -0.5, 1);
  bodyShapes.push(tail2);
}


///////////////////
//-- FOR LIMBS --//
///////////////////

// for rendering ARMS and LEGS
function renderLimbs(){
  for (i = 0; i < limbShapes.length; i++){
    limbShapes[i].render();
  }
}
// makes ARMS and LEGS shapes and adds to limbShapes list (STATIC)
function makeLimbs(){ 
  // right arm (from front)
  var arm2joint1 = new Cube();
  arm2joint1.color = BODY_COLOR;
  arm2joint1.matrix = new Matrix4(upperBodyPosMatrix);
  arm2joint1.matrix.translate(.065, -0.01, 0.015);
  arm2joint1.matrix.rotate(-60, 0, 0, 1);
  arm2joint1.matrix.rotate(-10, 0, 1, 0);
  tempMatrix = new Matrix4(arm2joint1.matrix);
  arm2joint1.matrix.scale(.06, 0.02, 0.02);
  limbShapes.push(arm2joint1);
  //arm2joint1.render();

  var arm2joint2 = new Cube();
  arm2joint2.color = BODY_COLOR;
  arm2joint2.matrix = tempMatrix;
  arm2joint2.matrix.translate(0.07, 0, 0)
  arm2joint2.matrix.rotate(20, 0, 1, 0);;
  arm2joint2.matrix.scale(0.08, 0.05, 0.05);
  limbShapes.push(arm2joint2);
  //arm2joint2.render();


  // left leg (from front)
  var leg1 = new Cube();
  leg1.color = BODY_COLOR;
  leg1.matrix = new Matrix4(lowerBodyMatrix);
  leg1.matrix.translate(-0.04, -0.06, 0.01);
  tempMatrix = new Matrix4(leg1.matrix);
  leg1.matrix.scale(0.04, 0.09, 0.04);
  limbShapes.push(leg1);
  //leg1.render();

  var foot1 = new Cube();
  foot1.color = BODY_COLOR;
  foot1.matrix = tempMatrix;
  foot1.matrix.translate(0, -0.05, -0.015);
  foot1.matrix.scale(0.06, 0.04, 0.08);
  limbShapes.push(foot1);
  // foot1.render();


  // right leg (from front)
  var leg2 = new Cube();
  leg2.color = BODY_COLOR;
  leg2.matrix = new Matrix4(lowerBodyMatrix);
  leg2.matrix.translate(0.04, -0.06, 0.01);
  tempMatrix = new Matrix4(leg2.matrix);
  leg2.matrix.scale(0.04, 0.09, 0.04);
  limbShapes.push(leg2);
  // leg2.render();

  var foot2 = new Cube();
  foot2.color = BODY_COLOR;
  foot2.matrix = tempMatrix;
  foot2.matrix.translate(0, -0.05, -0.015);
  foot2.matrix.scale(0.06, 0.04, 0.08);
  limbShapes.push(foot2);
  //foot2.render();
}


/////////////////////
//--FOR BOOMERANG--//
/////////////////////

// renders all shapes in boomerangShapes
// function renderBoomerang(){
//   for (i = 0; i < boomerangShapes.length; i++){
//     boomerangShapes[i].render();
//   }
// }

// renders arm holding boomerang (real-time)
function renderBoomerangArm(){
  // left arm (from front)
  var arm1joint1 = new Cube();
  arm1joint1.color = BODY_COLOR;
  arm1joint1.matrix = new Matrix4(upperBodyPosMatrix);
  if(!g_boomerAnim && !g_faceAnim){
    arm1joint1.matrix.translate(-.065 , -0.01 , 0.015 - (g_armAngle1/90)*.05);
    arm1joint1.matrix.rotate(45, 0, 0, 1);  
    arm1joint1.matrix.rotate(-g_armAngle1, 0, 1, 0); 
  }
  else {
    arm1joint1.matrix.translate(-.065 , -0.01 , 0.015);
    arm1joint1.matrix.rotate(45, 0, 0, 1);
    arm1joint1.matrix.rotate(armRotation1, 0, 1, 0); 
  }
  tempMatrix = new Matrix4(arm1joint1.matrix);
  arm1joint1.matrix.scale(.08, 0.02, 0.02);
  //limbShapes.push(arm1joint1);
  arm1joint1.render();

  var arm1joint2 = new Cube();
  arm1joint2.color = BODY_COLOR;
  arm1joint2.matrix = tempMatrix;
  if(!g_boomerAnim){
    arm1joint2.matrix.rotate(-g_armAngle2, 0, 1, 0);
    arm1joint2.matrix.translate(-.07 + 0.03 * (g_armAngle2/90), 0, 0.03 * (g_armAngle2/90));
  }
  else {
    arm1joint2.matrix.rotate(armRotation2, 0, 1, 0);
    arm1joint2.matrix.translate(-.07, 0, 0);
  }
  boomerangArmPos = new Matrix4(arm1joint2.matrix);
  arm1joint2.matrix.scale(0.08, 0.05, 0.05);
  //limbShapes.push(arm1joint2);
  arm1joint2.render();
}

// renders boomerang (real-time)
function renderBoomerang(){
  var middle = new Cube();
  middle.color = BONE_COLOR;
  middle.matrix = new Matrix4(boomerangArmPos);
  middle.matrix.rotate(90, 1, 0, 0);
  middle.matrix.translate(0, boomerTrans, 0);
  middle.matrix.rotate(boomerAngle, 0, 0, 1);
  middle.matrix.translate(-0.015, -0.03, 0);
  tempMatrix = new Matrix4(middle.matrix);
  middle.matrix.scale(0.03, 0.15, 0.03);
  //boomerangShapes.push(middle);
  middle.render();

  var top = new Pyramid();
  top.color = BONE_COLOR;
  top.matrix = new Matrix4(tempMatrix);
  top.matrix.translate(0.04, -0.13, 0);
  top.matrix.rotate(35, 0, 0, 1);
  top.matrix.scale(0.04, -0.15, 0.04);
  //boomerangShapes.push(top);
  top.render();

  var bot = new Pyramid();
  bot.color = BONE_COLOR;
  bot.matrix = new Matrix4(tempMatrix);
  bot.matrix.translate(0.02, 0.1, 0);
  bot.matrix.rotate(25, 0, 0, -1);
  bot.matrix.scale(0.03, 0.1, 0.03);
  //boomerangShapes.push(bot);
  bot.render();
}

let eyeScale = 0.07;
let armRotation1 = 10;
let armRotation2 = -20;
let boomerAngle = 0;
let boomerTrans = 0;
let fangRotation = 0;


function updateShapes(){
  if(g_faceAnim ){
    var animT = Math.cos(3 * g_seconds) + 1;
    if (animT <= 1){
      eyeScale = 0.07 * (animT);
    }else {
      fangRotation = 20 * (2 - animT);
    }
  }
  else {
    eyeScale = 0.07;
    fangRotation = 0;
  }

  if(g_boomerAnim){
    // some sin function to spread out the animation duration
    var animT = 2 * Math.sin(g_seconds + Math.PI/6) - 1;
    if (animT > 0){
      armRotation1 = 10 + animT * 30;
      armRotation2 = -20 + animT * 50;
      boomerTrans = 0; // hard code to account for lag
      boomerAngle = 0;
    }
    else {
      armRotation1 = 10;
      armRotation2 = -20;
      boomerAngle += 45;
      boomerTrans = 0.3 * animT;
    }
  }
  else{
    armRotation1 = 10;
    armRotation2 = -20;
    boomerAngle = 0;
    boomerTrans = 0;
  }
}
