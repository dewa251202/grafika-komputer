// Boat model configurations

class Boat extends BaseModel {
	
};

Boat.childrens = [
	[1],	// Base
	[2],	// Pole
	[]		// Sail
];

Boat.modelMatrices = [
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(Boat.translations.x, Boat.translations.y, Boat.translations.z));
		matrix = m4.multiply(matrix, m4.yRotation(Boat.angles.yBody));
		matrix = m4.multiply(matrix, m4.scaling(-2, 2, 2));
		
		return matrix;
	},
	() => {
		return m4.identity();
	},
	() => {
		return m4.identity();
	}
];

Boat.angles = {
	yBody: 0
}

Boat.translations = {
	x: 0, y: 0, z: -50
}

Boat.inputs = {};

Boat.configureEventListeners = () => {
	Boat.inputs.yBodyRotation = document.getElementById("boat-rotation-y");
	Boat.inputs.yBodyRotation.addEventListener("input", function(){
		Boat.angles.yBody = degToRad(this.value);
		Boat.translations.x = -20 * Math.sin(Boat.angles.yBody);
		Boat.translations.z = -(50 + 20 * Math.cos(Boat.angles.yBody));
	});
}

Boat.animate = () => {
	Boat.angles.yBody += 0.05;
	if(Boat.angles.yBody > degToRad(360)) Boat.angles.yBody = 0;
	Boat.translations.x = -20 * Math.sin(Boat.angles.yBody);
	Boat.translations.z = -(50 + 20 * Math.cos(Boat.angles.yBody));
	Boat.inputs.yBodyRotation.value = radToDeg(Boat.angles.yBody);
}