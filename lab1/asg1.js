// SEE README file for additional sources used

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Const values
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Vars
let canvas;
let gl;
let vertexBuffer;
let a_Position;
let g_pointType = POINT;
let u_Size;
let g_pointSize = document.getElementById('shapesize').value;
let g_circleSegments = document.getElementById('numSegs').value;
let u_FragColor;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];



function setUpWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true,
                                  premultipliedAlpha: false,
                                  });
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }  

    // Create a buffer object
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    
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

  // Get the storage location of a_Position
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (u_Size < 0) {
    console.log('Failed to get the storage location of size');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

}

function addUI() {
  // clear button
  document.getElementById('clear').onclick = clearPoints; // clear button connects to clearPoints function

  // shape buttons
  document.getElementById('square').onclick = function() { g_pointType = POINT; };
  document.getElementById('triangle').onclick = function() { g_pointType = TRIANGLE; };
  document.getElementById('circle').onclick = function() { g_pointType = CIRCLE; };

  // color sliders
  document.getElementById('rcolor').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('gcolor').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('bcolor').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById('setColor').onclick = setColor;

  // alpha slider
  document.getElementById('alpha').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });
  // size sliders
  document.getElementById('shapesize').addEventListener('mouseup', function() { g_pointSize = this.value; });
  //circle segs
  document.getElementById('numSegs').addEventListener('mouseup', function() { g_circleSegments = this.value; });
}

function setColor(){ // set rgb values using text field instead of sliders
  g_selectedColor[0] = document.getElementById('rtext').value/100;
  g_selectedColor[1] = document.getElementById('gtext').value/100;
  g_selectedColor[2] = document.getElementById('btext').value/100;
}


function main() {
  // set up WebGL context, shaders, etc.
  setUpWebGL();
  connectVariablesToGLSL();

  addUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // Register function to be called on mousemove as well
  canvas.onmousemove = function(ev){
    if(ev.buttons == 1){
      click(ev);
    } 
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapeList = []; // The array to store the shapes
//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];   // The array to store the sizes of a point

function click(ev) {
  // extract coords from event ev and convert the coords
  [x,y] = convertCoords(ev);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);
  // Store the color to g_colors array
  //g_colors.push([g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], 1.0]);
  // Store the point size to g_sizes array
  //g_sizes.push(g_pointSize);

  //let p = new Point("point", [x,y], g_selectedColor.slice(), g_pointSize);
  let shape;
  if (g_pointType == POINT) {
    shape = new Point();
  } else if (g_pointType == TRIANGLE){
    shape = new Triangle();
  } else if (g_pointType ==  CIRCLE){
    shape = new Circle();
  }

  shape.position = [x,y];
  shape.color = g_selectedColor.slice();
  shape.size = g_pointSize;
  g_shapeList.push(shape);
  if (shape.type == 'Circle'){
    shape.segments = g_circleSegments;
  }

  // clear the canvas and then draw all shapes 
  renderAllShapes();
}

// convert the onscreen click to WebGL coordinates
function convertCoords(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function renderAllShapes(){
  // check time at start of function
  //var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) { // iterate through all of the points to draw
    g_shapeList[i].render();
  }

  //var duration = performance.now() - startTime;
}

function clearPoints(){
  // empty the shapesList array
  g_shapeList = [];
  
  // redraw the new empty canvas
  renderAllShapes();
}