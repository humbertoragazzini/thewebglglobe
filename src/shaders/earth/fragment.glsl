uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Orentation
    float uSunOrientation = dot(uSunDirection,normal);

    // Mixers
    float dayMix = smoothstep(-0.2,0.5,uSunOrientation);

    // Picking up the pixels of the texture
    vec3 dayColor = texture(uDayTexture,vUv).xyz;
    vec3 nightColor = texture(uNightTexture,vUv).xyz;

    // Mixing color
    color = mix(nightColor,dayColor,dayMix);

    // Specular clouds 
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).xy;
    
    // Clouds
    float cloudsMix = smoothstep(0.5,1.0,specularCloudsColor.g);
    cloudsMix *= dayMix;


    // mixing the color with the clouds
    color = mix(color,vec3(1.0),cloudsMix);
    
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}