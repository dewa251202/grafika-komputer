// Horse model configurations

class Horse extends BaseModel {
	
};

Horse.angles = {
	yBody: 0,
	zRightHindThigh: 0,
	zRightHindLowerLeg: 0,
	zRightForeThigh: 0,
	zRightForeLowerLeg: 0,
	zLeftForeThigh: 0,
	zLeftForeLowerLeg: 0,
	zLeftHindThigh: 0,
	zLeftHindLowerLeg: 0,
	xNeck: 0,
	yHead: 0
}

Horse.translations = {
	x: -40, y: 23.75, z: 0
}

Horse.neckDir = 1;
Horse.headDir = 1;

Horse.colors = [
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21],
	[136, 0, 21]
]

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
		matrix = m4.multiply(matrix, m4.translation(Horse.translations.x, Horse.translations.y, Horse.translations.z));
		matrix = m4.multiply(matrix, m4.yRotation(Horse.angles.yBody));
		matrix = m4.multiply(matrix, m4.scaling(1/4, 1/4, 1/4));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zRightHindThigh));
		matrix = m4.multiply(matrix, m4.translation(45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zRightHindLowerLeg));
		matrix = m4.multiply(matrix, m4.translation(45, 50, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zRightForeThigh));
		matrix = m4.multiply(matrix, m4.translation(-45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zRightForeLowerLeg));
		matrix = m4.multiply(matrix, m4.translation(-45, 50, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zLeftForeThigh));
		matrix = m4.multiply(matrix, m4.translation(-45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zLeftForeLowerLeg));
		matrix = m4.multiply(matrix, m4.translation(-45, 50, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -25, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zLeftHindThigh));
		matrix = m4.multiply(matrix, m4.translation(45, 25, -15));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(-45, -50, 15));
		matrix = m4.multiply(matrix, m4.zRotation(Horse.angles.zLeftHindLowerLeg));
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
		matrix = m4.multiply(matrix, m4.yRotation(Horse.angles.yHead));
		matrix = m4.multiply(matrix, m4.translation(-40, -70, 0));
		
		return matrix;
	}
];

Horse.configureEventListeners = () => {
	document.getElementById("xHorseSlider").oninput = function(){ Horse.translations.x = document.getElementById("xHorseValue").innerText = this.value; }
	document.getElementById("yHorseSlider").oninput = function(){ Horse.translations.y = document.getElementById("yHorseValue").innerText = this.value; }
	document.getElementById("zHorseSlider").oninput = function(){ Horse.translations.z = document.getElementById("zHorseValue").innerText = this.value; }
	
	document.getElementById("Body_yRotationSlider").addEventListener("input", function(){
		Horse.angles.yBody = degToRad(this.value);
		document.getElementById("Body_yRotationValue").innerText = this.value;
	});
	document.getElementById("RightHindThigh_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zRightHindThigh = degToRad(this.value);
		document.getElementById("RightHindThigh_zRotationValue").innerText = this.value;
	});
	document.getElementById("RightHindLowerLeg_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zRightHindLowerLeg = degToRad(this.value);
		document.getElementById("RightHindLowerLeg_zRotationValue").innerText = this.value;
	});
	document.getElementById("RightForeThigh_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zRightForeThigh = degToRad(this.value);
		document.getElementById("RightForeThigh_zRotationValue").innerText = this.value;
	});
	document.getElementById("RightForeLowerLeg_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zRightForeLowerLeg = degToRad(this.value);
		document.getElementById("RightForeLowerLeg_zRotationValue").innerText = this.value;
	});
	document.getElementById("LeftForeThigh_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zLeftForeThigh = degToRad(this.value);
		document.getElementById("LeftForeThigh_zRotationValue").innerText = this.value;
	});
	document.getElementById("LeftForeLowerLeg_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zLeftForeLowerLeg = degToRad(this.value);
		document.getElementById("LeftForeLowerLeg_zRotationValue").innerText = this.value;
	});
	document.getElementById("LeftHindThigh_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zLeftHindThigh = degToRad(this.value);
		document.getElementById("LeftHindThigh_zRotationValue").innerText = this.value;
	});
	document.getElementById("LeftHindLowerLeg_zRotationSlider").addEventListener("input", function(){
		Horse.angles.zLeftHindLowerLeg = degToRad(this.value);
		document.getElementById("LeftHindLowerLeg_zRotationValue").innerText = this.value;
	});
}

Horse.animate = () => {
	Horse.angles.xNeck += Horse.neckDir * 0.02;
	if(Horse.angles.xNeck > degToRad(45)) Horse.neckDir = -1;
	if(Horse.angles.xNeck < degToRad(-45)) Horse.neckDir = 1;
	
	Horse.angles.yHead += Horse.headDir * 0.02;
	if(Horse.angles.yHead > degToRad(30)) Horse.headDir = -1;
	if(Horse.angles.yHead < degToRad(-30)) Horse.headDir = 1;
}