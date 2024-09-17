import * as THREE from 'three';
import { InfoItem } from '../functions/utils.functions';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    border: 2px solid white;
`;

interface Baulera {
    value:number;
    name: string;
    width: number;
    height: number;
    depth: number;
    weightLimit: number;
  }

interface Props {
    w:number,
    h:number,
    bau:Baulera,
    objsCoordenadas:InfoItem[]
}

export const Scene =({w,h,bau,objsCoordenadas}:Props) =>{
    type Tupla = [number, number, number];
    const _90deg: number = Math.PI / 2;
    /*const rotation: { [key: number]: Tupla } = {
        0: [0, _90deg, _90deg],
        1: [_90deg, 0, _90deg],
        2: [_90deg, _90deg, 0],
        3: [_90deg, 0, 0],
        4: [0, _90deg, 0],
        5: [0, 0, _90deg]
    };*/
    /*RT_WHD = 0
    RT_HWD = 1
    RT_HDW = 2
    RT_DHW = 3
    RT_DWH = 4
    RT_WDH = 5*/
    const rotation: { [key: number]: Tupla } = {
        0: [0, 0, 0],
        1: [0, 0, 0],
        2: [_90deg, _90deg, 0],
        3: [_90deg, 0, 0],
        4: [0, _90deg, 0],
        5: [0, 0, _90deg]
    };
    const div_width: number = w;
    const div_height: number = h;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, div_width / div_height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    const controls = new OrbitControls(camera, renderer.domElement);

    const containerRef:any = useRef(null);

    useEffect(() => {
        renderScene();

        window.addEventListener('resize', onWindowResize, false);

        return () => {
            containerRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', onWindowResize, false);
        };
    }, []);

    const renderScene = () => {
        scene.clear();

        camera.position.set(0,-5,8);
        //camera.rotation.set(0,0,0);
        //camera.fov = 75;
        //camera.aspect = div_width / div_height;
        //camera.near = 0.1;
        //camera.far = 1000;
        camera.updateProjectionMatrix();
        
        renderer.setSize(div_width, div_height);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        objsCoordenadas.map((item) => {
            const geometry = new THREE.BoxGeometry(item.width, item.height, item.depth);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const edges = new THREE.EdgesGeometry(geometry);
            const edge_line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfff }));
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.position.set(item.pX, item.pY, item.pZ + item.height / 2);
            cube.rotation.set(rotation[item.rt][0], rotation[item.rt][1], rotation[item.rt][2]);
            cube.add(edge_line);
            scene.add(cube);
        });

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-3, -3, 4);
        light.castShadow = true;
        scene.add(light);

        //renderizado de plano 
        const planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.position.set(0, 0, 0);
        scene.add(plane);

        //renderizado de borde blanco de baulera
        const geometry = new THREE.BoxGeometry(bau.width, bau.height, bau.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0xfff, wireframe:true });
        //const edges = new THREE.EdgesGeometry(geometry);
        //const edge_line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfff,linewidth:4 }));
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.position.set(0, 0,bau.height/2);
        cube.rotation.set(0,0,0);
        //cube.add(edge_line);
        scene.add(cube);
        


        renderer.render(scene, camera);
        animate();
    };

    const onWindowResize = () => {
        camera.aspect = div_width / div_height;
        camera.updateProjectionMatrix();
        renderer.setSize(div_width, div_height);
    };

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };

    return(<Container ref={containerRef}></Container>);
};
