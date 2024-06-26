#version 300 es
precision mediump float;

// Taken from learnopengl.com
struct Material {
	sampler2D diffuse;
	sampler2D specular;
	
	float shininess;
};

struct DirLight {
	vec3 direction;
  
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct PointLight {
	vec3 position;
	
	float constant;
	float linear;
	float quadratic;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct SpotLight {
	vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

	float constant;
	float linear;
	float quadratic;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

in vec3 fPosition;
in vec3 fNormal;
in vec2 fTextureCoord;

out vec4 FragColor;

uniform samplerCube shadowSampler;
uniform float farPlane;
uniform vec3 viewPosition;
uniform Material material;
uniform DirLight dirLight;
uniform PointLight pointLight;
uniform SpotLight spotLight;

bool inShadow(void){
	vec3 fragToLight = fPosition.xyz - pointLight.position; 
	float closestDepth = texture(shadowSampler, fragToLight).r;
	closestDepth *= farPlane;
	float currentDepth = length(fragToLight);
	// now test for shadows
	float bias = 0.3; 
	return (currentDepth - bias > closestDepth);
}

vec3 calcDirLight(DirLight light, vec3 normal, vec3 viewDirection){
	vec3 lightDirection = normalize(-light.direction);
	
	// diffuse shading
	float diff = max(dot(normal, lightDirection), 0.0);
	
	// specular shading
	vec3 reflectDirection = reflect(-lightDirection, normal);
	float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), material.shininess);
	
	// combine results
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, fTextureCoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, fTextureCoord));
	vec3 specular = light.specular * spec * vec3(texture(material.specular, fTextureCoord));
	return (ambient + diffuse + specular);
}

vec3 calcPointLight(PointLight light, vec3 normal, vec3 viewDirection){
	vec3 lightDirection = normalize(light.position - fPosition);
	
	// diffuse shading
	float diff = max(dot(normal, lightDirection), 0.0);
	
	// specular shading
	vec3 reflectDirection = reflect(-lightDirection, normal);
	float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), material.shininess);
	
	// attenuation
	float distance = length(light.position - fPosition);
	float attenuation = 1.0/(light.constant + light.linear * distance + light.quadratic * (distance * distance)); 
	
	// combine results
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, fTextureCoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, fTextureCoord));
	vec3 specular = light.specular * spec * vec3(texture(material.specular, fTextureCoord));
	
	if(inShadow()){
		diffuse = vec3(0.0);
		specular = vec3(0.0);
	}

	ambient *= attenuation;
	diffuse *= attenuation;
	specular *= attenuation;

	return (ambient + diffuse + specular);
}

vec3 calcSpotLight(SpotLight light, vec3 normal, vec3 viewDirection){
	vec3 lightDirection = normalize(light.position - fPosition);
	
	// diffuse shading
	float diff = max(dot(normal, lightDirection), 0.0);
	
	// specular shading
	vec3 reflectDirection = reflect(-lightDirection, normal);
	float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), material.shininess);
	
	// attenuation
	float distance = length(light.position - fPosition);
	float attenuation = 1.0/(light.constant + light.linear * distance + light.quadratic * (distance * distance)); 
	
	// spotlight intensity
	float theta = dot(lightDirection, normalize(-light.direction));
	float epsilon = light.cutOff - light.outerCutOff;
	float intensity = clamp((theta - light.outerCutOff)/epsilon, 0.0, 1.0);
	
	// combine results
	vec3 ambient = light.ambient * vec3(texture(material.diffuse, fTextureCoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, fTextureCoord));
	vec3 specular = light.specular * spec * vec3(texture(material.specular, fTextureCoord));
	ambient *= attenuation * intensity;
	diffuse *= attenuation * intensity;
	specular *= attenuation * intensity;

	return (ambient + diffuse + specular);
}

void main(){
	vec3 viewDirection = normalize(viewPosition - fPosition);
	vec3 normal = normalize(fNormal);
	
	vec3 result = calcDirLight(dirLight, normal, viewDirection);
	result += calcPointLight(pointLight, normal, viewDirection);
	result += calcSpotLight(spotLight, normal, viewDirection);
	
	FragColor = vec4(result, 1.0);
}