"use strict";

var canvas;
var gl;

var bufferId, positionLoc;
var cBufferId, colorLoc;

// Variabel berhubungan dengan objek
var maxNumPositions = 200;
var index = 0, lastIndex = 0;

var currentPosition, lastPosition, currentColor, lastColor;
var numPolygons = 0;
var numPositions = [0];
var start = [0];

var objectType = 1;
var rect = [];

var lineWidthIdx = 1;
const lineWidthOpts = [320, 80, 40];

// Variabel berhubungan dengan warna
var cindex = 0;
var colors = [
	vec3(215, 30, 34),   // red
	vec3(29, 60, 233),   // blue
	vec3(27, 145, 62),   // green
	vec3(255, 99, 212),	 // pink
	vec3(255, 141, 28),  // orange
	vec3(255, 255, 103), // yellow
	vec3(120, 61, 210),  // purple
	vec3(128, 88, 45)    // brown
];

// Variabel berhubungan dengan animasi
var animationEnabled = [false, false, false]; // rotate, translate, scale
var theta = 0.0, thetaLoc, rotationDir = 1;
var delta = [0.0, 0.0], deltaLoc;
var deltaPathIdx = 0;
const deltaPath = [[0.1, 0.1], [0.0, -0.1], [-0.1, 0.0], [0.0, 0.1], [0.1, 0.0], [-0.1, -0.1]];
var alpha = 1.0, alphaLoc, inc = true;

// Objek-objek DOM
const objectListDOM = $("ul[aria-labelledby='object-dropdown-button'] > li");
const colorListDOM = $("ul[aria-labelledby='color-dropdown-button'] > li");
const lineWidthListDOM = $("ul[aria-labelledby='line-width-dropdown-button'] > li");
const animationListDOM = $("ul[aria-labelledby='animation-dropdown-button'] > li");
const slider = document.getElementById("slider");
const endPolygonButton = document.getElementById("end-polygon");
const rotationDirButton = document.getElementById("rotation-dir");

init();

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if(!gl) alert("WebGL 2.0 isn't available");
	
	initObjectEventListener();
	initColorEventListener();
	initLineWidthEventListener();
	initAnimationEventListener();

    endPolygonButton.addEventListener("click", endInputPolygonThenRender);
	rotationDirButton.addEventListener("click", () => { rotationDir = -rotationDir });
    canvas.addEventListener("mousedown", getClickedCanvasData);
	
	$("#clear-canvas").on("click", () => {
		// Mengosongkan canvas dengan menginisiasi nilai-nilai variabel seperti semula
		// sehingga buffer dapat di-overwrite
		index = lastIndex = 0;
		numPolygons = 0;
		numPositions = [0];
		start = [0];
		render();
	})

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumPositions, gl.STATIC_DRAW);
	 
    positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumPositions, gl.STATIC_DRAW);
	
    colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
	
	thetaLoc = gl.getUniformLocation(program, "uTheta");
	deltaLoc = gl.getUniformLocation(program, "uDelta");
	alphaLoc = gl.getUniformLocation(program, "uAlpha");
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	if(animationEnabled[0]){
		theta += rotationDir * 0.1;
		if(2 * Math.PI < theta) theta = 0;
		else if(theta < 0) theta = 2 * Math.PI;
	}
	if(animationEnabled[1]){
		delta[0] += deltaPath[deltaPathIdx][0];
		delta[1] += deltaPath[deltaPathIdx][1];
		// Apabila diluar koordinat, pilih path selanjutnya
		if(!(-1.0 <= delta[0] && delta[0] <= 1.0 && -1.0 <= delta[1] && delta[1] <= 1.0)){
			deltaPathIdx++;
			deltaPathIdx %= deltaPath.length;
		}
	}
	if(animationEnabled[2]){
		// alpha hanya berada pada rentang (0, 2)
		if(alpha >= 1.9) inc = false;
		if(alpha <= 0.1) inc = true;
		alpha += (inc ? 0.1 : -0.1);
	}

	gl.uniform1f(thetaLoc, theta);
	gl.uniform2f(deltaLoc, delta[0], delta[1]);
	gl.uniform1f(alphaLoc, alpha);
	
    for(let i = 0; i < numPolygons; i++){
        gl.drawArrays(gl.TRIANGLE_FAN, start[i], numPositions[i]);
    }
	
	if(numPolygons > 0 && (animationEnabled[0] || animationEnabled[1] || animationEnabled[2])){
		slider.disabled = false;
		rotationDirButton.disabled = !animationEnabled[0];
		setTimeout(() => { requestAnimationFrame(render); }, 1000/slider.value);
	}
	else{
		slider.disabled = true;
		rotationDirButton.disabled = true;
	}
}

