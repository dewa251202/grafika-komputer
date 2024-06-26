// Lamp model configurations

class Lamp extends BaseModel {
	static configureParts(){
		const modelMatrix = () => {
			return m4.translation(Lamp.translations.x, Lamp.translations.y, Lamp.translations.z);
		}
		
		this.configurePart(this.parts[0], [255, 255, 255], [], modelMatrix);
	}
};

Lamp.translations = {
	x: 0, y: 100, z: 0
}