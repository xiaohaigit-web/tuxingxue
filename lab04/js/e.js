var canvas;
var gl;
var cBuffer;
var vBuffer;
var points = [],graph = []; 
var maxNumTriangles = 500;
var maxNumVertices = 3 * maxNumTriangles;
var posLoc, thetaLoc;
var cont;
var thetaforSquare = 0.0,thetaforCube = 0.0; 
var sur = [1.0, 1.0, 1.0];
var sLoc,side = 6,pointIndex = 0,translation = 0;
var steps = 0.001;
var color = [0.0, 0.0, 1.0, 1.0];
var vertices = [
    glMatrix.vec4.fromValues(-0.1, -0.1, 0.1, 1.0),
    glMatrix.vec4.fromValues(-0.1, 0.1, 0.1, 1.0),
    glMatrix.vec4.fromValues(0.1, 0.1, 0.1, 1.0),
    glMatrix.vec4.fromValues(0.1, -0.1, 0.1, 1.0),
    glMatrix.vec4.fromValues(-0.1, -0.1, -0.1, 1.0),
    glMatrix.vec4.fromValues(-0.1, 0.1, -0.1, 1.0),
    glMatrix.vec4.fromValues(0.1, 0.1, -0.1, 1.0),
    glMatrix.vec4.fromValues(0.1, -0.1, -0.1, 1.0),
];
var vertexColors = [
    glMatrix.vec4.fromValues(1.0, 0.0, 1.0, 1.0),  // magenta
    glMatrix.vec4.fromValues(0.0, 1.0, 1.0, 1.0),  // cyan
    glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0),  // blue
    glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0),  // black
    glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0),  // green
    glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0),  // red
    glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0),  // yellow
    glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0)   // white
];
var t = 0.05;
var trianglePoints = [
    0.0, 0.1, 0.0,
    -0.1, -0.1, 0.0,
    0.1, -0.1, 0.0
];
window.onload = function init(){
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    var program = initShaders(gl, "rtvshader", "rtfshader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    sLoc = gl.getUniformLocation(program, "s");
    posLoc = gl.getUniformLocation(program, "pos");

	document.getElementById("choice").onclick=function(event){
		var choice = parseInt(event.target.value);
        var x = document.getElementById("lineNum");
		cont = 0;
        x.style.display = "none";
	}
    document.getElementById("lineNum").onchange = function (event) {
        side = document.getElementById("lineNum").value;
    }
    
    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var nowpos_x = event.clientX - rect.left;
        var nowpos_y = event.clientY - rect.top;
        var pos_x = 2 * nowpos_x / canvas.width - 1;
        var pos_y = 2 * (canvas.height - nowpos_y) / canvas.height - 1;
        triangleCr(pos_x, pos_y);	
    });
    render();

}
function triangleCr(x, y){//
    points.push(x, y);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for (var i = 0; i < 3; i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), 
		new Float32Array(glMatrix.vec4.fromValues(trianglePoints[i * 3], 
		trianglePoints[i * 3 + 1], trianglePoints[i * 3 + 2], 1.0)))
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for (var i = 0; i < 3; i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (pointIndex + i), 
		new Float32Array(color));//
    }
    pointIndex += 3;
    graph.push(0);
};

function make_triangle(but){
    sur[0] = sur[1] = sur[2] += t;
    if (sur[0] < 0.5) t *= -1;
    else if (sur[0] > 2.0) t *= -1
    gl.uniform3fv(sLoc, sur);
    gl.uniform3fv(thetaLoc, [0.0, 0.0, 0.0]);
    gl.drawArrays(gl.TRIANGLES, but, 3);
}
function render(){
    var but = 0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < graph.length; i++){
        if (graph[i] == 3){
            translation += steps;
            if (translation > 0.1) steps *= -1;
            else if (translation < -0.1) steps *= -1;
            gl.uniform3fv(posLoc, [points[i*2] + translation + Math.random(), points[i * 2 + 1] + translation + Math.random(), 0.0]);
        } 
		else{
			gl.uniform3fv(posLoc, [points[i*2], points[i*2+1],0.0]);
		}
        if (graph[i] == 0){
            make_triangle(but);
            but += 3;
        } else if (graph[i] == 1){
            make_square(but);
            but += 6;
        } 
		else if (graph[i] == 2){
            make_cube(but);
            but += 12;
        } 
		else if (graph[i] == 3){
            make_circle(but);
            but += 24;
        }
    }
    requestAnimFrame(render);
}