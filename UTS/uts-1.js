"use strict";

var gl;

var canvasW, canvasH;

var polygons = [];
var removedPolygons = [];

var colorLocation;

var matrixLocation;
var projectionMatrix;

var removedCount = 0;
var timeLeft = 30;
var gameOver = false;

// Color palette: https://loading.io/color/feature/Spectral-10/
var colorsAvailable = [
	vec3(158, 1, 66),
	vec3(213, 62, 79),
	vec3(244, 109, 67),
	vec3(253, 174, 97),
	vec3(254, 224, 139),
	vec3(230, 245, 152),
	vec3(171, 221, 164),
	vec3(102, 194, 165),
	vec3(50, 136, 189),
	vec3(94, 79, 162)
];

// 3x3 matrix
var m3 = {
	identity: function(){
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	},
	projection: function(width, height){
		return [
			2/width, 0, 0,
			0, 2/height, 0,
			0, 0, 1
		];
	},
	translation: function(tx, ty){
		return [
			1, 0, 0,
			0, 1, 0,
			tx, ty, 1
		];
	},
	rotation: function(angle){
		let c = Math.cos(angle);
		let s = Math.sin(angle);
		return [
			c,-s, 0,
			s, c, 0,
			0, 0, 1
		];
	},
	scaling: function(sx, sy){
		return [
			sx,0, 0,
			0, sy, 0,
			0, 0, 1
		];
	},
	multiply: function(a, b){
		let res = [];
		// If b.length == 9, then it's considered as matrix and has 3 columns
		// otherwise it's considered as vector and has 1 column
		for(let i = 0; i < b.length/3; i++){
			for(let j = 0; j < 3; j++){
				let sum = 0;
				for(let k = 0; k < 3; k++){
					sum += b[i * 3 + k] * a[k * 3 + j];
				}
				res.push(sum);
			}
		}
		return res;
	},
}

init();

function init(){
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if(!gl) alert("WebGL 2.0 isn't available");

	canvasW = canvas.width, canvasH = canvas.height;
	
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvasW, canvasH);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
	
	// Normalize colors
	colorsAvailable = colorsAvailable.map(color => color.map(x => x/255));

    canvas.addEventListener("mousedown", function(event){
		if(gameOver) return;
		// Using offsetX/Y to determine mouse location in canvas
        let pos = vec3(event.offsetX - canvasW/2, (canvasH - event.offsetY) - canvasH/2, 1);
		let index = getPolygonIndex(pos);
		if(index != -1){
			removePolygon(index);
			removedCount++;
			document.getElementById("removed-cnt").innerText = removedCount;
		}
    });

    //  Load shaders and initialize attribute buffers
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Associate out shader variables with our data buffer
    let positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
	
    // Get location of color uniform
    colorLocation = gl.getUniformLocation(program, "uColor");

	// Get location of matrix uniform
	matrixLocation = gl.getUniformLocation(program, "uMatrix");
	
	projectionMatrix = m3.projection(canvas.width, canvas.height);
	
	// Generate a new polygon every 2 seconds, until there are 10 polygons
	// Faster generation the more polygons are removed
	generatePolygons();
	
	let interval = setInterval(() => {
		timeLeft--;
		document.getElementById("time-left").innerText = timeLeft;
		if(timeLeft <= 0){
			gameOver = true;
			document.getElementById("result").innerText = (polygons.length <= 5 ? "You win" : "You lose");
			clearInterval(interval);
		}
	}, 1000);
    render();
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	drawPolygons();

    requestAnimationFrame(render);
}

function generatePolygons(){
	if(gameOver) return;
	if(polygons.length < 10){
		// Generate random number of polygon sides (3 <= sides <= 8)
		let randNumSides = Math.max(3, Math.ceil(8 * Math.random()));
		generatePolygon(randNumSides);
	}
	var timeout = setTimeout(() => {
		generatePolygons();
		clearTimeout(timeout);
	}, 2000/(Math.log(removedCount + 1)/Math.log(4) + 1)); // Base 4 logarithm
}

function toRadian(angle){
	return angle * 2 * Math.PI/360;
}

function generatePolygon(numSides){
	let first = vec3(20, 0, 1);
	let incA = 360/numSides;
	let verticesPosition = [];
	let angle;
	
	// Construct polygon using triangles
	for(let i = 1; i < numSides - 1; i++){
		verticesPosition.push(first);
		
		angle = toRadian(i * incA);
		let next = m3.multiply(m3.rotation(angle), first);
		verticesPosition.push(next);
		
		angle = toRadian((i + 1) * incA);
		let nextToNext = m3.multiply(m3.rotation(angle), first);
		verticesPosition.push(nextToNext);
	}
	
	// Randomly select color, rotation angle, scale factor, and translation for polygon 
	let colorIndex = Math.floor(colorsAvailable.length * Math.random());
	let scaleEnd = Math.max(1, 4 * Math.random());
	let angleEnd = Math.max(90, Math.floor(360 * Math.random()));
	let translateX = canvasW * Math.random() - canvasW/2;
	let translateY = canvasH * Math.random() - canvasH/2;
	let translationMatrix = m3.translation(translateX, translateY);
	
	polygons.push({ verticesPosition,
					color: colorsAvailable[colorIndex],
					scaleNow: 0, scaleEnd,
					angleNow: 0, angleEnd,
					translationMatrix });
}

