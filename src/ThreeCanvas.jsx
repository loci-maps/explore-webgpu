import { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import SceneInit from './lib/SceneInit';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

function ThreeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();
  
    const canvas = canvasRef.current;
  
    // Add renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);
  
    // Add sky
    const sky = new Sky();
    sky.scale.setScalar(450000);
    sky.material.uniforms['mieCoefficient'].value = 0.01
    sky.material.uniforms['mieDirectionalG'].value = 0.5
    test.scene.add(sky);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sun = new THREE.Vector3();
  
    //Defining the x, y and z value for our 3D Vector
    const theta = Math.PI * (0.49 - 0.5);
    const phi = 2 * Math.PI * (0.205 - 0.5);
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);
  
    sky.material.uniforms['sunPosition'].value.copy(sun);
    test.scene.environment = pmremGenerator.fromScene(sky).texture;
  
    // Camera params
    const controls = new OrbitControls(test.camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controls.minDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 0;
  
    // Add water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('./assets/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        alpha: 1.0,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xfa5f55,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: test.scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;

    let loadedModel;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./assets/pca5_island.gltf', (gltfScene) => {
      loadedModel = gltfScene;
      const box = new THREE.Box3().setFromObject(loadedModel.scene);
      const center = box.getCenter(new THREE.Vector3());
  
      loadedModel.scene.position.x += loadedModel.scene.position.x - center.x;
      loadedModel.scene.position.y += loadedModel.scene.position.y - center.y;
      loadedModel.scene.position.z += loadedModel.scene.position.z - center.z;
      loadedModel.scene.scale.set(15, 15, 15);

      water.position.y = center.y - 1.4;
      test.scene.add(water);
      test.scene.add(loadedModel.scene);
    });
  
    const animate = () => {
      controls.update();
      water.material.uniforms['time'].value += .05 / 60.0;
      renderer.render(test.scene, test.camera);
      requestAnimationFrame(animate);
    };
  
    animate();
  }, []);
  

  return (
    <div className="w-1/2 h-1/2">
      <canvas id="myThreeJsCanvas" className="h-1/2 w-1/2" ref={canvasRef} />
    </div>
  );
}

export default ThreeCanvas;
