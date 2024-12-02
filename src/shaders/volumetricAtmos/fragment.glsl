uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Orentation
    float sunOrientation = dot(uSunDirection,normal);

    // Atmospohere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
    color += atmosphereColor;

    // Alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0,0.5,edgeAlpha);
    color = vec3(edgeAlpha);

    // Day alpha
    float dayAlpha = smoothstep(-0.5,0.0, sunOrientation);

    // Apply
    float alpha = edgeAlpha * dayAlpha;

    
    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}