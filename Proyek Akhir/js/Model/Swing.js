// Swing model configurations

class Swing extends BaseModel {
	
};

Swing.angles = {
	yFrame: 0,
	xLeftRope: 0,
	yRightHoop: 0,
	xLeftBackFrame: 0,
	xLeftFrontFrame: degToRad(-30),
	xRightBackFrame: 0,
	xRightFrontFrame: degToRad(-30)
}

Swing.translations = {
	x: 40, y: -1.5, z: 0,
	xRightRope: 0
}

Swing.inputs = {}

Swing.leftRopeRotDir = 1;
Swing.rightRopeTraDir = 1;
Swing.leftBackFrameRotDir = -1;
Swing.leftFrontFrameRotDir = 1;
Swing.rightBackFrameRotDir = 1;
Swing.rightFrontFrameRotDir = 1;
Swing.leftFrameLock = 0;
Swing.rightFrameLock = 0;

Swing.childrens = [
	[1, 2, 3, 4, 5, 7],	// Top Frame
	[],					// Left Back Frame
	[],					// Left Front Frame
	[],					// Right Back Frame
	[],					// Right Front Frame
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
		matrix = m4.multiply(matrix, m4.xRotation(-Swing.angles.xLeftBackFrame));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
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
		matrix = m4.multiply(matrix, m4.xRotation(-Swing.angles.xRightBackFrame));
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
		matrix = m4.multiply(matrix, m4.xRotation(Swing.angles.xLeftRope));
		matrix = m4.multiply(matrix, m4.translation(0, -180, 0));
		
		return matrix;
	},
	() => {
		return m4.identity();
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
	Swing.inputs.yFrameRotation = document.getElementById("swing-frame-rotation-y");
	Swing.inputs.yFrameRotation.addEventListener("input", function(){ Swing.angles.yFrame = degToRad(this.value); });
	
	Swing.inputs.xLeftRopeRotation = document.getElementById("swing-left-rope-rotation-x");
	Swing.inputs.xLeftRopeRotation.addEventListener("input", function(){ Swing.angles.xLeftRope = degToRad(this.value); });
	
	Swing.inputs.xRightRopeTranslation = document.getElementById("swing-right-rope-translation-x");
	Swing.inputs.xRightRopeTranslation.addEventListener("input", function(){ Swing.translations.xRightRope = parseInt(this.value); });
	
	Swing.inputs.xRightHoopRotation = document.getElementById("swing-right-hoop-rotation-y");
	Swing.inputs.xRightHoopRotation.addEventListener("input", function(){ Swing.angles.yRightHoop = degToRad(this.value); });
	
	Swing.inputs.xLeftBackFrameRotation = document.getElementById("swing-left-back-frame-rotation-x");
	Swing.inputs.xLeftBackFrameRotation.addEventListener("input", function(){ Swing.angles.xLeftBackFrame = degToRad(this.value); });
	
	Swing.inputs.xLeftFrontFrameRotation = document.getElementById("swing-left-front-frame-rotation-x");
	Swing.inputs.xLeftFrontFrameRotation.addEventListener("input", function(){ Swing.angles.xLeftFrontFrame = degToRad(this.value); });
	
	Swing.inputs.xRightBackFrameRotation = document.getElementById("swing-right-back-frame-rotation-x");
	Swing.inputs.xRightBackFrameRotation.addEventListener("input", function(){ Swing.angles.xRightBackFrame = degToRad(this.value); });
	
	Swing.inputs.xRightFrontFrameRotation = document.getElementById("swing-right-front-frame-rotation-x");
	Swing.inputs.xRightFrontFrameRotation.addEventListener("input", function(){ Swing.angles.xRightFrontFrame = degToRad(this.value); });
}

Swing.animate = () => {
	Swing.angles.yFrame += 0.01;
	if(Swing.angles.yFrame > degToRad(360)) Swing.angles.yFrame = 0;
	Swing.inputs.yFrameRotation.value = radToDeg(Swing.angles.yFrame);
	
	Swing.angles.xLeftRope += Swing.leftRopeRotDir * 0.05;
	if(Swing.angles.xLeftRope > degToRad(60)) Swing.leftRopeRotDir = -1;
	if(Swing.angles.xLeftRope < degToRad(-60)) Swing.leftRopeRotDir = 1;
	Swing.inputs.xLeftRopeRotation.value = radToDeg(Swing.angles.xLeftRope);
	
	Swing.angles.yRightHoop += 0.05;
	if(degToRad(360) <= Swing.angles.yRightHoop) Swing.angles.yRightHoop = 0;
	Swing.inputs.xRightHoopRotation.value = radToDeg(Swing.angles.yRightHoop);
	
	Swing.translations.xRightRope += Swing.rightRopeTraDir;
	if(Swing.translations.xRightRope > 20) Swing.rightRopeTraDir = -1;
	if(Swing.translations.xRightRope < -20) Swing.rightRopeTraDir = 1;
	Swing.inputs.xRightRopeTranslation.value = Swing.translations.xRightRope;
	
	if(Swing.leftFrameLock == 0){
		Swing.angles.xLeftBackFrame += Swing.leftBackFrameRotDir * 0.02;
		if(Swing.angles.xLeftBackFrame > degToRad(60)) Swing.leftBackFrameRotDir = -1;
		if(Swing.angles.xLeftBackFrame < degToRad(-30)){
			Swing.leftBackFrameRotDir = 1;
			Swing.leftFrameLock = 1;
		}
		Swing.inputs.xLeftBackFrameRotation.value = radToDeg(Swing.angles.xLeftBackFrame);
	}
	else{
		Swing.angles.xLeftFrontFrame += Swing.leftFrontFrameRotDir * 0.02;
		if(Swing.angles.xLeftFrontFrame > degToRad(60)) Swing.leftFrontFrameRotDir = -1;
		if(Swing.angles.xLeftFrontFrame < degToRad(-30)){
			Swing.leftFrontFrameRotDir = 1;
			Swing.leftFrameLock = 0;
		}
		Swing.inputs.xLeftFrontFrameRotation.value = radToDeg(Swing.angles.xLeftFrontFrame);
	}
	
	if(Swing.rightFrameLock == 0){
		Swing.angles.xRightBackFrame += Swing.rightBackFrameRotDir * 0.02;
		if(Swing.angles.xRightBackFrame > degToRad(60)) Swing.rightBackFrameRotDir = -1;
		if(Swing.angles.xRightBackFrame < degToRad(-30)){
			Swing.rightBackFrameRotDir = 1;
			Swing.rightFrameLock = 1;
		}
		Swing.inputs.xRightBackFrameRotation.value = radToDeg(Swing.angles.xRightBackFrame);
	}
	else{
		Swing.angles.xRightFrontFrame += Swing.rightFrontFrameRotDir * 0.02;
		if(Swing.angles.xRightFrontFrame > degToRad(60)) Swing.rightFrontFrameRotDir = -1;
		if(Swing.angles.xRightFrontFrame < degToRad(-30)){
			Swing.rightFrontFrameRotDir = 1;
			Swing.rightFrameLock = 0;
		}
		Swing.inputs.xRightFrontFrameRotation.value = radToDeg(Swing.angles.xRightFrontFrame);
	}
}