class Triangle{
    
    constructor(){
      this.type = 'Triangle';
      this.position = [0.0, 0.0, 0.0, 0.0]
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 20;
    }
  
     // render shape
    render(){
      //var xy = g_points[i];   // get the x,y coordinates as an array of (x, y)
      //var rgba = g_colors[i]; // get the color as an array of (r, g, b, a)
      //var size = g_sizes[i]; // get the size from the g_sizes
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
      var del = size/200.0;
  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size to the u_Size variable
      gl.uniform1f(u_Size, size);
      // Draw
      drawTriangle( [xy[0], xy[1], xy[0] + del, xy[1], xy[0] + del/2, xy[1] + (del/2 * Math.sqrt(3))] );
    }
  }
function drawTriangle(vertices) {
    //var vertices = new Float32Array([
    //    0, 0.5,   -0.5, -0.5,   0.5, -0.5
    // ]);
    var n = 3; // The number of vertices
    
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //   console.log('Failed to get the storage location of a_Position');
    //   return -1;
    // }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    //draw triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
}