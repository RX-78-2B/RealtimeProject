#ifdef COMPUTE_DEPTH
#extension GL_EXT_frag_depth : enable
#endif

// Inspired by https://www.cg.tuwien.ac.at/research/publications/2007/Habel_2007_IAG/Habel_2007_IAG-grass_shader.HLSL

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bladesSampler;
uniform sampler2D groundSampler;
uniform sampler2D windSampler;

uniform mat4 worldViewProjection;

// Varyings
varying vec2 vTexCoord;
varying vec2 vTexCoord2;
varying vec3 vEyeDirection;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;

// Defines
const int MAX_RAYDEPTH = 19;
const float PLANE_NUM_INV = (1.0 / PLANE_NUM);
const float PLANE_NUM_INV_DIV2 = (PLANE_NUM_INV / 2.0);
const float GRASS_SLICE_NUM_INV = (1.0 / GRASS_SLICE_NUM);
const float GRASS_SLICE_NUM_INV_DIV2 = GRASS_SLICE_NUM_INV / 2.0;
const float GRASSDEPTH = GRASS_SLICE_NUM_INV;
const float TC1_TO_TC2_RATIO = 8.0;
const float PREMULT = (GRASS_SLICE_NUM_INV * PLANE_NUM);
const vec4 AVERAGE_COLOR = vec4(0.32156, 0.513725, 0.0941176, 1.0);
	
void main()
{
	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	
	vec2 planeOffset = vec2(0.0, 0.0);
	vec3 ray = vec3(vTexCoord.xy, 0.0);
	float zOffset = 0.0;
	bool zFlag = true;
	
	vec2 sign = vec2(sign(vEyeDirection.x), sign(vEyeDirection.y));	
 	vec2 planeCorrect = vec2((sign.x + 1.0) * GRASS_SLICE_NUM_INV_DIV2, (sign.y + 1.0) * GRASS_SLICE_NUM_INV_DIV2);
 	vec2 planeMod = vec2(floor(ray.x * PLANE_NUM) / PLANE_NUM, floor(ray.y * PLANE_NUM) / PLANE_NUM);
	vec2 preDirCorrect = vec2((sign.x + 1.0) * PLANE_NUM_INV_DIV2, (sign.y + 1.0) * PLANE_NUM_INV_DIV2);
	
	int hitCount = 0;
	vec2 orthoLookup = vec2(0.0, 0.0);
	
	for(int hitcount = 0; hitcount < MAX_RAYDEPTH; hitcount++)
	{
		vec2 dirCorrect = vec2(sign.x * planeOffset.x + preDirCorrect.x, sign.y * planeOffset.y + preDirCorrect.y);			
		vec2 distance = vec2((planeMod.x + dirCorrect.x - ray.x) / (vEyeDirection.x), (planeMod.y + dirCorrect.y - ray.y) / (vEyeDirection.y));
 					
 		vec3 rayHitpointX = ray + vEyeDirection * distance.x;   
  		vec3 rayHitpointY = ray + vEyeDirection * distance.y;
		  
		if ((rayHitpointX.z <= -GRASSDEPTH) && (rayHitpointY.z <= -GRASSDEPTH)) 	
		{
			float distanceZ = (-GRASSDEPTH) / vEyeDirection.z;
			vec3 rayHitpointZ = ray + vEyeDirection * distanceZ;
			vec2 orthoLookupZ = vec2(rayHitpointZ.x, rayHitpointZ.y);
			
			color = (color) + ((1.0 - color.w) * texture2D(groundSampler, orthoLookupZ));
			
			if (zFlag == true)
				zOffset = distanceZ;
				
			zFlag = false;
		}
		else
		{
			if(distance.x <= distance.y)
 			{
 				vec4 windX = (texture2D(windSampler, vTexCoord2 + rayHitpointX.xy / TC1_TO_TC2_RATIO) - 0.5) / 2.0;
				
				float lookupX = -(rayHitpointX.z + (planeMod.x + sign.x * planeOffset.x) * PREMULT) - planeCorrect.x;
				orthoLookup = vec2(rayHitpointX.y + windX.x * (GRASSDEPTH + rayHitpointX.z), lookupX); 
				
				planeOffset.x += PLANE_NUM_INV;
				
				if(zFlag == true)
					zOffset = distance.x;
			}
			else
			{
				vec4 windY = (texture2D(windSampler,vTexCoord2 + rayHitpointY.xy / TC1_TO_TC2_RATIO) - 0.5) / 2.0;
				
				float lookupY = -(rayHitpointY.z + (planeMod.y + sign.y * planeOffset.y) * PREMULT) - planeCorrect.y;
				orthoLookup = vec2(rayHitpointY.x + windY.y * (GRASSDEPTH + rayHitpointY.z), lookupY);
 			
				planeOffset.y += PLANE_NUM_INV;
				
				if (zFlag == true)
					zOffset = distance.y;
				
                color += (1.0 - color.w) * texture2D(bladesSampler, orthoLookup);
  			}
  			 
 	 		color += (1.0 - color.w) * texture2D(bladesSampler, orthoLookup);
 	
 	 		if (color.w >= 0.49)
				zFlag = false;
		}
	}
	
	color += (1.0 - color.w) * texture2D(groundSampler, orthoLookup);
	color.xyz *= dot(vLightDirection, vNormal);
	
	#ifdef COMPUTE_DEPTH
    vec4 positionView = vPosition + worldViewProjection * vec4(vEyeDirection.xzy * zOffset, 1.0);
    gl_FragDepthEXT = positionView.z / positionView.w;
	#endif
	
	gl_FragColor = color;	
}

