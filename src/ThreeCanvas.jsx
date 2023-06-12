import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import * as THREE from 'three';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import SceneInit from './lib/SceneInit';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

function ThreeCanvas({ asset }) {
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
    
    // Add CSS2DRenderer
    const css2DRenderer = new CSS2DRenderer();
    css2DRenderer.setSize(window.innerWidth, window.innerHeight);
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0px';
    document.body.appendChild(css2DRenderer.domElement);

    //Defining the x, y and z value for our 3D Vector
    const theta = Math.PI * (0.49 - 0.5);
    const phi = 2 * Math.PI * (0.205 - 0.5);
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    test.scene.environment = pmremGenerator.fromScene(sky).texture;
    
    // Camera params
    const controls = new OrbitControls(test.camera, css2DRenderer.domElement);
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
    const loader = new GLTFLoader();
    loader.load('./assets/'.concat(asset), (objScene) => {
      loadedModel = objScene;
      const box = new THREE.Box3().setFromObject(loadedModel.scene);
      const center = box.getCenter(new THREE.Vector3());
      loadedModel.scene.position.x += loadedModel.scene.position.x - center.x;
      loadedModel.scene.position.y += loadedModel.scene.position.y - center.y;
      loadedModel.scene.position.z += loadedModel.scene.position.z - center.z;
      loadedModel.scene.scale.set(15, 15, 15);

      water.position.y = center.y - 1.4;
      test.scene.add(water);
      
      fetch('./assets/pca_island_labels_coord.csv')
        .then(response => response.text())
        .then(csvData => {
          // Use Papa Parse to parse the CSV data
          const parsedData = Papa.parse(csvData, { header: true });

          var count = 0
          // Access the parsed data
          parsedData.data.map((val, idx) => {
            if ((idx + 1) % 100 === 0) {
              const label = new CSS2DObject(document.createElement('div'));
              var pos = new THREE.Vector3( center.x - val['X'], center.y - val['Y'], center.z - val['Z'])
              label.position.copy(pos);
              label.element.textContent = val['FaceLabels'];
              loadedModel.scene.children[0].attach(label)
            }
          })
        })
        .catch(error => console.error('Error:', error));

        test.scene.add(loadedModel.scene);

      
    });

    const animate = () => {
      controls.update();
      water.material.uniforms['time'].value += .05 / 60.0;
      renderer.render(test.scene, test.camera);
      css2DRenderer.render(test.scene, test.camera)
      requestAnimationFrame(animate);
    };

    animate();
    
  }, [asset]);
  

  return (
    <div>
      <canvas id="myThreeJsCanvas" ref={canvasRef} />
    </div>
  );
}

export default ThreeCanvas;
