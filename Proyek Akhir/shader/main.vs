#version 300 es

uniform mat4 pMatrix;
uniform mat4 vMatrix;
uniform mat4 mMatrix;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTextureCoord;

out vec3 fPosition;
out vec3 fNormal;
out vec2 fTextureCoord;

void main(){
	fPosition = vec3(mMatrix * vec4(vPosition, 1.0));
	fNormal = mat3(transpose(inverse(mMatrix))) * vNormal;
	fTextureCoord = vTextureCoord;
	
	gl_Position = pMatrix * vMatrix * vec4(fPosition, 1.0);
}