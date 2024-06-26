function degToRad(deg){
	return deg/180 * Math.PI;
}

function m4tom3(matrix){
	let result = []
	for(let i = 0; i < 3; i++){
		for(let j = 0; j < 3; j++){
			result.push(matrix[i * 4 + j]);
		}
	}
	return result;
}