// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import ThreeJSScene from './components/ThreeJSScene.jsx';


function App() {
  const [cubeProps, setCubeProps] = useState({
    width: 1,
    height: 1,
    depth: 1,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  });

// Simulación del servidor en src/App.js

const handlePostRequest = async () => {
  try {
    const response = {
      data: {
        width: 2,
        height: 2,
        depth: 2,
        position: { x: 1, y: 1, z: 1 },
        rotation: { x: 0.5, y: 0.5, z: 0 },
      }
    };

    setCubeProps(response.data);
  } catch (error) {
    console.error('Error in POST request', error);
  }
};

  return (
    <div>
      <button onClick={handlePostRequest}>Enviar POST para Crear Cubo</button>
      <ThreeJSScene cubeProps={cubeProps} />
    </div>
  );
}






export default App;
