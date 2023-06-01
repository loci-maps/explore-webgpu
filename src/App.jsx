import React from 'react';
import ThreeCanvas from './ThreeCanvas';
import Sidebar from './Sidebar';
import '/Users/klau/Projects/loci-map/loci-visualize/src/style.css';

function App() {
  return (
    <div className="flex-row">
      <Sidebar />
      <ThreeCanvas />
    </div>
  );
}

export default App;