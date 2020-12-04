//global variables
var scale = 20;
var ctx, v1, v2, v3, v4;

function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG <- (2)
    ctx = canvas.getContext('2d');

    // instantiate vectors to 0
    v1 = new Vector3([0, 0, 0]);
    v2 = new Vector3([0, 0, 0]);
    v3 = new Vector3([0, 0, 0]);
    v4 = new Vector3([0, 0, 0]);

    // draw black canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);
}

function drawVector(v, color) { // draws vector v using string color in the origin.
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + v.elements[0] * scale, 200 - v.elements[1] * scale); // create line endpoint based on input vector
    ctx.strokeStyle = color;    // change color of line
    ctx.stroke();
}

function handleDrawEvent() { // clear the canvas, use textbox values to draw v1
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    var x1 = document.getElementById("v1x").value;
    var y1 = document.getElementById("v1y").value;

    var x2 = document.getElementById("v2x").value;
    var y2 = document.getElementById("v2y").value;

    v1 = new Vector3([x1, y1, 0]);
    v2 = new Vector3([x2, y2, 0]);
    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() { // clear the canvas, get dropdown operation, do operation
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);
    
    // make sure vectors are updated properly
    handleDrawEvent();

    // read operation
    op = document.getElementById("op").value;
    sca = document.getElementById("scalar").value;
    
    // reset v3 and v4 to avoid redrawing old vectors
    v3 = new Vector3([0, 0, 0]);
    v4 = new Vector3([0, 0, 0]);

    if (op == "add"){
        v3 = v1.add(v2);
    } else if (op == "sub"){
        v3 = v1.sub(v2);
    } else if (op == "mul"){
        v3 = v1.mul(sca);
        v4 = v2.mul(sca);
    } else if (op == "div"){
        v3 = v1.div(sca);
        v4 = v2.div(sca);
    } else if (op == "mag"){
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    } else if (op == "nor"){
        v3 = v1.normalize();
        v4 = v2.normalize();
    } else if (op == "ang"){
        console.log("Angle: " + angleBetween(v1, v2));
    } else if (op == "area"){
        console.log("Area of the Triangle: " + areaTriangle(v1, v2));
    }
    
    // draw v3, v4 in green
    drawVector(v3, "green");
    drawVector(v4, "green");
}

function angleBetween(v1, v2){ // returns the measure of the angle between v1 and v2
    var vdot = Vector3.dot(v1, v2);
    var prod = v1.magnitude()*v2.magnitude();
    var rad = Math.acos(vdot / prod);
    return rad * 180 / Math.PI;
}

function areaTriangle(v1, v2){ // returns the measure of the angle between v1 and v2
    v3 = Vector3.cross(v1, v2);
    return v3.magnitude() / 2; // remember to divide by 2 because its a triangle not a parallelogram
}