// PointLight model configurations

class PointLight extends BaseModel {
	static configureParts(){
		const modelMatrix = () => {
			return m4.multiply(m4.translation(PointLight.translations.x, PointLight.translations.y, PointLight.translations.z), m4.scaling(1/2, 1/2, 1/2));
		}
		
		this.configurePart(this.parts[0], [], modelMatrix);
	}
	
	static startDrawing(partIndex, matrix){
		const part = this.parts[partIndex];
		
		// Product of matrices
		const newMatrix = m4.multiply(matrix, part.modelMatrix());
		gl.uniformMatrix4fv(lampProgram.mMatrixUniform, false, newMatrix);
		
		// Fill buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, part.positions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(lampProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
		
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitiveType == gl.LINES ? part.wireframeIndices : part.indices, gl.STATIC_DRAW);
		
		gl.drawElements(primitiveType, primitiveType == gl.LINES ? part.wireframeIndices.length : part.indices.length, gl.UNSIGNED_SHORT, 0);
	}
};

PointLight.translations = {
	x: 0, y: 100, z: 0
}