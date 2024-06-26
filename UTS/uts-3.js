"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 12;
	
var colorUniformLocation;
var angle = 0;
var angleInRadians = 0;
var matrix;
var modelMatrix;
var viewMatrix;
var projectionMatrix;
var mMatrixLocation;
var vMatrixLocation;
var pMatrixLocation;
var cameraPosition = 0;

var hydroAngle = 60;
var hydroAngleInRadians = 0;

var letterbuffer;
var colorBuffer;

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if(!gl) alert("WebGL 2.0 isn't available");
	
    //
    // Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	// Let WebGL renders front-facing object
	gl.enable(gl.CULL_FACE);
	// Let WebGL stores z-value
	gl.enable(gl.DEPTH_TEST);
	
	//
	// Prepare buffers
	//
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    letterbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, letterbuffer);
	
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	
    // Associate out shader variables with our data buffer
    var colorLocation = gl.getAttribLocation(program, "a_color");
	gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray(colorLocation);
	
	//
	// Prepare MVP matrix
	//
	mMatrixLocation = gl.getUniformLocation(program, "m_matrix");
	
	vMatrixLocation = gl.getUniformLocation(program, "v_matrix");
    gl.uniformMatrix4fv(vMatrixLocation, false, m4.xrotation(toRadian(5))); // Lift the camera up
	
	pMatrixLocation = gl.getUniformLocation(program, "p_matrix");
	// Use orthographic projection
	projectionMatrix = m4.orthographic(-canvas.width/2, canvas.width/2, -canvas.height/2, canvas.height/2, -512, 512);
    gl.uniformMatrix4fv(pMatrixLocation, false, m4.transpose(projectionMatrix));
	
	let camPos = document.getElementById("cam-pos");
	document.addEventListener("keydown", event => {
		switch(event.code){
			case "Digit0":
				cameraPosition = 0;
				gl.uniformMatrix4fv(vMatrixLocation, false, m4.xrotation(toRadian(5)));
				camPos.innerText = "Default";
				break;
			case "Digit1":
				cameraPosition = 1;
				camPos.innerText = "Oksigen";
				break;
			case "Digit2":
				cameraPosition = 2;
				camPos.innerText = "Hidrogen-1";
				break;
			case "Digit3":
				cameraPosition = 3;
				camPos.innerText = "Hidrogen-2";
				break;
			default:
				break;
		}
	});
	
	
	document.getElementById("default").addEventListener("click", () => {
		cameraPosition = 0;
		gl.uniformMatrix4fv(vMatrixLocation, false, m4.xrotation(toRadian(5)));
		camPos.innerText = "Default";
	});	
	document.getElementById("oksigen").addEventListener("click", () => {
		cameraPosition = 1;
		camPos.innerText = "Oksigen";
	});
	document.getElementById("hidrogen-1").addEventListener("click", () => {
		cameraPosition = 2;
		camPos.innerText = "Hidrogen-1";
	});	
	document.getElementById("hidrogen-2").addEventListener("click", () => {
		cameraPosition = 3;
		camPos.innerText = "Hidrogen-2";
	});	

	//
	// Rendering
	// 
	primitiveType = gl.TRIANGLES;
	render();
}

function render(){
	// Rotate model counter-clockwise by y-axis
	angle += 2;
	if(360 < angle){
		angle = 2;
		hydroAngle += -30;
		if(hydroAngle < 0) hydroAngle = 330;
	}
	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	drawOxygen();
	drawHydrogen1();
	drawHydrogen2();
	
	requestAnimationFrame(render); // Refresh
}

function drawOxygen(){
	count = 36; // Number of vertices
	angleInRadians = toRadian(angle);

	modelMatrix = m4.identity();
	modelMatrix = m4.multiply(modelMatrix, m4.yrotation(angleInRadians));
	
	if(cameraPosition == 1){
		// No other transformation other than y-rotation, the view matrix is identity matrix
		gl.uniformMatrix4fv(vMatrixLocation, false, m4.identity());
	}

	// Set geometry (cube) and color
	setGeometry(gl, 1);
	setColors(gl, 1);
	
    // Set the model matrix.
    gl.uniformMatrix4fv(mMatrixLocation, false, m4.transpose(modelMatrix));

	gl.drawArrays(primitiveType, offset, count);
}

