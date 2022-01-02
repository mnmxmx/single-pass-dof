uniform sampler2D uDiffuse;
uniform vec2 uResolution;
uniform bool uOutput;
uniform float uDirection;

varying vec2 vUv;

// use glsl-fast-gaussian-blur
// https://github.com/Jam3/glsl-fast-gaussian-blur

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction, float factor) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction * factor;
  vec2 off2 = vec2(3.2941176470588234) * direction * factor;
  vec2 off3 = vec2(5.176470588235294) * direction * factor;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction, float factor) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction * factor;
  vec2 off2 = vec2(3.2307692308) * direction * factor;
//   color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}


void main(){
    vec4 diffuse = texture2D(uDiffuse, vUv);

    float factor = diffuse.a;

    diffuse *= 0.1964825501511404; //0.2270270270;//
    diffuse += blur13(uDiffuse, vUv, uResolution, vec2(1.0, 1.0 * uDirection), factor);

    gl_FragColor = vec4(diffuse.rgb, uOutput ? 1.0 : factor);
}
