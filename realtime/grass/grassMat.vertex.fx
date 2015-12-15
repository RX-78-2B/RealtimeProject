#ifdef COMPUTE_DEPTH
#extension GL_EXT_frag_depth : enable
#endif

// Inspired by https://www.cg.tuwien.ac.at/research/publications/2007/Habel_2007_IAG/Habel_2007_IAG-grass_shader.HLSL

#ifdef GL_ES
precision highp float;
#endif

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform vec3 cameraPosition;
uniform float time;
uniform vec2 uvScale;
uniform vec3 lightPosition;

// Varyings
varying vec2 vTexCoord;
varying vec2 vTexCoord2;
varying vec3 vEyeDirection;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;

void main()
{
	vPosition = worldViewProjection * vec4(position, 1.0);
	gl_Position = vPosition;
	
	vTexCoord = uv;
	vTexCoord2 = vec2((uv.x + time * 0.2) / 2.0, (uv.y + time * 0.2) / 2.0);
	
	vec3 worldPosition = (world * vec4(position, 1.0)).xyz;
	vec3 eyeDirection = normalize(-(cameraPosition - worldPosition));
	
	vLightDirection = normalize(lightPosition - worldPosition);
    vNormal = normal;
	
	vec3 tangent = vec3(abs(normal.y) + abs(normal.z), abs(normal.x), 0.0);
	
	vec3 binormal = cross(tangent, normal);
	mat3 finalMatrix = mat3(tangent, binormal, normal);
	
	vEyeDirection = normalize(finalMatrix * eyeDirection);
}