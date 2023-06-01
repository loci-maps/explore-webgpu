import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneInit from './lib/SceneInit';

function ThreeCanvas() {
  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    let loadedModel;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./assets/test.gltf', (gltfScene) => {
      loadedModel = gltfScene;
      gltfScene.scene.position.x = 1;
      gltfScene.scene.position.y = 1;
      gltfScene.scene.scale.set(1, 1, 1);
      test.scene.add(gltfScene.scene);
    });

    const animate = () => {
      if (loadedModel) {
        loadedModel.scene.rotation.x += 0.01;
        loadedModel.scene.rotation.y += 0.01;
        loadedModel.scene.rotation.z += 0.01;
      }
      requestAnimationFrame(animate);
    };
  }, []);

  return (
    <div className="w-1/2 h-1/2">
      <canvas id="myThreeJsCanvas" className="h-1/2 w-1/2" />
    </div>
  );
}

export default ThreeCanvas;
