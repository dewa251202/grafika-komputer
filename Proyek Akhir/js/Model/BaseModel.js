class BaseModel {
	// Load model from DOM element
	static loadDom(mtlDomElementId, objDomElementId){
		const materials = MtlLoader.parseFromDom(mtlDomElementId);
		const parts = ObjLoader.parseFromDom(objDomElementId, true);
		this.load(materials, parts);
	}
	
	// Load model from URL
	static loadUrl(mtlUrl, objUrl){
		return Promise.all([
			MtlLoader.parseFromUrl(mtlUrl),
			ObjLoader.parseFromUrl(objUrl, true)
		]).then(([materials, parts]) => this.load(materials, parts));
	}
	
	// Load materials and parts
	static load(materials, parts){
		for(const [_, material] of Object.entries(materials)){
			material.diffuseMap = loadTexture(gl, material.diffuseMapUrl);
			material.specularMap = loadTexture(gl, material.specularMapUrl);
		}
		this.materials = materials;
		this.parts = parts;
		this.hasParent = [];
		this.configureParts();
		this.determineStartPartIndices();
	}
	
	// Configure all model's part
	static configureParts(defaultChildren = [], defaultModelMatrix = () => m4.identity()){
		for(let i = 0; i < this.parts.length; i++){
			this.configurePart(this.parts[i], this.childrens[i] || defaultChildren, this.modelMatrices[i] || defaultModelMatrix);
		}
	}
	
	// Find starting part to draw (in-degree = 0)
	static determineStartPartIndices(){
		this.startPartIndices = [];
		for(let i = 0; i < this.parts.length; i++){
			if(!this.hasParent[i]){
				this.startPartIndices.push(i);
			}
		}
	}
	
	// Configure color, childrens, model matrix of each part
	static configurePart(part, childrens, modelMatrix){
		part.wireframeIndices = new Uint16Array(wireframe(part.indices));
		part.indices = new Uint16Array(part.indices);
		part.material = this.materials[part.materialName];
		part.modelMatrix = modelMatrix;
		
		part.childrens = childrens;
		for(const childrenIndex of childrens){
			this.hasParent[childrenIndex] = true;
		}
	}
	
	// Traverse each model's part
	static drawPart(partIndex, matrix = m4.identity()){
		this.startDrawing(partIndex, matrix);
		this.finishDrawing(partIndex, matrix);
	}
	
	static startDrawing(partIndex, matrix){
		const part = this.parts[partIndex];
		
		// Product of matrices
		const newMatrix = m4.multiply(matrix, part.modelMatrix());
		
		if(isRenderingShadow){
			gl.uniformMatrix4fv(shadowProgram.mvMatrixUniform, false, newMatrix);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, part.positions, gl.STATIC_DRAW);
			gl.vertexAttribPointer(shadowProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
		}
		else{
			gl.uniformMatrix4fv(mainProgram.mMatrixUniform, false, newMatrix);
			
			// Fill material uniforms
			gl.uniform1f(mainProgram.materialShininessUniform, part.material.shininess);
			
			// Tell WebGL we want to affect texture unit 0
			gl.activeTexture(gl.TEXTURE0);

			// Bind the diffuse map to texture unit 0
			gl.bindTexture(gl.TEXTURE_2D, part.material.diffuseMap);

			// Tell the shader we bound the texture to texture unit 0
			gl.uniform1i(mainProgram.materialDiffuseUniform, 0);
			
			// Same, but bind specular map to texture unit 1
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, part.material.specularMap);
			gl.uniform1i(mainProgram.materialSpecularUniform, 1);
			
			// Fill buffers
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, part.positions, gl.STATIC_DRAW);
			gl.vertexAttribPointer(mainProgram.vPosition, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, part.normals, gl.STATIC_DRAW);
			gl.vertexAttribPointer(mainProgram.vNormal, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, part.textureCoords, gl.STATIC_DRAW);
			gl.vertexAttribPointer(mainProgram.vTextureCoord, 2, gl.FLOAT, false, 0, 0);
		}

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitiveType == gl.LINES ? part.wireframeIndices : part.indices, gl.STATIC_DRAW);
	
		gl.drawElements(primitiveType, primitiveType == gl.LINES ? part.wireframeIndices.length : part.indices.length, gl.UNSIGNED_SHORT, 0);
		
		// Next, go to childrens
		for(let i = 0; i < part.childrens.length; i++){
			this.drawPart(part.childrens[i], newMatrix);
		}
	}
	
	static finishDrawing(partIndex, matrix){
		
	}
	
	static draw(){
		for(const partIndex of this.startPartIndices){
			this.drawPart(partIndex);
		}
	}
}