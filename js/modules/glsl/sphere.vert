
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFogDepth;

void main(){
    vNormal = normalize(vec4(normal, 0.0).xyz);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vec4 viewPosition = viewMatrix * worldPosition;
    vFogDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;

}