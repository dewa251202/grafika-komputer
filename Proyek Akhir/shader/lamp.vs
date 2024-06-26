#version 300 es

uniform mat4 pMatrix;
uniform mat4 vMatrix;
uniform mat4 mMatrix;

in vec3 vPosition;

void main(){
	gl_Position = pMatrix * vMatrix * mMatrix * vec4(vPosition, 1.0);
}