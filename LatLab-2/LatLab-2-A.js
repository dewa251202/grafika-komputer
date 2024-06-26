"use strict";

var canvas;
var gl;

// Model yang dibuat adalah
// 4 limas segiempat yang saling berhimpit pada alasnya
// ditambah 1 limas segiempat yang berada di atas 4 limas

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = [0, 0, 0];
var thetaLoc;
var flag = true;
// Setiap limas segiempat membutuhkan 4 segitiga untuk sisi tegak dan 2 segitiga untuk sisi alas = 6 segitiga
// Setiap segitiga memiliki 3 titik sudut
// Banyak limas adalah 5 buah
var numElements = 6 * 3 * 5;

// Banyak vertex posisi adalah 9 (alas) + 4 (tengah) + 1 (puncak) = 14 vertex
// Alas berada pada bidang xy
var vertices = [
	// alas
	vec3(-1.0, -1.0, -1.0), // 0
	vec3(-0.0, -1.0, -1.0), // 1
	vec3( 1.0, -1.0, -1.0), // 2
	vec3(-1.0,  0.0, -1.0), // 3
	vec3(-0.0,  0.0, -1.0), // 4
	vec3( 1.0,  0.0, -1.0), // 5
	vec3(-1.0,  1.0, -1.0), // 6
	vec3(-0.0,  1.0, -1.0), // 7
	vec3( 1.0,  1.0, -1.0), // 8
	
	// tengah
	vec3(-0.5, -0.5,  0.0), // 9
	vec3( 0.5, -0.5,  0.0), // 10
	vec3(-0.5,  0.5,  0.0), // 11
	vec3( 0.5,  0.5,  0.0), // 12
	
	// puncak
	vec3( 0.0,  0.0,  1.0)  // 13
];

var vertexColors = [
	vec4(0.0, 0.0, 0.0, 1.0),  // black, 0
	vec4(1.0, 0.0, 0.0, 1.0),  // red, 1
	vec4(1.0, 1.0, 0.0, 1.0),  // yellow, 2
	vec4(0.0, 1.0, 0.0, 1.0),  // green, 3
	vec4(0.0, 0.0, 1.0, 1.0),  // blue, 4
	vec4(1.0, 0.0, 1.0, 1.0),  // magenta, 5
	vec4(1.0, 1.0, 1.0, 1.0),  // white, 6
	vec4(0.0, 1.0, 1.0, 1.0),  // cyan, 7
	vec4(0.0, 0.0, 0.0, 1.0),  // black, 8
	vec4(1.0, 0.0, 0.0, 1.0),  // red, 9
	vec4(1.0, 1.0, 0.0, 1.0),  // yellow, 10
	vec4(0.0, 1.0, 0.0, 1.0),  // green, 11
	vec4(0.0, 0.0, 1.0, 1.0),  // blue, 12
	vec4(1.0, 0.0, 1.0, 1.0)   // magenta, 13
];

// indices of the 30 triangles that compise the cube

var indices = [
	// limas alas kuadran 2
     0,  1,  3,
     4,  3,  1,
     0,  3,  9,
     3,  4,  9,
     4,  1,  9,
     1,  0,  9,
	
	// limas alas kuadran 1
     1,  2,  4,
     5,  4,  2,
     1,  4, 10,
     4,  5, 10,
     5,  2, 10,
     2,  1, 10,
	
	// limas alas kuadran 3
	 3,  4,  6,
     7,  6,  4,
     3,  6, 11,
     6,  7, 11,
     7,  4, 11,
     4,  3, 11,
	
	// limas alas kuadran 4
 	 4,  5,  7,
     8,  7,  5,
     4,  7, 12,
     7,  8, 12,
     8,  5, 12,
     5,  4, 12,
	
	// limas atas
	 9, 10, 11,
    12, 11, 10,
     9, 11, 13,
    11, 12, 13,
    12, 10, 13,
    10, 11, 13
];

init();

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

	// Scale setiap vertex pada model menjadi setengah untuk menghindari clipping dengan bidang gambar
	vertices = vertices.map(vertex => vertex.map(pos => pos/2));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // array element buffer

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(render);
}
