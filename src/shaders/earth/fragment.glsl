uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Orentation
    vec3 uSunDirection = vec3(0.0,0.0,1.0);
    float uSunOrientation = dot(uSunDirection,normal);
    color = vec3(uSunOrientation);

    // // Picking up the pixels of the texture
    vec3 dayColor = texture(uDayTexture,vUv).xyz;
    vec3 nightColor = texture(uNightTexture,vUv).xyz;

    // We mix the colors depending on a direction
    // vec3 mixedTextures = dot(dayColor)
    float mixedTexturesNight = dot(nightColor,color);
    float mixedTexturesDay = -dot(dayColor,color);
    nightColor *= vec3(mixedTexturesNight);
    dayColor *= vec3(mixedTexturesDay);
    vec3 final = nightColor + dayColor;
    
    // Final color
    gl_FragColor = vec4(final, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}