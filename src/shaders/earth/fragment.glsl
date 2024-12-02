uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Orentation
    float sunOrientation = dot(uSunDirection,normal);

    // Mixers
    float dayMix = smoothstep(-0.2,0.5,sunOrientation);

    // frenel 
    float frenel = dot(viewDirection,normal) + 1.0;
    frenel = pow(frenel, 2.3);

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

    // Atmospohere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
    color = mix(color,atmosphereColor,frenel * atmosphereDayMix);

    // specular
    vec3 reflection = reflect(-uSunDirection,normal);
    float specular = -dot(reflection,viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular,32.0);
    color = vec3(specular);
    
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}