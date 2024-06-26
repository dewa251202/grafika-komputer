"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 12;
	
var colorUniformLocation;
var translation = [200, 200]; //top-left of rectangle
var angle = 0;
var angleInRadians = 0;
var scale = [1.0,1.0]; //default scale
var matrix;
var matrixLocation;
var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var moveOriginMatrix; //move origin to 'center' of the letter as center of rotation
var projectionMatrix;

var movement = 1;
var currentposition = 0;
var scalefactor = 0.005;
var currentscale = 0.005;
var middlewidth = 0;
var rotType = 0;

var letterbuffer;
var colorBuffer;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
	
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    letterbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, letterbuffer);
	
    // Associate out shader variables with our data buffer
	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	
    // Associate out shader variables with our data buffer
	
    var colorLocation = gl.getAttribLocation(program, "a_color");
	gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray( colorLocation );
	
	matrixLocation = gl.getUniformLocation(program, "u_matrix");
    middlewidth = Math.floor(gl.canvas.width/2);

	primitiveType = gl.TRIANGLES;
	// setiap 3 detik, ubah tipe rotasi (antara x, y, z)
	setInterval(() => {
		rotType = (rotType + 1) % 3;
	}, 3000);
	render(); //default render
}

function render() 
{
	currentposition += movement;
	currentscale += scalefactor;
	
	if (currentposition > middlewidth) {
		currentposition = middlewidth;
		movement = -movement;
		
	}; 
	if (currentposition < 0) {
		currentposition = 0; 
		movement = -movement;
	}; 

	if (currentscale > 2){
		currentscale = 2.0;
		scalefactor = -scalefactor;
	};
	
	if (currentscale < 0.005){
		currentscale = 0.005;
		scalefactor = -scalefactor;
	};
	
	angle += 1.0;
	
    gl.clear( gl.COLOR_BUFFER_BIT |  gl.DEPTH_BUFFER_BIT );
	
	drawletterI();
	drawletterD();
	
	requestAnimationFrame(render); //refresh
	
}

function drawletterI() {
	count = 36; //number of vertices 
	translation = [middlewidth-130,gl.canvas.height/2-90];
	
	angleInRadians = (360 - angle) * Math.PI/180; //rotating counter clockwise

	setGeometry(gl,1);
	
	matrix = m4.identity();
	
	projectionMatrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
	translationMatrix = m4.translation(translation[0] - currentposition, translation[1]);
    rotationMatrix = m4.rotation(angleInRadians);
    scaleMatrix = m4.scaling(scale[0] + currentscale, scale[1]  + currentscale);
	moveOriginMatrix = m4.translation(-65, -90);
	
    // Multiply the matrices.
    matrix = m4.multiply(projectionMatrix, translationMatrix);
    matrix = m4.multiply(matrix, rotationMatrix);
	matrix = m4.multiply(matrix, scaleMatrix);
	matrix = m4.multiply(matrix, moveOriginMatrix);

	//set color
	setColors(gl, 1);
	
    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

	//gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( primitiveType, offset, count );
}

function drawletterD() {
	count = 144; //number of vertices 
	
	setGeometry(gl,2); 
	
	translation=[middlewidth+100,gl.canvas.height/2-90];
	
	angleInRadians = (angle * Math.PI/180); //rotating counter clockwise
    matrix = m4.identity();
	projectionMatrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
	translationMatrix = m4.translation(translation[0] + currentposition, translation[1]);
    rotationMatrix = m4.rotation(angleInRadians);
    scaleMatrix = m4.scaling(scale[0]  + currentscale, scale[1]  + currentscale);
	moveOriginMatrix = m4.translation(-50, -90);
	
    // Multiply the matrices.
    matrix = m4.multiply(projectionMatrix, translationMatrix);
    matrix = m4.multiply(matrix, rotationMatrix);
	matrix = m4.multiply(matrix, scaleMatrix);
	matrix = m4.multiply(matrix, moveOriginMatrix);

	//set color
	setColors(gl, 2);
	
    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

	//gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( primitiveType, offset, count );
	
	
}

