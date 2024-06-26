class BaseModel {
	// Load model from DOM element ID
	static load(domElementId){
		const parts = ObjLoader.parseFromDom(domElementId, false);

		this.parts = parts;
		this.configureParts();
	}
	
	// Configure all model's part
	static configureParts(){
		for(let i = 0; i < this.parts.length; i++){
			this.configurePart(this.parts[i], this.colors[i], this.childrens[i], this.modelMatrices[i]);
		}
	}
	
	// Configure color, childrens, model matrix of each part
	static configurePart(part, color, childrens, modelMatrix){
		part.childrens = childrens;
		part.verticesCount = Math.floor(part.positions.length/3);
		part.colors = [];
		for(let i = 0; i < part.verticesCount; i++){
			part.colors.push(...color);
		}
		part.modelMatrix = modelMatrix;
	}
	
	// Traverse each model's part
	static draw(partIndex, matrix = m4.identity()){
		const part = this.parts[partIndex];
		
		// Product of matrices
		const newMatrix = m4.multiply(matrix, part.modelMatrix());
		gl.uniformMatrix4fv(mMatrixLocation, false, newMatrix);
		
		// To calculate new normal vector used by diffuse light
		let transposeInvModelMatrix = m4tom3(m4.transpose(m4.inverse(newMatrix)));
		gl.uniformMatrix3fv(transposeInvModelMatrixLocation, false, transposeInvModelMatrix);
		
		// Fill buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.positions), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.normals), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(part.colors), gl.STATIC_DRAW);
		
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(part.indices), gl.STATIC_DRAW);
		
		gl.drawElements(gl.TRIANGLES, part.indices.length, gl.UNSIGNED_SHORT, 0);
		
		// Next, go to childrens
		for(let i = 0; i < part.childrens.length; i++){
			this.draw(part.childrens[i], newMatrix);
		}
	}
}