function drawHydrogen1(){
	count = 18; //number of vertices
	angleInRadians = toRadian(angle);
	hydroAngleInRadians = toRadian(hydroAngle);
	
	modelMatrix = m4.identity();
	modelMatrix = m4.multiply(modelMatrix, m4.zrotation(-hydroAngleInRadians)); // Re-rotate z-rotation effect from before
	modelMatrix = m4.multiply(modelMatrix, m4.xrotation(-angleInRadians));      // Re-rotate x-rotation effect from before
	modelMatrix = m4.multiply(modelMatrix, m4.translation(0, 150, 0));          // Move the model up
	modelMatrix = m4.multiply(modelMatrix, m4.xrotation(angleInRadians));       // Rotate front first with respect to the oxygen
	modelMatrix = m4.multiply(modelMatrix, m4.zrotation(hydroAngleInRadians));  // Rotate clockwise after one x-rotation
	modelMatrix = m4.multiply(modelMatrix, m4.yrotation(angleInRadians));       // Rotate the model by y-axis
	
	if(cameraPosition == 2){
		// Invert the model matrix, without y-rotation
		viewMatrix = m4.identity();
		viewMatrix = m4.multiply(viewMatrix, m4.zrotation(-hydroAngleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.xrotation(-angleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.translation(0, -150, 0));
		viewMatrix = m4.multiply(viewMatrix, m4.xrotation(angleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.zrotation(hydroAngleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.translation(0, 0, -256));
		gl.uniformMatrix4fv(vMatrixLocation, false, m4.transpose(viewMatrix));
	}

	// Set geometry (pyramid) and color
	setGeometry(gl, 2);
	setColors(gl, 2);
	
    // Set the model matrix.
    gl.uniformMatrix4fv(mMatrixLocation, false, m4.transpose(modelMatrix));

	gl.drawArrays(primitiveType, offset, count);
}

function drawHydrogen2(){
	count = 18; // Number of vertices
	angleInRadians = toRadian(angle);
	hydroAngleInRadians = toRadian(hydroAngle);
	
	modelMatrix = m4.identity();
	modelMatrix = m4.multiply(modelMatrix, m4.zrotation(hydroAngleInRadians));  // Re-rotate z-rotation effect from before
	modelMatrix = m4.multiply(modelMatrix, m4.xrotation(angleInRadians));       // Re-rotate x-rotation effect from before
	modelMatrix = m4.multiply(modelMatrix, m4.translation(0, 150, 0));          // Move the model up
	modelMatrix = m4.multiply(modelMatrix, m4.xrotation(-angleInRadians));      // Rotate front first with respect to the oxygen
	modelMatrix = m4.multiply(modelMatrix, m4.zrotation(-hydroAngleInRadians)); // Rotate counter-clockwise after one x-rotation
	modelMatrix = m4.multiply(modelMatrix, m4.yrotation(angleInRadians));       // Rotate the model by y-axis
	
	if(cameraPosition == 3){
		// Invert the model matrix, without y-rotation
		viewMatrix = m4.identity();
		viewMatrix = m4.multiply(viewMatrix, m4.zrotation(hydroAngleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.xrotation(angleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.translation(0, -150, 0));
		viewMatrix = m4.multiply(viewMatrix, m4.xrotation(-angleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.zrotation(-hydroAngleInRadians));
		viewMatrix = m4.multiply(viewMatrix, m4.translation(0, 0, -256));
		gl.uniformMatrix4fv(vMatrixLocation, false, m4.transpose(viewMatrix));
	}

	// Set geometry (pyramid) and color
	setGeometry(gl, 3);
	setColors(gl, 3);
	
    // Set the model matrix.
    gl.uniformMatrix4fv(mMatrixLocation, false, m4.transpose(modelMatrix));

	gl.drawArrays(primitiveType, offset, count);
}

// Setup 4x4 transformation matrix object
var m4 = { 	
	identity: function(){
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	},

	perspective: function(l, r, b, t, n, f){
		return [
			2 * n/(r - l),             0,  (r + l)/(r - l),                  0,
			            0, 2 * n/(t - b),  (t + b)/(t - b),                  0,
			            0,             0, -(f + n)/(f - n), -2 * f * n/(f - n),
			            0,             0,               -1,                  0
		];
	},
	
	orthographic: function(l, r, b, t, n, f){
		return [
			2/(r - l),         0,          0, -(r + l)/(r - l),
			        0, 2/(t - b),          0, -(t + b)/(t - b),
			        0,         0, -2/(f - n), -(f + n)/(f - n),
			        0,         0,          0,                1,
		];
	},

	translation: function(tx, ty, tz){
		return [
			1, 0, 0, tx,
			0, 1, 0, ty,
			0, 0, 1, tz,
			0, 0, 0, 1
		];
	},

	xrotation: function(angleInRadians){
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
		return [
			1, 0, 0, 0,
			0, c, s, 0,
			0,-s, c, 0,
			0, 0, 0, 1
		];
	},

	yrotation: function(angleInRadians){
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
		return [
			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1
		];
	},

	zrotation: function(angleInRadians){
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);
		return [
			 c, s, 0, 0,
			-s, c, 0, 0,
			 0, 0, 1, 0,
			 0, 0, 0, 1
		];
	},

	scaling: function(sx, sy, sz){
		return [
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1
		];
	},

	multiply: function(a, b){
		let res = [];
		for(let i = 0; i < 4; i++){
			for(let j = 0; j < 4; j++){
				let sum = 0;
				for(let k = 0; k < 4; k++){
					sum += a[i * 4 + k] * b[k * 4 + j];
				}
				res.push(sum);
			}
		}
		return res;
	},
	
	transpose: function(x){
		let res = [];
		for(let i = 0; i < 4; i++){
			for(let j = 0; j < 4; j++){
				res[i * 4 + j] = x[j * 4 + i];
			}
		}
		return res;
	}
};

function toRadian(angle){
	return angle * 2 * Math.PI/360;
}

function setGeometry(gl, shape){
    gl.bindBuffer(gl.ARRAY_BUFFER, letterbuffer);
    switch(shape){
	    case 1:                     // Fill the buffer with the values that define an oxygen (cube).
		    gl.bufferData(
			    gl.ARRAY_BUFFER,
			    new Float32Array([
				// front
				-60, -60, 60,
				60, -60, 60,
				-60, 60, 60,
				60, 60, 60,
				-60, 60, 60,
				60, -60, 60,

				// back
				-60, -60, -60,
				-60, 60, -60,
				60, -60, -60,
				60, 60, -60,
				60, -60, -60,
				-60, 60, -60,

				// top
				-60, 60, 60,
				60, 60, 60,
				-60, 60, -60,
				60, 60, -60,
				-60, 60, -60,
				60, 60, 60,
				
				// bottom
				-60, -60, 60,
				-60, -60, -60,
				60, -60, 60,
				60, -60, -60,
				60, -60, 60,
				-60, -60, -60,

				// right
				60, -60, 60,
				60, -60, -60,
				60, 60, 60,
				60, 60, -60,
				60, 60, 60,
				60, -60, -60,
				
				// left
				-60, -60, 60,
				-60, 60, 60,
				-60, -60, -60,
				-60, 60, -60,
				-60, -60, -60,
				-60, 60, 60,
	     		]),
			    gl.STATIC_DRAW);
			break;
		case 2:                     // Fill the buffer with the values that define a hydrogen-1 (pyramid, 10 o'clock direction).
		    gl.bufferData(
			    gl.ARRAY_BUFFER,
			    new Float32Array([
				// base
				-20, -20, 20,
				-20, -20, -20,
				20, -20, 20,
				20, -20, -20,
				20, -20, 20,
				-20, -20, -20,

				// front
				-20, -20, 20,
				20, -20, 20,
				0, 20, 0,
				
				// back
				-20, -20, -20,
				0, 20, 0,
				20, -20, -20,

				// right
				20, -20, 20,
				20, -20, -20,
				0, 20, 0,
				
				// left
				-20, -20, 20,
				0, 20, 0,
				-20, -20, -20,
	     		]),
			    gl.STATIC_DRAW);
			break;
		case 3:                     // Fill the buffer with the values that define a hydrogen-2 (pyramid, 2 o'clock direction).
		    gl.bufferData(
			    gl.ARRAY_BUFFER,
			    new Float32Array([
				// base
				-20, -20, 20,
				-20, -20, -20,
				20, -20, 20,
				20, -20, -20,
				20, -20, 20,
				-20, -20, -20,

				// front
				-20, -20, 20,
				20, -20, 20,
				0, 20, 0,
				
				// back
				-20, -20, -20,
				0, 20, 0,
				20, -20, -20,

				// right
				20, -20, 20,
				20, -20, -20,
				0, 20, 0,
				
				// left
				-20, -20, 20,
				0, 20, 0,
				-20, -20, -20,
	     		]),
			    gl.STATIC_DRAW);
			break;
    }
}

function setColors(gl, shape) {
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	switch(shape){
		case 1: // Fill the buffer with colors for the oxygen (cube).
		// Color palette: https://www.schemecolor.com/special-friends.php
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Uint8Array([
				// front (levender blue)
				197, 198, 255,
				197, 198, 255,
				197, 198, 255,
				197, 198, 255,
				197, 198, 255,
				197, 198, 255,

				// back (aero blue)
				210, 248, 221,
				210, 248, 221,
				210, 248, 221,
				210, 248, 221,
				210, 248, 221,
				210, 248, 221,
				
				// top (winter wizard)
				161, 230, 253,
				161, 230, 253,
				161, 230, 253,
				161, 230, 253,
				161, 230, 253,
				161, 230, 253,

				// bottom (blond)
				254, 244, 190,
				254, 244, 190,
				254, 244, 190,
				254, 244, 190,
				254, 244, 190,
				254, 244, 190,

				// right (floral white)
				255, 249, 243,
				255, 249, 243,
				255, 249, 243,
				255, 249, 243,
				255, 249, 243,
				255, 249, 243,

				// left (champagne pink)
				247, 223, 213,
				247, 223, 213,
				247, 223, 213,
				247, 223, 213,
				247, 223, 213,
				247, 223, 213,
				]),
				gl.STATIC_DRAW);
			break;
		case 2: // Fill the buffer with colors for the hydrogen-1 (pyramid).
			// Color palette: https://www.schemecolor.com/wandering.php
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Uint8Array([
				// base (flavescent)
				251, 238, 148,
				251, 238, 148,
				251, 238, 148,
				251, 238, 148,
				251, 238, 148,
				251, 238, 148,

				// front (blue yonder)
				75, 103, 179,
				75, 103, 179,
				75, 103, 179,
				
				// back (dark slate blue),
				73, 56, 149,
				73, 56, 149,
				73, 56, 149,

				// right (eton blue)
				145, 210, 150,
				145, 210, 150,
				145, 210, 150,

				// left (ocean green)
				80, 186, 144,
				80, 186, 144,
				80, 186, 144,
				]),
				gl.STATIC_DRAW);
			break;
		case 3: // Fill the buffer with colors for the hydrogen-2 (pyramid).
			// Color palette: https://www.schemecolor.com/endless-quest.php
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Uint8Array([
				// base (pale taupe)
				199, 148, 129,
				199, 148, 129,
				199, 148, 129,
				199, 148, 129,
				199, 148, 129,
				199, 148, 129,

				// front (bazaar)
				145, 109, 125,
				145, 109, 125,
				145, 109, 125,

				// back (english violet)
				81, 70, 96,
				81, 70, 96,
				81, 70, 96,

				// right (myrtle green)
				38, 110, 110,
				38, 110, 110,
				38, 110, 110,

				// left (oxley)
				122, 160, 129,
				122, 160, 129,
				122, 160, 129,
				]),
				gl.STATIC_DRAW);
	}
}