// envmap of equiarectangular
// http://www.pocketgl.com/reflections/

uniform vec3 uLightPos;
uniform vec3 uColor;
uniform vec3 uShadowColor;
uniform vec3 uCameraPos;
uniform sampler2D uEnvMap;
uniform float uFocus;
uniform float uFocusRange;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uBgColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vFogDepth;

const float PI = 3.14159265359;
#define saturate(a) clamp( a, 0.0, 1.0 )

void main(){
    float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);
    float light = dot(normalize(uLightPos), vNormal) * 0.5 + 0.5;

    vec3 color = uColor;
    vec3 shadowColor = color * color * 0.35 + uShadowColor * 0.65;

    vec3 viewVec = normalize(vPosition - uCameraPos);
    vec3 reflectVec = normalize(reflect(viewVec, vNormal));

    vec2 envUv;
    envUv.y = saturate( reflectVec.y * 0.5 + 0.5 );
	envUv.x = atan( -reflectVec.z, -reflectVec.x ) * (1.0 / (2.0 * PI)) + 0.5;

    vec4 envDiffuse = texture2D(uEnvMap, envUv);

    light = light * 0.6 + min(4.0, envDiffuse.r) * 0.5;

    color = mix(shadowColor, color, light);
    color = mix(color, uBgColor * 0.1 + color * 0.9, fogFactor);

    gl_FragColor = vec4(color, fogFactor);
}