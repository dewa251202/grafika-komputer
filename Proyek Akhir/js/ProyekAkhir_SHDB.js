var canvas;
var gl;
var mainProgram;
var lampProgram;
var shadowProgram;
const centers = [
	[ 1.0,  0.0,  0.0], //positive x
	[-1.0,  0.0,  0.0], //negative x
	[ 0.0,  1.0,  0.0], //positive y
	[ 0.0, -1.0,  0.0], //negative y
	[ 0.0,  0.0,  1.0], //positive z
	[ 0.0,  0.0, -1.0], //negative z
]
const upVectors = [
	[0.0, -1.0,  0.0], //positive x
	[0.0, -1.0,  0.0], //negative x
	[0.0,  0.0,  1.0], //positive y
	[0.0,  0.0, -1.0], //negative y
	[0.0, -1.0,  0.0], //positive z
	[0.0, -1.0,  0.0], //negative z
]

// Camera
var cameraPosition;
var eyeVector;
var upVector;
var generalCameraPosition;
var isHorseCamera;
var tiltAngle;
var turnAngle;

// Others
var animationEnabled;
var primitiveType;
var isRenderingShadow;

// Buffers
var positionBuffer;
var normalBuffer;
var textureCoordBuffer;
var indexBuffer;
var shadowFrameBuffer;

async function initWebGl(){
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl2");
    if(!gl) alert("WebGL 2.0 isn't available");

    // Configure WebGL
	const html = document.getElementsByTagName("html")[0];
	canvas.width = html.clientWidth;
	canvas.height = html.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.5, 0.9, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

    // Load shaders
	mainProgram = await initShadersFromUrl(gl, "shader/main.vs", "shader/main.fs");
	lampProgram = await initShadersFromUrl(gl, "shader/lamp.vs", "shader/lamp.fs");
	shadowProgram = await initShadersFromUrl(gl, "shader/shadow.vs", "shader/shadow.fs");

    gl.useProgram(mainProgram);
}

function configure(){
	// Configure
	configureUniforms();
	configureBuffers();
	configureLight();
	configureCamera();
	configureProjection();
	configureEventListeners();
}

