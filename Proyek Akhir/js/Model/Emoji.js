// Emoji model configurations

class Emoji extends BaseModel {

};

Emoji.childrens = [
	[]
]

Emoji.modelMatrices = [
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-50, 50, 50));
		matrix = m4.multiply(matrix, m4.scaling(10, 10, 10));
		
		return matrix;
	}
]