var m4 = { 						//setup 3x3 transformation matrix object
   identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
	  0, 0, 0, 1
    ];
   },
   
   projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
	  0, 0, 2 / depth, 0,
      -1, 1, 0, 1
    ];
   },

  translation: function(tx, ty) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
	  0, 0, 1, 0,
      tx, ty, 0, 1
    ];
  },
  
  xrotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      1, 0, 0, 0,
      0, c,-s, 0,
      0, s, c, 0,
	  0, 0, 0, 1
    ];
  },
  
  yrotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, 0,-s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
	  0, 0, 0, 1
    ];
  },
  
  zrotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 1, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
	  0, 0, 0, 1
    ];
  },
  
  rotation: function(angleInRadians) {
	  switch(rotType){
		  case 0: return m4.xrotation(angleInRadians); break;
		  case 1: return m4.yrotation(angleInRadians); break;
		  case 2: return m4.zrotation(angleInRadians); break;
		  default: return m4.xrotation(angleInRadians); break;
	  }
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, 1, 0,
	  0, 0, 0, 1
    ];
  },

  multiply: function(a, b) {
    let res = [];
	for(let i = 0; i < 4; i++){
		for(let j = 0; j < 4; j++){
			let sum = 0;
			for(let k = 0; k < 4; k++){
				sum += b[i * 4 + k] * a[k * 4 + j];
			}
			res.push(sum);
		}
	}
	return res;
  },
};


