class Sphere{
  
  constructor(){
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureType = -2;
    this.speckle = 1.0; // has speckle by default
    this.verts = instantiateVerts();
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

    drawSphereNormal(this.verts);
  }

}



function drawSphere(vertices){
  //console.log(vertices);
  var n = 1200; // The number of vertices
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  //draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawSphereNormal(vertices){
  //console.log(vertices);
  var n = 1200; // The number of vertices
  
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

function instantiateVerts(){ //instantiate vertices for sphere
  var d = Math.PI/10;
  var dd = Math.PI/10;

  vertices = [];

  for (var t = 0; t < Math.PI; t += d) {
    for (var r = 0; r < 2 * Math.PI; r += d) {
      var p1 = [Math.sin(t) * Math.cos(r), 
                Math.sin(t) * Math.sin(r),
                Math.cos(t)];

      var p2 = [Math.sin(t + dd) * Math.cos(r), 
                Math.sin(t + dd) * Math.sin(r),
                Math.cos(t + dd)];

      var p3 = [Math.sin(t) * Math.cos(r + dd), 
                Math.sin(t) * Math.sin(r + dd),
                Math.cos(t)];

      var p4 = [Math.sin(t + dd) * Math.cos(r + dd), 
                Math.sin(t + dd) * Math.sin(r + dd),
                Math.cos(t + dd)];

      vertices = vertices.concat(p1);
      vertices = vertices.concat(p1); // concat point twice to include the normal
      vertices = vertices.concat(p2);
      vertices = vertices.concat(p2);
      vertices = vertices.concat(p4);
      vertices = vertices.concat(p4);

      vertices = vertices.concat(p1);
      vertices = vertices.concat(p1); // concat the normals
      vertices = vertices.concat(p4);
      vertices = vertices.concat(p4);
      vertices = vertices.concat(p3);
      vertices = vertices.concat(p3);
    }
  }
  return vertices; // note that for spheres, the positions also refer to the norm
}