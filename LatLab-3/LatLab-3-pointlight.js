"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 180;
	

var angleCam = 0;
var angleFOV = 60;
var fRotationRadians = [0, 0, 0];

var matrix;

var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var projectionMatrix;
var cameraMatrix;
var viewMatrix;
var viewProjectionMatrix;

var worldViewProjectionMatrix;
var worldInverseTransposeMatrix;
var worldInverseMatrix;
var worldMatrix;

var FOV_Radians; //field of view
var aspect; //projection aspect ratio
var zNear; //near view volume
var zFar;  //far view volume

var cameraPosition = [100, 150, 200]; //eye/camera coordinates
var UpVector = [0, 1, 0]; //up vector
var fPosition = [0, 35, 0]; //at 


var worldViewProjectionLocation;
var worldInverseTransposeLocation;
var colorLocation;
var lightWorldPositionLocation;
var worldLocation;

window.onload = function init()
{

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	
	gl.enable(gl.CULL_FACE); //enable depth buffer
	gl.enable(gl.DEPTH_TEST);

	//initial default

    FOV_Radians = degToRad(60);
    aspect = canvas.width / canvas.height;
    zNear = 1;
    zFar = 2000;
	
	projectionMatrix = m4.perspective(FOV_Radians, aspect, zNear, zFar); //setup perspective viewing volume
	
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	
	worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
	colorLocation = gl.getUniformLocation(program, "u_color");
	lightWorldPositionLocation =  gl.getUniformLocation(program, "u_lightWorldPosition");
	worldLocation =  gl.getUniformLocation(program, "u_world");
	
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );

    var positionLocation = gl.getAttribLocation( program, "a_position" );
    gl.vertexAttribPointer( positionLocation, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLocation );


	setGeometry(gl);	
	
	
	var normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
	
    // Associate out shader variables with our data buffer
	
    var normalLocation = gl.getAttribLocation(program, "a_normal");
	gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray( normalLocation );

	setNormals(gl);
	
	//update FOV
	var xAngleCamValue = document.getElementById("xCameravalue");
	xAngleCamValue.innerHTML = angleCam;
	document.getElementById("xSliderCam").oninput = function(event) {		
	    xAngleCamValue.innerHTML = event.target.value;
		fRotationRadians[0] = degToRad(event.target.value);
		render();
    };
	var yAngleCamValue = document.getElementById("yCameravalue");
	yAngleCamValue.innerHTML = angleCam;
	document.getElementById("ySliderCam").oninput = function(event) {		
	    yAngleCamValue.innerHTML = event.target.value;
		fRotationRadians[1] = degToRad(event.target.value);
		render();
    };
	var zAngleCamValue = document.getElementById("zCameravalue");
	zAngleCamValue.innerHTML = angleCam;
	document.getElementById("zSliderCam").oninput = function(event) {		
	    zAngleCamValue.innerHTML = event.target.value;
		fRotationRadians[2] = degToRad(event.target.value);
		render();
    };
	
	primitiveType = gl.TRIANGLES;
	render(); //default render
}

function render() 
{
    // Compute the camera's matrix using look at.
    cameraMatrix = m4.lookAt(cameraPosition, fPosition, UpVector);

    // Make a view matrix from the camera matrix
    viewMatrix = m4.inverse(cameraMatrix);
	
	// Compute a view projection matrix
	viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    worldMatrix = m4.xRotation(fRotationRadians[0]);
    worldMatrix = m4.yRotate(worldMatrix, fRotationRadians[1]);
    worldMatrix = m4.zRotate(worldMatrix, fRotationRadians[2]);

    // Multiply the matrices.
    worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    worldInverseMatrix = m4.inverse(worldMatrix);
    worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
	gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
	
    // Set the color to use
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

    // set the light direction.
    gl.uniform3fv(lightWorldPositionLocation, [20, 30, 60]);
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.drawArrays( primitiveType, offset, count );

}

function radToDeg(r) {
    return r * 180 / Math.PI;
  }

function degToRad(d) {
    return d * Math.PI / 180;
  }


// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
   var positions =
      new Float32Array([
		// column front
		0, 0, -15,
		0, 180, -15,
		30, 0, -15,
		0, 180, -15,
		30, 180, -15,
		30, 0, -15,
		
		// column back
		0, 0, 15,
		30, 0, 15,
		0, 180, 15,
		0, 180, 15,
		30, 0, 15,
		30, 180, 15,

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

		// Letter D
		// left column front
		60, 0, -15,
		60, 180, -15,
		90, 30, -15,
		90, 150, -15,
		90, 30, -15,
		60, 180, -15,

		// top front
		60, 0, -15,
		90, 30, -15,
		120, 0, -15,
		107.25, 30, -15,
		120, 0, -15,
		90, 30, -15,

		// top right front
		150, 60, -15,
		180, 45, -15,
		107.25, 30, -15,
		120, 0, -15,
		107.25, 30, -15,
		180, 45, -15,
		
		// right column front
		150, 120, -15,
		180, 135, -15,
		150, 60, -15,
		180, 45, -15,
		150, 60, -15,	 
		180, 135, -15,

		// bottom right front
		120, 180, -15,
		180, 135, -15,
		107.25, 150, -15,
		150, 120, -15,
		107.25, 150, -15,
		180, 135, -15,

		// bottom front
		60, 180, -15,
		120, 180, -15,
		90, 150, -15,
		107.25, 150, -15,
		90, 150, -15,
		120, 180, -15,
		
		// left column back
		60, 0, 15,
		90, 30, 15,
		60, 180, 15,
		90, 150, 15,
		60, 180, 15,
		90, 30, 15,

		// top back
		60, 0, 15,
		120, 0, 15,
		90, 30, 15,
		107.25, 30, 15,
		90, 30, 15,
		120, 0, 15,

		// top right back
		150, 60, 15,
		107.25, 30, 15,
		180, 45, 15,
		120, 0, 15,
		180, 45, 15,
		107.25, 30, 15,
		
		// right column back
		150, 120, 15,
		150, 60, 15,
		180, 135, 15,
		180, 45, 15,
		180, 135, 15,
		150, 60, 15,	 

		// bottom right back
		120, 180, 15,
		107.25, 150, 15,
		180, 135, 15,
		150, 120, 15,
		180, 135, 15,
		107.25, 150, 15,

		// bottom back
		60, 180, 15,
		90, 150, 15,
		120, 180, 15,
		107.25, 150, 15,
		120, 180, 15,
		90, 150, 15,
		
		// left column side out
		60, 0, 15,
		60, 180, 15,
		60, 180, -15,
		60, 0, -15,
		60, 0, 15,
		60, 180, -15,
		
		// top side out
		60, 0, 15,
		120, 0, -15,
		120, 0, 15,
		60, 0, -15,
		120, 0, -15,
		60, 0, 15,
		
		// top right side out
		120, 0, 15,
		180, 45, -15,
		180, 45, 15,
		120, 0, -15,
		180, 45, -15,
		120, 0, 15,
		
		// right column side out
		180, 135, 15,
		180, 45, 15,
		180, 45, -15,
		180, 135, -15,
		180, 135, 15,
		180, 45, -15,
		
		// bottom right side out
		180, 135, 15,
		120, 180, -15,
		120, 180, 15,
		180, 135, -15,
		120, 180, -15,
		180, 135, 15,
		
		// bottom side out
		120, 180, 15,
		60, 180, -15,
		60, 180, 15,
		120, 180, -15,
		60, 180, -15,
		120, 180, 15,
		
		// left column side in
		90, 30, 15,
		90, 150, -15,
		90, 150, 15,
		90, 30, -15,
		90, 150, -15,
		90, 30, 15,
		
		// top side in
		90, 30, 15,
		107.25, 30, 15,
		107.25, 30, -15,
		90, 30, -15,
		90, 30, 15,
		107.25, 30, -15,
		
		// top right side in
		107.25, 30, 15,
		150, 60, 15,
		150, 60, -15,
		107.25, 30, -15,
		107.25, 30, 15,
		150, 60, -15,
		
		// right column side in
		150, 120, 15,
		150, 60, -15,
		150, 60, 15,
		150, 120, -15,
		150, 60, -15,
		150, 120, 15,
		
		// bottom right side in
		150, 120, 15,
		107.25, 150, 15,
		107.25, 150, -15,
		150, 120, -15,
		150, 120, 15,
		107.25, 150, -15,
		
		// bottom side in
		107.25, 150, 15,
		90, 150, 15,
		90, 150, -15,
		107.25, 150, -15,
		107.25, 150, 15,
		90, 150, -15,]);

  // Center the ID around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above 
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = m4.xRotation(Math.PI),
  matrix = m4.translate(matrix, -100, -75, -15);

  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }
   gl.bufferData(gl.ARRAY_BUFFER,  positions,   gl.STATIC_DRAW);
}

function setNormals(gl) {
  var normals = new Float32Array([
		  // Letter I
          // front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

          // back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          // top
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          // right
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
		  
          // bottom
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          // left
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
		  
		  // Letter D
		  // left column front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // top front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // top right front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // right column front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // bottom right front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // bottom front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
		  
		  // left column back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // top back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // top right back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // right column back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // bottom right back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // bottom back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
		  
		  // Letter D (outside)
		  // left column side out
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		
		  // top side out
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  
		  // top right side out (unit vector orthogonal with (60, -45, 0))
		  0.6, 0.8, 0,
		  0.6, 0.8, 0,
		  0.6, 0.8, 0,
		  0.6, 0.8, 0,
		  0.6, 0.8, 0,
		  0.6, 0.8, 0,
		
		  // right column side out
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		
		  // bottom right side out (unit vector orthogonal with (60, 45, 0))
		  0.6, -0.8, 0,
		  0.6, -0.8, 0,
		  0.6, -0.8, 0,
		  0.6, -0.8, 0,
		  0.6, -0.8, 0,
		  0.6, -0.8, 0,
		
		  // bottom side out
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  
		  // Letter D (inside), negate all component with outside 
		  // left column side in
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		  1, 0, 0,
		
		  // top side in
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  0, -1, 0,
		  		  
		  // top right side in
		  -0.6, -0.8, 0,
		  -0.6, -0.8, 0,
		  -0.6, -0.8, 0,
		  -0.6, -0.8, 0,
		  -0.6, -0.8, 0,
		  -0.6, -0.8, 0,
		
		  // right column side in
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		  -1, 0, 0,
		
		  // bottom right side in
		  -0.6, 0.8, 0,
		  -0.6, 0.8, 0,
		  -0.6, 0.8, 0,
		  -0.6, 0.8, 0,
		  -0.6, 0.8, 0,
		  -0.6, 0.8, 0,
		
		  // bottom side in
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,
		  0, 1, 0,]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