// === Fungsi inisialisasi event listener untuk pemilihan objek === //
function initObjectEventListener(){
	objectListDOM.on("click", function(event){
		if(objectType == this.value) return;
		
		objectListDOM[objectType].classList.remove("active");
		objectType = this.value;
		this.classList.add("active");
		
		endPolygonButton.disabled = (objectType != 3);
		
		// Apabila mengganti object sebelum digambar, maka reset indeks
		index = lastIndex;
		numPositions[numPolygons] = 0;
		start[numPolygons] = lastIndex;
	});
}

// === Fungsi inisialisasi event listener untuk pemilihan warna === //
function initColorEventListener(){
	colors = colors.map(color => color.map(x => x/255));
	
	colorListDOM.on("click", function(event){
		colorListDOM[cindex].classList.remove("active");
		cindex = this.value;
		this.classList.add("active");
	});
}

// === Fungsi inisialisasi event listener untuk pemilihan lebar garis === //
function initLineWidthEventListener(){
	lineWidthListDOM.on("click", function(event){
		lineWidthListDOM[lineWidthIdx].classList.remove("active");
		lineWidthIdx = this.value;
		console.log(lineWidthIdx);
		this.classList.add("active");
	});
}

// === Fungsi inisialisasi event listener untuk pemilihan animasi === //
function initAnimationEventListener(){
	animationListDOM.on("click", function(event){
		animationEnabled[this.value] ^= true; // bitwise xor untuk melakukan inversi
		this.classList.toggle("active");
		render();
	});
}

// === Fungsi untuk menyimpan posisi yang ditekan pada canvas dan color yang dipilih === //
function getClickedCanvasData(event){
	currentPosition = vec2(2 * event.clientX/canvas.width - 1, 2 * (canvas.height - event.clientY)/canvas.height - 1);
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(currentPosition));
	
	currentColor = vec4(colors[cindex]);
	currentColor[3] = 1.0;
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
	gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(currentColor));

	numPositions[numPolygons]++;
	index++;
	
	switch(objectType){
		case 0:
			if(numPositions[numPolygons] == 2){
				// Mendapatkan vektor satuan lain yang tegak lurus dengan
				// vektor satuan currentPosition-lastPosition
				const v = vec2(currentPosition[0] - lastPosition[0], currentPosition[1] - lastPosition[1]);
				const d = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2)) * lineWidthOpts[lineWidthIdx];
				const w = vec2(-v[1]/d, v[0]/d);
				
				// Representasikan garis sebagai persegi panjang
				rect[0] = vec2(lastPosition[0] + w[0], lastPosition[1] + w[1]);
				rect[1] = vec2(lastPosition[0] - w[0], lastPosition[1] - w[1]);
				rect[2] = vec2(currentPosition[0] - w[0], currentPosition[1] - w[1]);
				rect[3] = vec2(currentPosition[0] + w[0], currentPosition[1] + w[1]);
				
				// Isi ke dalam buffer
				for(let i = 0; i < 4; i++){
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index - 2 + i), flatten(rect[i]));
					
					const tempColor = vec4(i < 2 ? lastColor : currentColor);
					tempColor[3] = 1.0;
					gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 2 + i), flatten(tempColor));
				}
				numPositions[numPolygons] += 2;
				index += 2;
				
				endInputPolygonThenRender();
			}
			break;
		case 1:
			if(numPositions[numPolygons] == 3) endInputPolygonThenRender();
			break;
		case 2:
			if(numPositions[numPolygons] == 2){
				// Buat posisi titik-titik sudut persegi panjang yang lain 
				rect[1] = vec2(lastPosition[0], currentPosition[1]);
				rect[2] = currentPosition;
				rect[3] = vec2(currentPosition[0], lastPosition[1]);
				
				// Isi ke dalam buffer
				for(let i = 1; i < 4; i++){
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index - 2 + i), flatten(rect[i]));
					
					const tempColor = vec4(i < 2 ? lastColor : currentColor);
					tempColor[3] = 1.0;
					gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 2 + i), flatten(tempColor));
				}
				numPositions[numPolygons] += 2;
				index += 2;

				endInputPolygonThenRender();
			}
			break;
		case 3: break;
	}
	
	lastPosition = currentPosition;
	lastColor = currentColor;
}

// === Fungsi untuk mengakhiri pemberian data posisi yang ditekan pada canvas === //
function endInputPolygonThenRender(){
	numPolygons++;
	numPositions[numPolygons] = 0;
	start[numPolygons] = index;
	
	lastIndex = index;
	
	render();
}