function degToRad(deg){
	return deg/180 * Math.PI;
}

function radToDeg(rad){
	return rad/Math.PI * 180;
}

// Convert 4x4 matrix to 3x3 matrix by taking upper-left part
function m4tom3(matrix){
	let result = []
	for(let i = 0; i < 3; i++){
		for(let j = 0; j < 3; j++){
			result.push(matrix[i * 4 + j]);
		}
	}
	return result;
}

// Multiply 4x4 matrix with vector with 4 elements
function multiplymv(m, v){
	let res = [];
	for(let i = 0; i < 4; i++){
		let sum = 0;
		for(let j = 0; j < 4; j++){
			sum = sum + m[j * 4 + i] * v[j];
		}
		res.push(sum);
	}
	return res.slice(0, 3);
}

// Generate wireframe
function wireframe(indices){
	let res = [];
	for(let i = 0; i < indices.length; i += 3){
		res.push(indices[i], indices[i + 1]);
		res.push(indices[i + 1], indices[i + 2]);
		res.push(indices[i + 2], indices[i]);
	}
	return res;
}