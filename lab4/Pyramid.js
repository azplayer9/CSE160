class Pyramid{
    
  constructor(){
    this.type = 'pyramid';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureType = -3;
    this.speckle = 0.0; // no speckle by default
  }

  verts = [
    // front face
   -.5, -.5, -.5,       0, .5, -1,
     0,  .5,   0,       0, .5, -1,
    .5, -.5, -.5,       0, .5, -1,
    // left face 
   -.5, -.5,  .5,       -1, .5, 0,
     0,  .5,   0,       -1, .5, 0,
   -.5, -.5, -.5,       -1, .5, 0,
    // back face
    .5, -.5,  .5,       0, .5, 1,
     0,  .5,   0,       0, .5, 1,
   -.5, -.5,  .5,       0, .5, 1,
    // right face
    .5, -.5, -.5,       1, .5, 0,
     0,  .5,   0,       1, .5, 0,
    .5, -.5,  .5,       1, .5, 0,
        
    // bottom face (2 triangles) 
   -.5, -.5, -.5,       0, -1, 0,
    .5, -.5,  .5,       0, -1, 0,
    .5, -.5, -.5,       0, -1, 0,

   -.5, -.5, -.5,       0, -1, 0,
   -.5, -.5,  .5,       0, -1, 0,
    .5, -.5,  .5,       0, -1, 0,
  ];

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
          
    drawPyramidNormal(this.verts);
  }
}

function drawPyramid(vertices){
  var n = 18; // The number of vertices
    
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawPyramidNormal(vertices){
  var n = 18; // The number of vertices
    
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}