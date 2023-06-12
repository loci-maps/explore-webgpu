import { React, useState } from 'react';
import ThreeCanvas from './ThreeCanvas';
import Sidebar from './Sidebar';
import '/Users/klau/Projects/loci-map/loci-visualize/src/style.css';

function App() {
  const [meshValue, setMeshValue] = useState('pca5_island.gltf');
  return (
    <div className="flex-row">
      {/* <Sidebar meshValue={meshValue} setMeshValue={setMeshValue}/> */}
      <ThreeCanvas className="w-1/2" asset={meshValue}/>
    </div>
  );
}

export default App;