#version 300 es

uniform mat4 pMatrix;
uniform mat4 mvMatrix;

in vec3 vPosition;

out vec4 fPosition;

void main(){
	fPosition = mvMatrix * vec4(vPosition, 1.0);
	gl_Position = pMatrix * fPosition;
}