function setGeometry(gl, shape) {
    gl.bindBuffer( gl.ARRAY_BUFFER, letterbuffer );
    switch (shape) {
	    case 1:                     // Fill the buffer with the values that define a letter 'I'.
		    gl.bufferData(
			    gl.ARRAY_BUFFER,
			    new Float32Array([
				    // column front
					0, 0, 15,
					30, 0, 15,
					0, 180, 15,
					0, 180, 15,
					30, 0, 15,
					30, 180, 15,

					// column back
					0, 0, -15,
					30, 0, -15,
					0, 180, -15,
					0, 180, -15,
					30, 0, -15,
					30, 180, -15,

					// top side
					0, 0, 15,
					0, 0, -15,
					30, 0, -15,
					30, 0, 15,
					0, 0, 15,
					30, 0, -15,

					// right side
					30, 0, 15,
					30, 180, -15,
					30, 180, 15,
					30, 0, -15,
					30, 180, -15,
					30, 0, 15,

					// bottom side
					0, 180, 15,
					30, 180, -15,
					0, 180, -15,
					30, 180, 15,
					30, 180, -15,
					0, 180, 15,
					
					// left side
					0, 0, 15,
					0, 180, 15,
					0, 180, -15,
					0, 0, -15,
					0, 0, 15,
					0, 180, -15,	
	     		]),
			    gl.STATIC_DRAW);
	    break;
	    case 2: 				// Fill the buffer with the values that define a letter 'D'.
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([
					// left column front
					0, 0, 15,
					30, 30, 15,
					0, 180, 15,
					30, 150, 15,
					0, 180, 15,
					30, 30, 15,

					// top front
					0, 0, 15,
					60, 0, 15,
					30, 30, 15,
					47.25, 30, 15,
					30, 30, 15,
					60, 0, 15,

					// top right front
					90, 60, 15,
					47.25, 30, 15,
					120, 45, 15,
					60, 0, 15,
					120, 45, 15,
					47.25, 30, 15,
					
					// right column front
					90, 120, 15,
					90, 60, 15,
					120, 135, 15,
					120, 45, 15,
					120, 135, 15,
					90, 60, 15,	 

					// bottom right front
					60, 180, 15,
					47.25, 150, 15,
					120, 135, 15,
					90, 120, 15,
					120, 135, 15,
					47.25, 150, 15,

					// bottom front
					0, 180, 15,
					30, 150, 15,
					60, 180, 15,
					47.25, 150, 15,
					60, 180, 15,
					30, 150, 15,
					
					// left column back
					0, 0, -15,
					30, 30, -15,
					0, 180, -15,
					30, 150, -15,
					0, 180, -15,
					30, 30, -15,

					// top back
					0, 0, -15,
					60, 0, -15,
					30, 30, -15,
					47.25, 30, -15,
					30, 30, -15,
					60, 0, -15,

					// top right back
					90, 60, -15,
					47.25, 30, -15,
					120, 45, -15,
					60, 0, -15,
					120, 45, -15,
					47.25, 30, -15,
					
					// right column back
					90, 120, -15,
					90, 60, -15,
					120, 135, -15,
					120, 45, -15,
					120, 135, -15,
					90, 60, -15,	 

					// bottom right back
					60, 180, -15,
					47.25, 150, -15,
					120, 135, -15,
					90, 120, -15,
					120, 135, -15,
					47.25, 150, -15,

					// bottom back
					0, 180, -15,
					30, 150, -15,
					60, 180, -15,
					47.25, 150, -15,
					60, 180, -15,
					30, 150, -15,
					
					// left column side out
					0, 0, 15,
					0, 180, 15,
					0, 180, -15,
					0, 0, -15,
					0, 0, 15,
					0, 180, -15,
					
					// top side out
					0, 180, 15,
					60, 180, 15,
					60, 180, -15,
					0, 180, -15,
					0, 180, 15,
					60, 180, -15,
					
					// top right side out
					60, 180, 15,
					120, 135, 15,
					120, 135, -15,
					60, 180, -15,
					60, 180, 15,
					120, 135, -15,
					
					// right column side out
					120, 135, 15,
					120, 45, 15,
					120, 45, -15,
					120, 135, -15,
					120, 135, 15,
					120, 45, -15,
					
					// bottom right side out
					120, 45, 15,
					60, 0, 15,
					60, 0, -15,
					120, 45, -15,
					120, 45, 15,
					60, 0, -15,
					
					// bottom side out
					60, 0, 15,
					0, 0, 15,
					0, 0, -15,
					60, 0, -15,
					60, 0, 15,
					0, 0, -15,
					
					// left column side in
					30, 30, 15,
					30, 150, 15,
					30, 150, -15,
					30, 30, -15,
					30, 30, 15,
					30, 150, -15,
					
					// top side in
					30, 150, 15,
					47.25, 150, 15,
					47.25, 150, -15,
					30, 150, -15,
					30, 150, 15,
					47.25, 150, -15,
					
					// top right side in
					47.25, 150, 15,
					90, 120, 15,
					90, 120, -15,
					47.25, 150, -15,
					47.25, 150, 15,
					90, 120, -15,
					
					// right column side in
					90, 120, 15,
					90, 60, 15,
					90, 60, -15,
					90, 120, -15,
					90, 120, 15,
					90, 60, -15,
					
					// bottom right side in
					90, 60, 15,
					47.25, 30, 15,
					47.25, 30, -15,
					90, 60, -15,
					90, 60, 15,
					47.25, 30, -15,
					
					// bottom side in
					47.25, 30, 15,
					30, 30, 15,
					30, 30, -15,
					47.25, 30, -15,
					47.25, 30, 15,
					30, 30, -15
				]),
				gl.STATIC_DRAW);
		break;
    }
}

function setColors(gl, shape) {
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
	switch(shape){
		case 1: // Fill the buffer with colors for the 'I'.
		gl.bufferData(
		  gl.ARRAY_BUFFER,
		  new Uint8Array([
			// column front
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,

			// column back
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// top side
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,

			// right side
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// bottom side
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// left side
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220
		  ]),
		  gl.STATIC_DRAW);
		break;
	    case 2: // Fill the buffer with colors for the 'D'.
		gl.bufferData(
		  gl.ARRAY_BUFFER,
		  new Uint8Array([
			// column left front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// top front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// top right front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// column right front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// bottom right front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// bottom front
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,

			// column left back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// top back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// top right back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// column right back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// bottom right back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,

			// bottom back
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			
			// column left side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// top side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// top right side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// column right side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// bottom right side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,

			// bottom side out
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			
			// column left side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// top side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// top right side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// column right side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// bottom right side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,

			// bottom side in
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			]),
		gl.STATIC_DRAW);
		break;
	}
}