function configureUniforms(){
	// Initialize uniform variable's location
	mainProgram.materialDiffuseUniform = gl.getUniformLocation(mainProgram, "material.diffuse"); 
	mainProgram.materialSpecularUniform = gl.getUniformLocation(mainProgram, "material.specular"); 
	mainProgram.materialShininessUniform = gl.getUniformLocation(mainProgram, "material.shininess");
	
	mainProgram.dirLightDirectionUniform = gl.getUniformLocation(mainProgram, "dirLight.direction");
	mainProgram.dirLightAmbientUniform = gl.getUniformLocation(mainProgram, "dirLight.ambient");
	mainProgram.dirLightDiffuseUniform = gl.getUniformLocation(mainProgram, "dirLight.diffuse");
	mainProgram.dirLightSpecularUniform = gl.getUniformLocation(mainProgram, "dirLight.specular");
	
	mainProgram.pointLightPositionUniform = gl.getUniformLocation(mainProgram, "pointLight.position");
	mainProgram.pointLightAmbientUniform = gl.getUniformLocation(mainProgram, "pointLight.ambient");
	mainProgram.pointLightDiffuseUniform = gl.getUniformLocation(mainProgram, "pointLight.diffuse");
	mainProgram.pointLightSpecularUniform = gl.getUniformLocation(mainProgram, "pointLight.specular");
	mainProgram.pointLightConstantUniform = gl.getUniformLocation(mainProgram, "pointLight.constant");
	mainProgram.pointLightLinearUniform = gl.getUniformLocation(mainProgram, "pointLight.linear");
	mainProgram.pointLightQuadraticUniform = gl.getUniformLocation(mainProgram, "pointLight.quadratic");
	
	mainProgram.spotLightPositionUniform = gl.getUniformLocation(mainProgram, "spotLight.position");
	mainProgram.spotLightDirectionUniform = gl.getUniformLocation(mainProgram, "spotLight.direction");
	mainProgram.spotLightCutoffUniform = gl.getUniformLocation(mainProgram, "spotLight.cutoff");
	mainProgram.spotLightOuterCutoffUniform = gl.getUniformLocation(mainProgram, "spotLight.outerCutoff");
	mainProgram.spotLightAmbientUniform = gl.getUniformLocation(mainProgram, "spotLight.ambient");
	mainProgram.spotLightDiffuseUniform = gl.getUniformLocation(mainProgram, "spotLight.diffuse");
	mainProgram.spotLightSpecularUniform = gl.getUniformLocation(mainProgram, "spotLight.specular");
	mainProgram.spotLightConstantUniform = gl.getUniformLocation(mainProgram, "spotLight.constant");
	mainProgram.spotLightLinearUniform = gl.getUniformLocation(mainProgram, "spotLight.linear");
	mainProgram.spotLightQuadraticUniform = gl.getUniformLocation(mainProgram, "spotLight.quadratic");
	
	mainProgram.viewPositionUniform = gl.getUniformLocation(mainProgram, "viewPosition");
	mainProgram.farPlaneUniform = gl.getUniformLocation(mainProgram, "farPlane");
	
	mainProgram.pMatrixUniform = gl.getUniformLocation(mainProgram, "pMatrix");
	mainProgram.vMatrixUniform = gl.getUniformLocation(mainProgram, "vMatrix");
	mainProgram.mMatrixUniform = gl.getUniformLocation(mainProgram, "mMatrix");
	
	lampProgram.pMatrixUniform = gl.getUniformLocation(lampProgram, "pMatrix");
	lampProgram.vMatrixUniform = gl.getUniformLocation(lampProgram, "vMatrix");
	lampProgram.mMatrixUniform = gl.getUniformLocation(lampProgram, "mMatrix");
	
	shadowProgram.mvMatrixUniform = gl.getUniformLocation(shadowProgram, "mvMatrix");
	shadowProgram.pMatrixUniform = gl.getUniformLocation(shadowProgram, "pMatrix");
	shadowProgram.pointLightPositionUniform = gl.getUniformLocation(shadowProgram, "pointLightPosition");
	shadowProgram.farPlaneUniform = gl.getUniformLocation(shadowProgram, "farPlane");
	
	mainProgram.shadowSamplerUniform = gl.getUniformLocation(mainProgram, "shadowSampler");
}

