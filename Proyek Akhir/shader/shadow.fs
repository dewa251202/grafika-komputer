#version 300 es
precision mediump float;

in vec4 fPosition;

out vec4 FragColor;

uniform vec3 pointLightPosition;
uniform float farPlane;

void main(){
	// get distance between fragment and light source
	float lightDistance = length(fPosition.xyz - pointLightPosition);

	// map to [0;1] range by dividing by farPlane
	lightDistance /= farPlane;

	// write this as modified depth
	FragColor = vec4(lightDistance, 0.0, 0.0, 1.0);
}