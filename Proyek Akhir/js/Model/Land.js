// Land model configurations

class Land extends BaseModel {
	static configureParts(){
		const modelMatrix = () => {
			return m4.multiply(m4.translation(0, -1, 0), m4.scaling(2, 1, 2));
		}
		
		this.configurePart(this.parts[0], [], modelMatrix);
	}
}