// Drawl existing and removed polygons
function drawPolygons(){
	for(let i = 0; i < polygons.length; i++) drawPolygon(polygons[i]);
	for(let i = 0; i < removedPolygons.length;){
		if(removedPolygons[i].scaleNow <= 0){
			removedPolygons[i] = removedPolygons[removedPolygons.length - 1];
			removedPolygons.pop();
			continue;
		}
		drawRemovedPolygon(removedPolygons[i]);
		i++;
	}
}

// Draw a polygon
function drawPolygon(polygon){
	let vertices = [];
	for(let j = 0; j < polygon.verticesPosition.length; j++){
		vertices.push(polygon.verticesPosition[j]);
	}
	
	if(polygon.angleNow < polygon.angleEnd) polygon.angleNow += 10;
	
	if(polygon.scaleNow < polygon.scaleEnd) polygon.scaleNow += 0.1;
	
	let matrix = generateMatrix(polygon.translationMatrix, polygon.angleNow, polygon.scaleNow);
	
	gl.uniform3fv(colorLocation, polygon.color);
	gl.uniformMatrix3fv(matrixLocation, false, matrix);

	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

// Polygon removal animation
function drawRemovedPolygon(polygon){
	let vertices = [];
	for(let j = 0; j < polygon.verticesPosition.length; j++){
		vertices.push(polygon.verticesPosition[j]);
	}
	
	// Polygon will bounces with the curve y = -1/200 * x^2 +/- x
	polygon.xPos += polygon.bounceDir * 10;
	let yPos = -1/200 * polygon.xPos * polygon.xPos + polygon.bounceDir * polygon.xPos;
	
	polygon.angleNow -= 10;
	
	polygon.scaleNow -= 0.05;
	if(polygon.scaleNow <= 0) return;
	
	let translationMatrix = m3.multiply(polygon.translationMatrix, m3.translation(polygon.xPos, yPos));
	let matrix = generateMatrix(translationMatrix, polygon.angleNow, polygon.scaleNow);
	
	gl.uniform3fv(colorLocation, polygon.color);
	gl.uniformMatrix3fv(matrixLocation, false, matrix);

	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

// Removes polygon
function removePolygon(index){
	// Swap selected polygon with back then pop back
	let polygon = polygons[index];
	polygons[index] = polygons[polygons.length - 1];
	polygons.pop();
	
	polygon.xPos = 0;
	let dir = Math.floor(2 * Math.random());
	polygon.bounceDir = (dir == 0 ? -1 : 1);
	removedPolygons.push(polygon);
}

// Generate MVP matrix
function generateMatrix(translationMatrix, angle, scale){
	let matrix = projectionMatrix;
	matrix = m3.multiply(matrix, translationMatrix);
	matrix = m3.multiply(matrix, m3.rotation(toRadian(angle)));
	matrix = m3.multiply(matrix, m3.scaling(scale, scale));
	return matrix;
}

// Find the polygon where the mouse trigger a mousedown event
function getPolygonIndex(inputPos){
	for(let i = polygons.length - 1; 0 <= i; i--){
		let polygon = polygons[i];
		
		// matrix = inverse transformation, to transform the point
		let matrix = m3.identity();
		matrix = m3.multiply(matrix, m3.scaling(1/polygon.scaleNow, 1/polygon.scaleNow));
		matrix = m3.multiply(matrix, m3.rotation(-polygon.angleNow));
		matrix = m3.multiply(matrix, m3.translation(-polygon.translationMatrix[6], -polygon.translationMatrix[7])); // Invert tx and ty
		let pos = m3.multiply(matrix, inputPos);
		
		if(isInside(pos, polygon)){
			return i;
		}
	}
	return -1;
}

// Check if a point is inside a polygon or not
function isInside(pos, polygon){
	let inside = false;
	for(let i = 0; i < polygon.verticesPosition.length; i += 3){
		inside = inside || isInsideTriangle(pos, polygon.verticesPosition.slice(i, i + 3));
	}
	return inside;
}

// Source: https://codeforces.com/blog/entry/48868, Inclusion tests section
// Check if a point is inside a triangle or not
function isInsideTriangle(pos, triangle){
	let signs = [null, null, null];
	for(let i = 0; i < 3; i++){
		signs[i] = Math.sign(ccw(pos, triangle[(i + 1) % 3], triangle[i]));
	};
	if(signs[0] == signs[1] && signs[1] == signs[2]) return true;
	for(let i = 0; i < 3; i++){
		if(signs[i] * signs[(i + 1) % 3] == -1) return false;
	}
	return true;
}

// Source: https://tlx.toki.id/courses/competitive/chapters/12/submissions/380115
// Checking orientation using gradient
// -, counter-clockwise
// 0, co-linear
// +, clockwise
function ccw(a, b, c){
	return (a[1] - b[1]) * (b[0] - c[0]) - (b[1] - c[1]) * (a[0] - b[0]);
}