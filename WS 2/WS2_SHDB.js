var canvas;
var gl;
var program;
var animationEnabled = true;

// Buffers
var positionBuffer;
var normalBuffer;
var colorBuffer;
var indexBuffer;

// Uniforms
var lightColorLocation;
var lightPositionLocation;
var viewPositionLocation;
var pMatrixLocation;
var vMatrixLocation;
var mMatrixLocation;
var transposeInvModelMatrixLocation;	

function initWebGl(){
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl2");
    if(!gl) alert("WebGL 2.0 isn't available");

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.5, 0.9, 1.0);
	
	gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
}

function configure(){
	// Configure
	configureUniforms();
	configureBuffers();
	configureLight();
	configureCamera();
	configureProjection();
	
	Horse.configureEventListeners();
	Swing.configureEventListeners();
	
	document.getElementById("animation-enabled").addEventListener("input", () => animationEnabled = !animationEnabled);
}

function configureUniforms(){
	// Initialize uniform variable's location
	lightColorLocation = gl.getUniformLocation(program, "lightColor");
	lightPositionLocation = gl.getUniformLocation(program, "lightPosition");
	
	viewPositionLocation = gl.getUniformLocation(program, "viewPosition");
	
	pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
	vMatrixLocation = gl.getUniformLocation(program, "vMatrix");
	mMatrixLocation = gl.getUniformLocation(program, "mMatrix");
	transposeInvModelMatrixLocation = gl.getUniformLocation(program, "transposeInvModelMatrix");
}

function configureBuffers(){
	// Position
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	// Normal vector
	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	
	const vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
	
	// Color (will be normalized)
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	
	const vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.enableVertexAttribArray(vColor);
	
	// Index
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}

function configureLight(){
	// Light configurations
	gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
	gl.uniform3fv(lightPositionLocation, [Lamp.translations.x, Lamp.translations.y, Lamp.translations.z]);
	
	document.getElementById("xLightSlider").addEventListener("input", function(){ Lamp.translations.x = document.getElementById("xLightValue").innerText = this.value; });
	document.getElementById("yLightSlider").addEventListener("input", function(){ Lamp.translations.y = document.getElementById("yLightValue").innerText = this.value; });
	document.getElementById("zLightSlider").addEventListener("input", function(){ Lamp.translations.z = document.getElementById("zLightValue").innerText = this.value; });
	
	// Update light's/lamp's position from input
	document.querySelectorAll("#light-menu input[type='range']").forEach(function(input){
		input.addEventListener("input", () => {
			gl.uniform3fv(lightPositionLocation, [Lamp.translations.x, Lamp.translations.y, Lamp.translations.z]);
		})
	});
}

function configureCamera(){
	// View configurations
	const cameraPosition = [0, 100, 100];
	const upVector = [0, 1, 0];
	const targetPosition = [0, 0, 0];
	
	const cameraMatrix = m4.lookAt(cameraPosition, targetPosition, upVector);
	
	const viewMatrix = m4.inverse(cameraMatrix);
	gl.uniformMatrix4fv(vMatrixLocation, false, viewMatrix);
	
	gl.uniform3fv(viewPositionLocation, cameraPosition);
	
	document.getElementById("xCameraSlider").addEventListener("input", function(){ cameraPosition[0] = document.getElementById("xCameraValue").innerText = this.value; });
	document.getElementById("yCameraSlider").addEventListener("input", function(){ cameraPosition[1] = document.getElementById("yCameraValue").innerText = this.value; });
	document.getElementById("zCameraSlider").addEventListener("input", function(){ cameraPosition[2] = document.getElementById("zCameraValue").innerText = this.value; });
	
	// Update camera's position from input
	document.querySelectorAll("#camera-menu input[type='range']").forEach(function(input){
		input.addEventListener("input", () => {
			const cameraMatrix = m4.lookAt(cameraPosition, targetPosition, upVector);
			
			const viewMatrix = m4.inverse(cameraMatrix);
			gl.uniformMatrix4fv(vMatrixLocation, false, viewMatrix);
			
			gl.uniform3fv(viewPositionLocation, cameraPosition);
		})
	});
}

function configureProjection(){
	// Projection matrix configurations
	const fovRadians = degToRad(60);
    const aspect = canvas.width/canvas.height;
    const zNear = 1;
    const zFar = 1000;
	
	const projectionMatrix = m4.perspective(fovRadians, aspect, zNear, zFar); // Setup perspective viewing volume
	
	gl.uniformMatrix4fv(pMatrixLocation, false, projectionMatrix);
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Animation
	if(animationEnabled){
		Horse.animate();
		Swing.animate();
	}
	
	// Start drawing
	Lamp.draw(0);
	Land.draw(0);
	Horse.draw(0);
	Swing.draw(0);
	
	requestAnimationFrame(render);
}

function init(){
	initWebGl();
	configure();
	
	// Load models by parsing obj file written on HTML file
	Lamp.load("lamp");
	Land.load("land");
	Horse.load("horse");
	Swing.load("swing");
	
	render();
}

window.onload = init