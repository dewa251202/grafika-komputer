// Horse model configurations

class Horse extends BaseModel {
	static finishDrawing(partIndex, matrix){
		const part = this.parts[partIndex];
		
		const newMatrix = m4.multiply(matrix, part.modelMatrix());
		if(partIndex == 10 && isHorseCamera){
			cameraPosition = multiplymv(newMatrix, [75, 85, 0, 1]);
			eyeVector = multiplymv(newMatrix, [1, 0, 0, 0]);
			updateCamera();
		}
	}
};

Horse.angles = {
	yBody: 0,
	xNeck: 0,
	yHead: 0,
	zLimb: 0
}

Horse.translations = {
	x: -50, y: 19, z: 0,
	xBody: 0
}

Horse.inputs = {}

Horse.neckRotDir = 1;
Horse.headRotDir = 1;
Horse.bodyTraDir = 1;

Horse.childrens = [
	[1, 3, 5, 7, 9],	// Body
	[2],				// Right Hind Thigh
	[],					// Right Hind Lower Leg
	[4],				// Right Fore Thigh
	[],					// Right Fore Lower Leg
	[6],				// Left Fore Thigh
	[],					// Left Fore Lower Leg
	[8],				// Left Hind Thigh
	[],					// Left Hind Lower Leg
	[10],				// Neck
	[] 					// Head
];

Horse.modelMatrices = [
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(Horse.translations.x + Horse.translations.xBody, Horse.translations.y, Horse.translations.z));
		matrix = m4.multiply(matrix, m4.yRotation(Horse.angles.yBody));
		matrix = m4.multiply(matrix, m4.scaling(1/5, 1/5, 1/5));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(-degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(-degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(45, 50, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(-45, 25, -15));
		
		return matrix;
	},
	() => {
		return m4.identity();
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(-45, 25, -15));
		
		return matrix;
	},
	() => {
		return m4.identity();
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(-degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(-degToRad(Horse.angles.zLimb)));
		matrix = m4.multiply(matrix, m4.translation(45, 50, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(40, 20, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Horse.angles.xNeck));
		matrix = m4.multiply(matrix, m4.translation(-40, -20, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(40, 70, 0));
		matrix = m4.multiply(matrix, m4.yRotation(-Horse.angles.yHead));
		matrix = m4.multiply(matrix, m4.translation(-40, -70, 0));
		
		return matrix;
	}
];

Horse.configureEventListeners = () => {
	Horse.inputs.xBodyTranslation = document.getElementById("horse-body-translation-x");
	Horse.inputs.xBodyTranslation.addEventListener("input", function(){
		Horse.translations.xBody = parseInt(this.value);
		Horse.angles.zLimb = parseInt(this.value);
	});
	
	Horse.inputs.xNeckRotation = document.getElementById("horse-neck-rotation-x");
	Horse.inputs.xNeckRotation.addEventListener("input", function(){ Horse.angles.xNeck = degToRad(this.value); });
	
	Horse.inputs.xHeadRotation = document.getElementById("horse-head-rotation-y");
	Horse.inputs.xHeadRotation.addEventListener("input", function(){ Horse.angles.yHead = degToRad(this.value); });
}

Horse.animate = () => {
	Horse.translations.xBody += Horse.bodyTraDir;
	Horse.angles.zLimb += Horse.bodyTraDir;
	if(Horse.translations.xBody > 30) Horse.bodyTraDir = -1;
	if(Horse.translations.xBody < 0) Horse.bodyTraDir = 1;
	Horse.inputs.xBodyTranslation.value = Horse.translations.xBody;
	
	Horse.angles.xNeck += Horse.neckRotDir * 0.02;
	if(Horse.angles.xNeck > degToRad(45)) Horse.neckRotDir = -1;
	if(Horse.angles.xNeck < degToRad(-45)) Horse.neckRotDir = 1;
	Horse.inputs.xNeckRotation.value = radToDeg(Horse.angles.xNeck);
	
	Horse.angles.yHead += Horse.headRotDir * 0.02;
	if(Horse.angles.yHead > degToRad(30)) Horse.headRotDir = -1;
	if(Horse.angles.yHead < degToRad(-30)) Horse.headRotDir = 1;
	Horse.inputs.xHeadRotation.value = radToDeg(Horse.angles.yHead);
}