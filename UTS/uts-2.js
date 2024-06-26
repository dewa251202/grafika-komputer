let points = [];
let canvas;

init();

function init(){
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if(!gl) alert("WebGL 2.0 isn't available");

    //
    // Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	
	// Default compass lines will displayed
	compass();
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	document.getElementById("compass").addEventListener("click", () => {
		clearPoints();
		compass();
		document.getElementById("mode").innerText = "Compass";
		document.getElementById("lines").classList.add("d-none");
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	});
	
	document.getElementById("random").addEventListener("click", () => {
		clearPoints();
		random();
		document.getElementById("mode").innerText = "Random";
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	});

    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, points.length);

    requestAnimationFrame(render);
}

function clearPoints(){
	while(points.length > 0) points.pop();
}

function compass(){
	// Set lines to be like compass
	midpointLine(point(0, 0), point(   0,  300)); // N
	midpointLine(point(0, 0), point( 150,  300)); // N-NE
	midpointLine(point(0, 0), point( 300,  300)); // NE
	midpointLine(point(0, 0), point( 300,  150)); // E-NE
	midpointLine(point(0, 0), point( 300,    0)); // E
	midpointLine(point(0, 0), point( 300, -150)); // E-SE
	midpointLine(point(0, 0), point( 300, -300)); // SE
	midpointLine(point(0, 0), point( 150, -300)); // S-SE
	midpointLine(point(0, 0), point(   0, -300)); // S
	midpointLine(point(0, 0), point(-150, -300)); // S-SW
	midpointLine(point(0, 0), point(-300, -300)); // SW
	midpointLine(point(0, 0), point(-300, -150)); // W-SW
	midpointLine(point(0, 0), point(-300,    0)); // W
	midpointLine(point(0, 0), point(-300,  150)); // W-NW
	midpointLine(point(0, 0), point(-300,  300)); // NW
	midpointLine(point(0, 0), point(-150,  300)); // N-NW
}

function random(){
	let rand = () => Math.floor(400 * Math.random() - 200);
	document.getElementById("lines").innerHTML = 'Lines:<br>';
	document.getElementById("lines").classList.remove("d-none");
	for(let i = 0; i < 5; i++){
		let start = point(rand(), rand());
		let end = point(rand(), rand());
		midpointLine(start, end);
		document.getElementById("lines").innerHTML += `(${start.x}, ${start.y}) to (${end.x}, ${end.y})<br>`;
	}
}

function midpointLine(start, end){
	// Let starting point be lower than end point
	if(start.x > end.x || start.x == end.x && start.y > end.y){
		[start, end] = [end, start];
	}
	
	// Negate the sign of y if gradient is negative
	let negated = false;
	if((end.y - start.y) * (end.x - start.x) < 0){
		start.y = -start.y;
		end.y = -end.y;
		negated = true;
	}
	
	// Make x as y and y as x if gradient is greater than 1
	let swapped = false;
	if(end.y - start.y > end.x - start.x){
		[start.x, start.y] = [start.y, start.x];
		[end.x, end.y] = [end.y, end.x];
		swapped = true;
	}
	
	// Original algorithm
	let dx = end.x - start.x;
	let dy = end.y - start.y;
	
	let D = 2 * dy - dx;
	let incE = 2 * dy, incNE = 2 * (dy - dx);
	let xi = start.x, yi = start.y;
	setPixel(xi, yi, negated, swapped);
	while(xi < end.x){
		if(D <= 0){
			D = D + incE;
		}
		else{
			D = D + incNE;
			yi++;
		}
		xi++;
		setPixel(xi, yi, negated, swapped);
	}
}

function point(x, y){
	return {x, y};
}

function setPixel(x, y, negated, swapped){
	// Swap back
	if(swapped) [x, y] = [y, x];
	// Negate back
	if(negated) y = -y;
	x = x/canvas.width;
	y = y/canvas.height;
	points.push(vec2(x, y));
}