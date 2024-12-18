import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import volumetricAtmosphereVertexShader from "./shaders/volumetricAtmos/vertex.glsl";
import volumetricAtmosphereFragmentShader from "./shaders/volumetricAtmos/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 *
 * Sun
 */
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

// Debug
const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
);

scene.add(debugSun);

/**
 * Earth
 */

// colors for atmosphere
const earthParameters = {};
earthParameters.atmosphereDayColor = "#00aaff";
earthParameters.atmosphereTwilightColor = "#ff6600";

gui.addColor(earthParameters, "atmosphereDayColor").onChange(() => {
  console.log(earthMaterial.uniforms.uAtmosphereDayColor);
  earthMaterial.uniforms.uAtmosphereDayColor.value = new THREE.Color(
    earthParameters.atmosphereDayColor
  );
  earthVolumetricMaterial.uniforms.uAtmosphereDayColor.value = new THREE.Color(
    earthParameters.atmosphereDayColor
  );
});
gui.addColor(earthParameters, "atmosphereTwilightColor").onChange(() => {
  console.log(earthMaterial.uniforms.uAtmosphereTwilightColor);
  earthMaterial.uniforms.uAtmosphereTwilightColor.value = new THREE.Color(
    earthParameters.atmosphereTwilightColor
  );
  earthVolumetricMaterial.uniforms.uAtmosphereTwilightColor.value =
    new THREE.Color(earthParameters.atmosphereTwilightColor);
});

// Loading textures
const earthDayTexture = textureLoader.load("./earth/day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 16;

const earthnightTexture = textureLoader.load("./earth/night.jpg");
earthnightTexture.anisotropy = 16;
earthnightTexture.colorSpace = THREE.SRGBColorSpace;

const specularCloudsTexture = textureLoader.load("./earth/specularClouds.jpg");
specularCloudsTexture.anisotropy = 16;

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthnightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(specularCloudsTexture),
    uSunDirection: new THREE.Uniform(sunDirection),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor)
    ),
  },
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Atmos volumetric material
const earthVolumetricMaterial = new THREE.ShaderMaterial({
  vertexShader: volumetricAtmosphereVertexShader,
  fragmentShader: volumetricAtmosphereFragmentShader,
  side: THREE.BackSide,
  transparent: true,
  uniforms: {
    uSunDirection: new THREE.Uniform(sunDirection),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor)
    ),
  },
});

// Volumetric atmos mesh
const earthVolumetric = new THREE.Mesh(earthGeometry, earthVolumetricMaterial);
earthVolumetric.scale.set(1.04, 1.04, 1.04);
scene.add(earthVolumetric);

// Update the sunPosition
const updateSun = () => {
  //Sun direction
  sunDirection.setFromSpherical(sunSpherical);
  // debug
  debugSun.position.copy(sunDirection).multiplyScalar(5);
  //uniform
  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  //uniform
  earthVolumetricMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};

// Tweak Sun
gui
  .add(sunSpherical, "phi")
  .min(0)
  .max(Math.PI * 2)
  .onChange(updateSun);
gui
  .add(sunSpherical, "theta")
  .min(0)
  .max(Math.PI * 2)
  .onChange(updateSun);

updateSun();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#000011");

// Check anisotropic filter
console.log(renderer.capabilities.getMaxAnisotropy());

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  earth.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