function configureBuffers(){
	// Position buffer
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	mainProgram.vPosition = gl.getAttribLocation(mainProgram, "vPosition");
    gl.vertexAttribPointer(lampProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(lampProgram.vPosition);
	
	lampProgram.vPosition = gl.getAttribLocation(lampProgram, "vPosition");
    gl.vertexAttribPointer(lampProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(lampProgram.vPosition);
	
	shadowProgram.vPosition = gl.getAttribLocation(shadowProgram, "vPosition");
    gl.vertexAttribPointer(shadowProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowProgram.vPosition);
	
	// Normal vector buffer
	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	
	mainProgram.vNormal = gl.getAttribLocation(mainProgram, "vNormal");
    gl.vertexAttribPointer(mainProgram.vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(mainProgram.vNormal);

	// Texture coordinate buffer
	textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	
	mainProgram.vTextureCoord = gl.getAttribLocation(mainProgram, "vTextureCoord");
    gl.vertexAttribPointer(mainProgram.vTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(mainProgram.vTextureCoord);
	
	// Index buffer
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	
	// Shadow frame buffer
	shadowFrameBuffer = createFrameBufferObject(512, 512);
}

function createFrameBufferObject(width, height){
	const frameBuffer = gl.createFramebuffer();
	const depthBuffer = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthBuffer);
	for(let i = 0; i < 6; i++){
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, width, height, 0,gl.RGBA, gl.UNSIGNED_BYTE, null);
	}
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	frameBuffer.depthBuffer = depthBuffer;
	frameBuffer.width = width;
	frameBuffer.height = height;

	return frameBuffer;
}

function configureLight(){
	// Light configurations
	gl.uniform3fv(mainProgram.dirLightDirectionUniform, [0.0, -1.0, 0.0]);
	gl.uniform3fv(mainProgram.dirLightAmbientUniform, [0.5, 0.5, 0.5]);
	gl.uniform3fv(mainProgram.dirLightDiffuseUniform, [0.3, 0.3, 0.3]);
	gl.uniform3fv(mainProgram.dirLightSpecularUniform, [0.3, 0.3, 0.3]);
	
	gl.uniform3fv(mainProgram.pointLightPositionUniform, [PointLight.translations.x, PointLight.translations.y, PointLight.translations.z]);
	gl.uniform3fv(mainProgram.pointLightAmbientUniform, [1.0, 1.0, 1.0]);
	gl.uniform3fv(mainProgram.pointLightDiffuseUniform, [0.8, 0.8, 0.8]);
	gl.uniform3fv(mainProgram.pointLightSpecularUniform, [0.9, 0.9, 0.9]);
	gl.uniform1f(mainProgram.pointLightConstantUniform, 1.0);
	gl.uniform1f(mainProgram.pointLightLinearUniform, 0.045);
	gl.uniform1f(mainProgram.pointLightQuadraticUniform, 0.0075);
	
	gl.uniform3fv(mainProgram.spotLightPositionUniform, [0, 51, 100]);
	gl.uniform3fv(mainProgram.spotLightDirectionUniform, [0, 0, -1]);
	gl.uniform1f(mainProgram.spotLightCutoffUniform, Math.cos(degToRad(25)));
	gl.uniform1f(mainProgram.spotLightOuterCutoffUniform, Math.cos(degToRad(35)));
	gl.uniform3fv(mainProgram.spotLightAmbientUniform, [1.0, 1.0, 1.0]);
	gl.uniform3fv(mainProgram.spotLightDiffuseUniform, [0.5, 0.5, 0.5]);
	gl.uniform3fv(mainProgram.spotLightSpecularUniform, [0.5, 0.5, 0.5]);
	gl.uniform1f(mainProgram.spotLightConstantUniform, 1.0);
	gl.uniform1f(mainProgram.spotLightLinearUniform, 0.045);
	gl.uniform1f(mainProgram.spotLightQuadraticUniform, 0.0075);
	
	document.getElementById("point-light-x").addEventListener("input", function(){ PointLight.translations.x = parseInt(this.value); });
	document.getElementById("point-light-y").addEventListener("input", function(){ PointLight.translations.y = parseInt(this.value); });
	document.getElementById("point-light-z").addEventListener("input", function(){ PointLight.translations.z = -parseInt(this.value); });
	
	document.querySelectorAll("#point-light-position input[type='range']").forEach(input => input.addEventListener("input", () => {
		gl.uniform3fv(mainProgram.pointLightPositionUniform, [PointLight.translations.x, PointLight.translations.y, PointLight.translations.z]);
	}));
}

function configureCamera(){
	// View configurations
	cameraPosition = generalCameraPosition = [0, 51, 100];
	eyeVector = [0, 0, -1, 0];
	upVector = [0, 1, 0, 0];
	isHorseCamera = false;
	tiltAngle = 0;
	turnAngle = 0;
	
	updateCamera();
	
	// Update camera's position from input
	document.getElementById("general-camera-translation-x").addEventListener("input", function(){ cameraPosition[0] = parseInt(this.value); });
	document.getElementById("general-camera-translation-y").addEventListener("input", function(){ cameraPosition[1] = parseInt(this.value); });
	document.getElementById("general-camera-translation-z").addEventListener("input", function(){ cameraPosition[2] = -parseInt(this.value); });

	document.getElementById("general-camera-rotation-x").addEventListener("input", function(){ tiltAngle = parseInt(this.value); });
	document.getElementById("general-camera-rotation-y").addEventListener("input", function(){ turnAngle = parseInt(this.value); });
	
	document.querySelectorAll("#general-camera-position input[type='range']").forEach(input => input.addEventListener("input", updateCamera));
	document.querySelectorAll("#general-camera-rotation input[type='range']").forEach(input => input.addEventListener("input", () => {
		eyeVector = multiplymv(m4.multiply(m4.xRotation(degToRad(tiltAngle)), m4.yRotation(degToRad(-turnAngle))), [0, 0, -1, 0]);
		updateCamera();
	}));
}

function updateCamera(){
	const cameraMatrix = m4.lookAt(cameraPosition, m4.addVectors(cameraPosition, eyeVector), upVector);
	
	const viewMatrix = m4.inverse(cameraMatrix);
	gl.useProgram(lampProgram);
	gl.uniformMatrix4fv(lampProgram.vMatrixUniform, false, viewMatrix);
	
	gl.useProgram(mainProgram);
	gl.uniformMatrix4fv(mainProgram.vMatrixUniform, false, viewMatrix);
	gl.uniform3fv(mainProgram.viewPositionUniform, cameraPosition);
	gl.uniform3fv(mainProgram.spotLightPositionUniform, cameraPosition);
}

function configureProjection(){
	// Projection matrix configurations
	const fovRadians = degToRad(60);
    const aspect = canvas.width/canvas.height;
    const zNear = 1;
    const zFar = 1000;
	
	// Setup perspective viewing volume
	const projectionMatrix = m4.perspective(fovRadians, aspect, zNear, zFar);
	
	gl.useProgram(mainProgram);
	gl.uniformMatrix4fv(mainProgram.pMatrixUniform, false, projectionMatrix);
	gl.uniform1f(mainProgram.farPlaneUniform, zFar);
	
	gl.useProgram(lampProgram);
	gl.uniformMatrix4fv(lampProgram.pMatrixUniform, false, projectionMatrix);
}

function configureEventListeners(){
	Horse.configureEventListeners();
	Swing.configureEventListeners();
	Boat.configureEventListeners();
	Pine.configureEventListeners();
	
	document.querySelectorAll("input[type='range']").forEach(function(input){
		input.addEventListener("pointerdown", () => {
			document.getElementsByClassName("offcanvas")[0].classList.add("opacity-25");
			document.getElementsByClassName("offcanvas-backdrop")[0].classList.add("opacity-0");
		});
		input.addEventListener("pointerup", () => {
			document.getElementsByClassName("offcanvas")[0].classList.remove("opacity-25");
			document.getElementsByClassName("offcanvas-backdrop")[0].classList.remove("opacity-0");
		});
	});
	
	const menuButton = document.getElementById("menu-button");
	menuButton.addEventListener("pointerup", () => menuButton.classList.add("d-none"));
	document.getElementById("menu").addEventListener("hidden.bs.offcanvas", () => menuButton.classList.remove("d-none"));
	
	isHorseCamera = false;
	document.getElementsByName("camera-position").forEach(function(input){
		input.addEventListener("input", () => {
			switch(input.value){
				case "general":
					document.getElementById("general-camera-position").classList.remove("d-none");
					document.getElementById("general-camera-rotation").classList.remove("d-none");
					cameraPosition = generalCameraPosition;
					eyeVector = multiplymv(m4.multiply(m4.xRotation(degToRad(tiltAngle)), m4.yRotation(degToRad(-turnAngle))), [0, 0, -1, 0]);
					isHorseCamera = false;
					updateCamera();
					break;
				case "horse":
					document.getElementById("general-camera-position").classList.add("d-none");
					document.getElementById("general-camera-rotation").classList.add("d-none");
					generalCameraPosition = cameraPosition;
					isHorseCamera = true;
					break;
			}
		})
	});
	
	primitiveType = gl.TRIANGLES;
	document.getElementsByName("object-mode").forEach(function(input){
		input.addEventListener("input", () => {
			switch(input.value){
				case "wireframe":
					primitiveType = gl.LINES;
					break;
				case "shading":
					primitiveType = gl.TRIANGLES;
					break;
			}
		})
	});
	
	animationEnabled = true;
	document.querySelectorAll(".disabled-in-demo input").forEach(input => input.disabled = true);
	document.getElementsByName("display-mode").forEach(function(input){
		input.addEventListener("input", () => {
			switch(input.value){
				case "demo":
					animationEnabled = true;
					document.querySelectorAll(".disabled-in-demo input").forEach(input => input.disabled = true);
					render();
					break;
				case "interactive":
					animationEnabled = false;
					document.querySelectorAll(".disabled-in-demo input").forEach(input => input.disabled = false);
					break;
			}
		})
	});
}

function renderShadow(){
	isRenderingShadow = true;
	gl.useProgram(shadowProgram);
	for(let i = 0; i < 6; i++){
		renderShadowMap(i);
	}
	isRenderingShadow = false;
}

function renderShadowMap(side){
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + side, shadowFrameBuffer.depthBuffer, 0);

	gl.viewport(0, 0, shadowFrameBuffer.width, shadowFrameBuffer.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	shadowMapLookAtMatrix = m4.lookAt([0, 100, 0], m4.addVectors([0, 100, 0], centers[side]), upVectors[side]);
	shadowMapTransform = m4.perspective(degToRad(90), shadowFrameBuffer.width/shadowFrameBuffer.height, 1, 1000);
	shadowMapTransform = m4.multiply(shadowMapTransform, shadowMapLookAtMatrix);
	gl.uniformMatrix4fv(shadowProgram.pMatrixUniform, shadowMapTransform);

	gl.uniform3fv(shadowProgram.pointLightPositionUniform, [0, 100, 0]);
	gl.uniform1f(shadowProgram.farPlaneUniform, 1000);

	Horse.draw();
	Swing.draw();
	Boat.draw();
	Pine.draw();
	Emoji.draw();

	gl.bindFramebuffer(gl.FRAMEBUFFER,  null);
}

function renderScene(){
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Draw lamp
	gl.useProgram(lampProgram);
	PointLight.draw();
	
	// Draw objects
	gl.useProgram(mainProgram);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowFrameBuffer.depthBuffer);
	gl.uniform1i(mainProgram.shadowSamplerUniform, 2);
	Land.draw();
	Horse.draw();
	Swing.draw();
	Pine.draw();
	Boat.draw();
	Emoji.draw();
}

function render(){
	//renderShadow();
	renderScene();
	
	// Animate next frame
	if(animationEnabled){
		Horse.animate();
		Swing.animate();
		Boat.animate();
	}

	requestAnimationFrame(render);
}

async function init(){
	await initWebGl();
	configure();
	
	// Load model's obj file from URL rather than from DOM
	Promise.all([
		PointLight.loadUrl("model/ball/ball.mtl", "model/ball/ball.obj"),
		Land.loadUrl("model/land/land.mtl", "model/land/land.obj"),
		Horse.loadUrl("model/horse/horse.mtl", "model/horse/horse.obj"),
		Swing.loadUrl("model/swing/swing.mtl", "model/swing/swing.obj"),
		Pine.loadUrl("model/pine/pine.mtl", "model/pine/pine.obj"),
		Boat.loadUrl("model/boat/boat.mtl", "model/boat/boat.obj"),
		Emoji.loadUrl("model/emoji/emoji.mtl", "model/emoji/emoji.obj")
	]).then(render);
}

window.onload = init;