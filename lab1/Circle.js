class Circle{
    
    constructor(){
      this.type = 'Circle';
      this.position = [0.0, 0.0, 0.0, 0.0]
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 20;
      this.segments = 10;
    }

    render(){
        //var xy = g_points[i];   // get the x,y coordinates as an array of (x, y)
        //var rgba = g_colors[i]; // get the color as an array of (r, g, b, a)
        //var size = g_sizes[i]; // get the size from the g_sizes
        
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var d = size/300.0;
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        let angleStep = 360/this.segments;
        for(var angle = 0; angle < 360; angle += angleStep){
            let center = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle1 + angleStep;
            let vec1 = [ Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d ];
            let vec2 = [ Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d ];
            let pt1 = [ center[0] + vec1[0], center[1] + vec1[1]];
            let pt2 = [ center[0] + vec2[0], center[1] + vec2[1]];
            // Draw
            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1] ]);
        }
        
      }
}