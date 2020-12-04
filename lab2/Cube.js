class Cube{

  constructor(){
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render(){
      // Pass the color to u_FragColor variable
      var rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
      // front face
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      drawCubeFace( [-0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, -0.5, -0.5, -0.5, -0.5, -0.5,   -0.5, 0.5, -0.5,   0.5, 0.5, -0.5] );
      //drawTriangle3D( [-0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, -0.5, -0.5] );
      //drawTriangle3D( [-0.5, -0.5, -0.5,   -0.5, 0.5, -0.5,   0.5, 0.5, -0.5] );

      // left face
      gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
      drawCubeFace( [-0.5, -0.5, 0.5,   -0.5, 0.5, -0.5,  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5,   -0.5, 0.5,  0.5,  -0.5, 0.5, -0.5] );
      //drawTriangle3D( [-0.5, -0.5, 0.5,   -0.5, 0.5, -0.5,  -0.5, -0.5, -0.5] );
      //drawTriangle3D( [-0.5, -0.5, 0.5,   -0.5, 0.5,  0.5,  -0.5, 0.5, -0.5] );
      
      // top face
      // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      drawCubeFace( [-0.5, 0.5, -0.5,   0.5, 0.5, 0.5,   0.5, 0.5, -0.5, -0.5, 0.5, -0.5,   -0.5, 0.5, 0.5,   0.5, 0.5, 0.5] );
      //drawTriangle3D( [-0.5, 0.5, -0.5,   0.5, 0.5, 0.5,   0.5, 0.5, -0.5] );
      //drawTriangle3D( [-0.5, 0.5, -0.5,   -0.5, 0.5, 0.5,   0.5, 0.5, 0.5] );

      //back face
      gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
      drawCubeFace( [0.5, -0.5, 0.5,   -0.5, 0.5, 0.5,   -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,   0.5, 0.5, 0.5,   -0.5, 0.5, 0.5] );
      //drawTriangle3D( [0.5, -0.5, 0.5,   -0.5, 0.5, 0.5,   -0.5, -0.5, 0.5] );
      //drawTriangle3D( [0.5, -0.5, 0.5,   0.5, 0.5, 0.5,   -0.5, 0.5, 0.5] );

      // right face
      gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
      drawCubeFace( [0.5, -0.5, -0.5,   0.5, 0.5, 0.5,   0.5, -0.5, 0.5, 0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, 0.5, 0.5] );
      //drawTriangle3D( [0.5, -0.5, -0.5,   0.5, 0.5, 0.5,   0.5, -0.5, 0.5] );
      //drawTriangle3D( [0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, 0.5, 0.5] );
        
      // bottom face
      //gl.uniform4f(u_FragColor, rgba[0]*.3, rgba[1]*.3, rgba[2]*.3, rgba[3]);
      drawCubeFace( [-0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   0.5, -0.5, -0.5, -0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,   0.5, -0.5, 0.5] );
      //drawTriangle3D( [-0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   0.5, -0.5, -0.5] );
      //drawTriangle3D( [-0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,   0.5, -0.5, 0.5] );
 
     
  }
}

function drawCubeFace(vertices) {
  var n = 6; // The number of vertices

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}