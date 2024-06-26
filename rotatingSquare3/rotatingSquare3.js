"use strict";

var gl;

var theta = 0.0;
var thetaLoc;
var colorLoc;
var colors = [
	[215, 30, 34],
	[29, 60, 233],
	[27, 145, 62],
	[255, 99, 212],
	[255, 141, 28],
	[255, 255, 103],
	[74, 86, 94],
	[233, 247, 255],
	[120, 61, 210],
	[128, 88, 45],
	[68, 255, 247],
	[91, 254, 75],
	[108, 43, 61],
	[255, 214, 236],
	[255, 255, 190],
	[131, 151, 167],
	[159, 153, 137],
	[236, 117, 120],
	[38, 166, 98],
	[97, 114, 24]
];
var chosenColor;

var speed = 100;
var direction = true;

init();

function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

	// Objek: Among Us crewmate
    var vertices = [
		// Badan
        vec2(-0.5  - 0.125,  1),
        vec2( 0.75 - 0.125,  1),
        vec2(-0.5  - 0.125, -0.75),
		
        vec2( 0.75 - 0.125,  1),
        vec2(-0.5  - 0.125, -0.75),
		vec2( 0.75 - 0.125, -0.75),
		
		// Tas
		vec2( 0.75 - 0.125,  0.25),
        vec2( 1    - 0.125,  0.25),
        vec2( 0.75 - 0.125, -0.5),
		
        vec2( 1    - 0.125,  0.25),
        vec2( 0.75 - 0.125, -0.5),
		vec2( 1    - 0.125, -0.5),
		
		// Kaki kanan
		vec2(-0.5  - 0.125, -0.5),
        vec2( 0    - 0.125, -0.5),
        vec2(-0.5  - 0.125, -1),
		
        vec2( 0    - 0.125, -0.5),
        vec2(-0.5  - 0.125, -1),
		vec2( 0    - 0.125, -1),
		
		// Kaki kiri
		vec2( 0.25 - 0.125, -0.5),
        vec2( 0.75 - 0.125, -0.5),
        vec2( 0.25 - 0.125, -1),
		
        vec2( 0.75 - 0.125, -0.5),
        vec2( 0.25 - 0.125, -1),
		vec2( 0.75 - 0.125, -1),

		// Kaca
		vec2(-0.75 - 0.125,  0.5),
        vec2(-0.25 - 0.125,  0.5),
        vec2(-0.75 - 0.125,  0),
		
        vec2(-0.25 - 0.125,  0.5),
        vec2(-0.75 - 0.125,  0),
		vec2(-0.25 - 0.125,  0)
    ];

	// Normalisasi warna agar berada dalam rentang [0, 1]
	colors = colors.map(color => color.map(x => x/256));
	chosenColor = colors[0];

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");
	// Dapatkan lokasi uniform bernama uColor dari shader
	colorLoc = gl.getUniformLocation(program, "uColor");

    // Initialize event handlers

    document.getElementById("slider").onchange = function(event) {
        speed = 100 - event.target.value;
    };
    document.getElementById("Direction").onclick = function (event) {
        direction = !direction;
    };

    document.getElementById("Controls").onclick = function( event) {
        switch(event.target.index) {
          case 0:
            direction = !direction;
            break;

         case 1:
            speed /= 2.0;
            break;

         case 2:
            speed *= 2.0;
            break;
       }
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case '1':
            direction = !direction;
            break;

          case '2':
            speed /= 2.0;
            break;

          case '3':
            speed *= 2.0;
            break;
        }
    };


    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
	// Apabila theta di luar rentang [0, 2 * pi],
	// maka ubah nilainya sehingga berada di dalam rentang dan ubah warna objek
	if(theta < 0 || 2 * Math.PI < theta){
		theta -= (theta < 0 ? -1 : 1) * 2 * Math.PI;
		chosenColor = colors[Math.floor(10 * Math.random())];
	}
    gl.uniform1f(thetaLoc, theta);
	gl.uniform3f(colorLoc, chosenColor[0], chosenColor[1], chosenColor[2]);

	// Banyak segitiga yang akan di-render = 30/3 = 10
    gl.drawArrays(gl.TRIANGLES, 0, 30);

    setTimeout(
        function () {requestAnimationFrame(render);},
        speed
    );
}
