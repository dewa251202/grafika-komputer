// Pine model configurations

class Pine extends BaseModel {
	
};

Pine.childrens = [
	[],		// Top Branch
	[0],	// Middle Branch
	[1],	// Bottom Branch
	[2],	// Trunk
];

Pine.modelMatrices = [
	() => {
		return m4.identity();
	},
	() => {
		return m4.identity();
	},
	() => {
		return m4.identity();
	},
	() => {
		return m4.multiply(m4.translation(Pine.translations.x, 0, Pine.translations.z), m4.scaling(6, 6, 6));
	}
];

Pine.translations = {
	x: 50, z: 50
}

Pine.inputs = {};

Pine.configureEventListeners = () => {
	Pine.inputs.xTrunkTranslation = document.getElementById("pine-translation-x");
	Pine.inputs.xTrunkTranslation.addEventListener("input", function(){ Pine.translations.x = parseInt(this.value); });
	
	Pine.inputs.zTrunkTranslation = document.getElementById("pine-translation-z");
	Pine.inputs.zTrunkTranslation.addEventListener("input", function(){ Pine.translations.z = -parseInt(this.value); });
}