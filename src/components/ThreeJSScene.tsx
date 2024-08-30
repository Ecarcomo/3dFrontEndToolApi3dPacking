// src/components/ThreeJSScene.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSScene = ({ cubeProps }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const { width, height, depth, position, rotation } = cubeProps;

    // Escena
    const scene = new THREE.Scene();

    if(!mountRef.current){
      return ();
    }
    // Cámara
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    

    // Renderizador
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Geometría del cubo
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    // Posición y rotación del cubo
    cube.position.set(position.x, position.y, position.z);
    cube.rotation.set(rotation.x, rotation.y, rotation.z);

    scene.add(cube);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [cubeProps]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeJSScene;
