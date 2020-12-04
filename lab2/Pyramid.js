class Pyramid{
    
    constructor(){
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render(){
        // Pass the color to u_FragColor variable
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // front face
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D( [-0.5, -0.5, -0.5,  0, 0.5, 0,   0.5, -0.5, -0.5] );

        // left face
        gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
        drawTriangle3D( [-0.5, -0.5, 0.5,   0, 0.5, 0,   -0.5, -0.5, -0.5] );

        //back face
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        drawTriangle3D( [0.5, -0.5, 0.5,   0, 0.5, 0,   -0.5, -0.5, 0.5] );

        // right face
        gl.uniform4f(u_FragColor, rgba[0]*.65, rgba[1]*.65, rgba[2]*.65, rgba[3]);
        drawTriangle3D( [0.5, -0.5, -0.5,   0, 0.5, 0,   0.5, -0.5, 0.5] );
        
        // bottom face
        gl.uniform4f(u_FragColor, rgba[0]*.3, rgba[1]*.3, rgba[2]*.3, rgba[3]);
        drawCubeFace( [-0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   0.5, -0.5, -0.5, -0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,   0.5, -0.5, 0.5] )
        //drawTriangle3D( [-0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   0.5, -0.5, -0.5] );
        //drawTriangle3D( [-0.5, -0.5, -0.5,   -0.5, -0.5, 0.5,   0.5, -0.5, 0.5] );
    }
}