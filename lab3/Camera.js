class Camera{
    constructor(){
        this.fov = 60;
        this.eye = new Vector3(0,0,0);
        this.at = new Vector3(0,0,-100);
        this.up = new Vector3(0,1,0);
        
        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
    }

    moveForward(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);

        this.eye.add(d.normalize());
        this.at.add(d);
      
        if (!inBounds(this.eye.elements)){ // check if move was legal
            this.eye.sub(d);
            this.at.sub(d);
        }
    }

    moveLeft(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);

        let c = Vector3.cross(d.normalize(), this.up);
        this.eye.sub(c);
        this.at.sub(c);
  
        if (!inBounds(this.eye.elements)){ // check if move was legal
            this.eye.add(c);
            this.at.add(c);
        }

    }

    moveBack(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);

        this.eye.sub(d.normalize());
        this.at.sub(d);
        
        if (!inBounds(this.eye.elements)){ // check if move was legal
            this.eye.add(d);
            this.at.add(d);
        }
    }

    moveRight(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);
        
        let c = Vector3.cross(d.normalize(), this.up);
        this.eye.add(c);
        this.at.add(c);
    
        if (!inBounds(this.eye.elements)){ // check if move was legal
            this.eye.sub(c);
            this.at.sub(c);
        }
    }

    panLeft(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);
        let r = d.magnitude();
        let theta = Math.atan(d.elements[0]/d.elements[2]);
      
        if(Math.round(theta * 180/Math.PI) == -90){
            rotate *= -1;
        }
        theta += 5 / 180 * Math.PI;
    
        let newD = new Vector3( [ r * Math.sin(theta) * rotate, 
                                  0, 
                                  r * Math.cos(theta) * rotate] );
    
        let theta2 = Math.atan(newD.elements[0]/newD.elements[2]);
    
        if(Math.round(theta * 180/Math.PI) != Math.round(theta2 * 180/Math.PI) && Math.round(theta2 * 180/Math.PI) != 90 
                                                                               && Math.round(theta2 * 180/Math.PI)!= -90){
            rotate *= -1;
        }
    
        this.at = new Vector3(this.eye.elements).sub(newD);
    }

    panRight(){
        let d = new Vector3(this.at.elements);   // d = at - eye
        d.sub(this.eye);
        let r = d.magnitude();
        let theta = Math.atan(d.elements[0]/d.elements[2]);
        if(Math.round(theta * 180/Math.PI) == 90){
            rotate *= -1;
        }
        theta -= 5 / 180 * Math.PI;
        let newD = new Vector3( [ r * Math.sin(theta) * rotate, 
                                  0, 
                                  r * Math.cos(theta) * rotate] );
        let theta2 = Math.atan(newD.elements[0]/newD.elements[2]);
        if(Math.round(theta * 180/Math.PI) != Math.round(theta2 * 180/Math.PI) && Math.round(theta2 * 180/Math.PI) != 90 
                                                                               && Math.round(theta2 * 180/Math.PI)!= -90){
            rotate *= -1;
        }
        this.at = new Vector3(this.eye.elements).sub(newD);
    }

    moveUp(){
        if(this.eye.elements[1] <= 3){
            this.eye.elements[1] += 1;
        }
    }

    moveDown(){
        if(this.eye.elements[1] >= 1){
            this.eye.elements[1] -= 1;
        }
    }

    updateView(){
        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
                                this.at.elements[0],  this.at.elements[1],  this.at.elements[2], 
                                this.up.elements[0],  this.up.elements[1],  this.up.elements[2]  );
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);
        this.projMat.setPerspective(this.fov, canvas.width/canvas.height, .1, 50); // (degrees wide, aspect ratio, near plane, far plane)
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projMat.elements);
    }
}