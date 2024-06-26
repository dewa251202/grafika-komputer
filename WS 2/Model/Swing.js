// Swing model configurations

class Swing extends BaseModel {
	
};

Swing.angles = {
	yFrame: 0,
	xLeftRope: 0,
	yRightHoop: 0,
	xLeftFrontFrame: 0,
	xLeftBackFrame: 0,
	xRightFrontFrame: 0,
	xRightBackFrame: 0
}

Swing.translations = {
	x: 30, y: -1.5, z: 0,
	xRightRope: 0
}

Swing.leftRopeRotDir = 1;
Swing.rightRopeTraDir = 1;

Swing.colors = [
	[48, 48, 48],
	[48, 48, 48],
	[48, 48, 48],
	[48, 48, 48],
	[48, 48, 48],
	[48, 48, 48],
	[254, 241, 0],
	[48, 48, 48],
	[254, 241, 0]
];

Swing.childrens = [
	[1, 2, 3, 4, 5, 7],	// Top Frame
	[],					// Left Front Frame
	[],					// Left Back Frame
	[],					// Right Front Frame
	[],					// Right Back Frame
	[6],				// Left Rope
	[],					// Left Hoop
	[8],				// Right Rope
	[]					// Right Hoop
];

Swing.modelMatrices = [
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(Swing.translations.x, Swing.translations.y, Swing.translations.z));
		matrix = m4.multiply(matrix, m4.yRotation(Swing.angles.yFrame));
		matrix = m4.multiply(matrix, m4.scaling(1/4, 1/4, 1/4));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(0, 180, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xLeftFrontFrame));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(0, 180, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xLeftBackFrame));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(0, 180, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xRightFrontFrame));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(0, 180, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xRightBackFrame));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(0, 180, 0));
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xLeftRope));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(Swing.translations.xRightRope, 0, 0));
		
		return matrix;
	},
	() => {
		let matrix = m4.identity();
		matrix = m4.multiply(matrix, m4.translation(30, 0, 0));
		matrix = m4.multiply(matrix, m4.yRotation(Swing.angles.yRightHoop));
		matrix = m4.multiply(matrix, m4.translation(-30, 0, 0));
		return matrix;
	}
];

Swing.configureEventListeners = () => {
	document.getElementById("xSwingSlider").oninput = function(){ Swing.translations.x = document.getElementById("xSwingValue").innerText = this.value; }
	document.getElementById("ySwingSlider").oninput = function(){ Swing.translations.y = document.getElementById("ySwingValue").innerText = this.value; }
	document.getElementById("zSwingSlider").oninput = function(){ Swing.translations.z = document.getElementById("zSwingValue").innerText = this.value; }
	
	document.getElementById("Frame_yRotationSlider").addEventListener("input", function(){
		Swing.angles.yFrame = degToRad(this.value);
		document.getElementById("Frame_yRotationValue").innerText = this.value;
	});
	document.getElementById("LeftFrontFrame_xRotationSlider").addEventListener("input", function(){
		Swing.angles.xLeftFrontFrame = degToRad(this.value);
		document.getElementById("LeftFrontFrame_xRotationValue").innerText = this.value;
	});
	document.getElementById("LeftBackFrame_xRotationSlider").addEventListener("input", function(){
		Swing.angles.xLeftBackFrame = degToRad(this.value);
		document.getElementById("LeftBackFrame_xRotationValue").innerText = this.value;
	});
	document.getElementById("RightFrontFrame_xRotationSlider").addEventListener("input", function(){
		Swing.angles.xRightFrontFrame = degToRad(this.value);
		document.getElementById("RightFrontFrame_xRotationValue").innerText = this.value;
	});
	document.getElementById("RightBackFrame_xRotationSlider").addEventListener("input", function(){
		Swing.angles.xRightBackFrame = degToRad(this.value);
		document.getElementById("RightBackFrame_xRotationValue").innerText = this.value;
	});
}

Swing.animate = () => {
	Swing.angles.xLeftRope += Swing.leftRopeRotDir * 0.05;
	if(Swing.angles.xLeftRope > degToRad(60)) Swing.leftRopeRotDir = -1;
	if(Swing.angles.xLeftRope < degToRad(-60)) Swing.leftRopeRotDir = 1;
	
	Swing.angles.yRightHoop += 0.05;
	if(degToRad(360) <= Swing.angles.yRightHoop) Swing.angles.yRightHoop = 0;
	
	Swing.translations.xRightRope += Swing.rightRopeTraDir * 1;
	if(Swing.translations.xRightRope > 20) Swing.rightRopeTraDir = -1;
	if(Swing.translations.xRightRope < -20) Swing.rightRopeTraDir = 1;
}