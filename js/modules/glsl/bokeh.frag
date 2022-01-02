uniform sampler2D uDiffuse;
uniform vec2 uResolution;
uniform bool uOutput;
uniform float uDirection;
uniform bool uBlur;

varying vec2 vUv;

float factor;

// use glsl-fast-gaussian-blur
// https://github.com/Jam3/glsl-fast-gaussian-blur

// change blur weight depends according to fogFactor
vec3 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec3 color = vec3(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;

  vec4 color0 = texture2D(image, vUv);
  vec4 color1 = texture2D(image, uv + (off1 / resolution));
  vec4 color2 = texture2D(image, uv - (off1 / resolution));
  vec4 color3 = texture2D(image, uv + (off2 / resolution));
  vec4 color4 = texture2D(image, uv - (off2 / resolution));

  factor = color0.a;

  float weight1 = color1.a * factor * 0.3162162162;
  float weight2 = color2.a * factor * 0.3162162162;
  float weight3 = color3.a * factor * 0.0702702703;
  float weight4 = color4.a * factor* 0.0702702703;

  color += color1.rgb * weight1;
  color += color2.rgb * weight2;
  color += color3.rgb * weight3;
  color += color4.rgb * weight4;

  color += color0.rgb * (1.0 - (weight1 + weight2 + weight3 + weight4));
  return uBlur ? color : color0.rgb;
}

void main(){
    vec3 color = vec3(0.0);
    color += blur9(uDiffuse, vUv, uResolution, vec2(1.0, 1.0 * uDirection));

    gl_FragColor = vec4(color, uOutput ? 1.0 : factor);
}