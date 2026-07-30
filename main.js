import * as THREE from 'three';

// ----------------------------------------------------
// THREE.JS FLUID GRADIENT BACKGROUND
// ----------------------------------------------------

const container = document.getElementById('webgl-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Shader Material
// Creating a fluid, colorful gradient using a fragment shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  // Modulo 289 without a division
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  // Simplex noise
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Create moving noise coordinates
    vec2 pos = vec2(st * 2.5);
    
    // Add time for animation
    float time = u_time * 0.15;

    // FBM (Fractional Brownian Motion) base
    float q = snoise(pos + vec2(time));
    vec2 r = vec2(
      snoise(pos + vec2(q + time * 1.2, q - time * 0.8)),
      snoise(pos + vec2(q - time * 0.5, q + time * 0.7))
    );

    float noiseVal = snoise(pos + r * 2.0 + time);

    // Color palette from the Lovable screenshot
    vec3 colorBlue = vec3(0.0, 0.3, 1.0);     // Left/Top Blue
    vec3 colorPink = vec3(1.0, 0.2, 0.7);     // Middle Pink
    vec3 colorOrange = vec3(1.0, 0.4, 0.1);   // Bottom Right Orange
    vec3 colorDark = vec3(0.05, 0.05, 0.1);   // Dark Center

    // Mix colors dynamically
    vec3 color = mix(colorBlue, colorPink, clamp(noiseVal + 0.5, 0.0, 1.0));
    color = mix(color, colorOrange, clamp(r.x, 0.0, 1.0));
    
    // Create a dark center/vignette effect to make text readable
    vec2 center = vUv - 0.5;
    float dist = length(center);
    // Darken the top center area specifically
    float darkArea = smoothstep(0.1, 0.6, dist + (vUv.y * 0.3 - 0.2)); 
    
    color = mix(colorDark, color, darkArea);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2() }
};

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}
onWindowResize(); // Initialize resolution

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

animate();

// ----------------------------------------------------
// UI INTERACTION
// ----------------------------------------------------
const inputField = document.querySelector('.hero-input');
inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && inputField.value.trim() !== '') {
    alert('Comando recebido: ' + inputField.value);
    inputField.value = '';
  }
});
