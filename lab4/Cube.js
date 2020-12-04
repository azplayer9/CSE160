class Cube{

  verts = [
    // vertices     
    //front
   -0.5, -0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5, -0.5, -0.5,
   -0.5, -0.5, -0.5,
   -0.5,  0.5, -0.5,
    0.5,  0.5, -0.5,
      
    //left
   -0.5, -0.5,  0.5,
   -0.5,  0.5, -0.5,
   -0.5, -0.5, -0.5,
   -0.5, -0.5,  0.5,
   -0.5,  0.5,  0.5,
   -0.5,  0.5, -0.5,

    //top
   -0.5,  0.5, -0.5,
    0.5,  0.5,  0.5,
    0.5,  0.5, -0.5,
   -0.5,  0.5, -0.5,
   -0.5,  0.5,  0.5,
    0.5,  0.5,  0.5,

    //back
    0.5, -0.5,  0.5,
   -0.5,  0.5,  0.5,
   -0.5, -0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5,  0.5,
   -0.5,  0.5,  0.5,
      
    //right
    0.5, -0.5, -0.5,
    0.5,  0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5, -0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5,  0.5,  0.5,
    
    //bot
   -0.5, -0.5, -0.5,
    0.5, -0.5,  0.5,
    0.5, -0.5, -0.5,
   -0.5, -0.5, -0.5,
   -0.5, -0.5,  0.5,
    0.5, -0.5,  0.5,
  ];

  vertsUV = [
    // vertices          UV
    //front
   -0.5, -0.5, -0.5,    0, 0,
    0.5,  0.5, -0.5,    1, 1,
    0.5, -0.5, -0.5,    1, 0,
   -0.5, -0.5, -0.5,    0, 0,
   -0.5,  0.5, -0.5,    0, 1,
    0.5,  0.5, -0.5,    1, 1,
      
    //left
   -0.5, -0.5,  0.5,    0, 0,
   -0.5,  0.5, -0.5,    1, 1,
   -0.5, -0.5, -0.5,    1, 0,
   -0.5, -0.5,  0.5,    0, 0,
   -0.5,  0.5,  0.5,    0, 1,
   -0.5,  0.5, -0.5,    1, 1,

    //top
   -0.5,  0.5, -0.5,    0, 0,
    0.5,  0.5,  0.5,    1, 1,
    0.5,  0.5, -0.5,    1, 0,
   -0.5,  0.5, -0.5,    0, 0,
   -0.5,  0.5,  0.5,    0, 1,
    0.5,  0.5,  0.5,    1, 1,

    //back
    0.5, -0.5,  0.5,    0, 0,
   -0.5,  0.5,  0.5,    1, 1,
   -0.5, -0.5,  0.5,    1, 0,
    0.5, -0.5,  0.5,    0, 0,
    0.5,  0.5,  0.5,    0, 1,
   -0.5,  0.5,  0.5,    1, 1,
      
    //right
    0.5, -0.5, -0.5,    0, 0,
    0.5,  0.5,  0.5,    1, 1,
    0.5, -0.5,  0.5,    1, 0,
    0.5, -0.5, -0.5,    0, 0,
    0.5,  0.5, -0.5,    0, 1,
    0.5,  0.5,  0.5,    1, 1,
    
    //bot
   -0.5, -0.5, -0.5,    0, 0,
    0.5, -0.5,  0.5,    1, 1,
    0.5, -0.5, -0.5,    1, 0,
   -0.5, -0.5, -0.5,    0, 0,
   -0.5, -0.5,  0.5,    0, 1,
    0.5, -0.5,  0.5,    1, 1,
  ];
  

  vertsNorm = [
    // vertices     
    //front
   -0.5, -0.5, -0.5,    0,  0, -1,
    0.5,  0.5, -0.5,    0,  0, -1,
    0.5, -0.5, -0.5,    0,  0, -1,
   -0.5, -0.5, -0.5,    0,  0, -1,
   -0.5,  0.5, -0.5,    0,  0, -1,
    0.5,  0.5, -0.5,    0,  0, -1,
      
    //left
   -0.5, -0.5,  0.5,   -1,  0,  0,
   -0.5,  0.5, -0.5,   -1,  0,  0,
   -0.5, -0.5, -0.5,   -1,  0,  0,
   -0.5, -0.5,  0.5,   -1,  0,  0,
   -0.5,  0.5,  0.5,   -1,  0,  0,
   -0.5,  0.5, -0.5,   -1,  0,  0,

    //top
   -0.5,  0.5, -0.5,    0,  1,  0,
    0.5,  0.5,  0.5,    0,  1,  0,
    0.5,  0.5, -0.5,    0,  1,  0,
   -0.5,  0.5, -0.5,    0,  1,  0,
   -0.5,  0.5,  0.5,    0,  1,  0,
    0.5,  0.5,  0.5,    0,  1,  0,

    //back
    0.5, -0.5,  0.5,    0,  0,  1,
   -0.5,  0.5,  0.5,    0,  0,  1,
   -0.5, -0.5,  0.5,    0,  0,  1,
    0.5, -0.5,  0.5,    0,  0,  1,
    0.5,  0.5,  0.5,    0,  0,  1,
   -0.5,  0.5,  0.5,    0,  0,  1,
      
    //right
    0.5, -0.5, -0.5,    1,  0,  0,
    0.5,  0.5,  0.5,    1,  0,  0,
    0.5, -0.5,  0.5,    1,  0,  0,
    0.5, -0.5, -0.5,    1,  0,  0,
    0.5,  0.5, -0.5,    1,  0,  0,
    0.5,  0.5,  0.5,    1,  0,  0,
    
    //bot
   -0.5, -0.5, -0.5,    0, -1,  0,
    0.5, -0.5,  0.5,    0, -1,  0,
    0.5, -0.5, -0.5,    0, -1,  0,
   -0.5, -0.5, -0.5,    0, -1,  0,
   -0.5, -0.5,  0.5,    0, -1,  0,
    0.5, -0.5,  0.5,    0, -1,  0,
  ];

  constructor(){
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureType = -3;
    this.speckle = 0.0; // no speckle by default
  }
  
  render(){
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    this.normalMatrix.setInverseOf(this.matrix).transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
            
    if(!renderNorm){
      // Pass the color to u_FragColor variable
      var rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 
      this.textureType = -2;
    }
    else{ 
      this.textureType = -3;
    }
    
    gl.uniform1i(u_TextureType, this.textureType);
    gl.uniform1f(u_Speckle, this.speckle);

    drawCubeNormal(this.vertsNorm);
  }
}

function drawCube(vertices) {
  var n = 36; // The number of vertices
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawCubeNormal(vertices) { 
  var n = 36; // The number of vertices
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE);


  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Normal);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawCubeUV(vertices) { // draw cube(this.verts, [0,0, 0,1, 1,1, 1,0])
  var n = 36; // The number of vertices

  //gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  //gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FLOAT_SIZE, 0);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * FLOAT_SIZE, 3 * FLOAT_SIZE);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  // // Write data into the buffer object
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  // // Assign the buffer object to a_Position variable
  // gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  // // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}