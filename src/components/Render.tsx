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
    //type Tupla = [number, number, number];
    const _90deg: number = Math.PI / 2;
   
    const rotation:{[key: number] : string} = {
        0: 'RT_WHD',
        1: 'RT_HWD',
        2: 'RT_HDW',
        3: 'RT_DHW',
        4: 'RT_DWH',
        5: 'RT_WDH'
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

        camera.position.set(3,5,8);
        //camera.rotation.set(0,0,0);
        //camera.fov = 75;
        //camera.aspect = div_width / div_height;
        //camera.near = 0.1;
        //camera.far = 1000;
        camera.updateProjectionMatrix();
        
        renderer.setSize(div_width, div_height);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        //Desplazamientos de posicion en base al 1er objeto en la posicion (0,0,0)
        /*let desp_x :number = 0;
        let desp_y :number = 0;
        let desp_z :number = 0;
        if(objsCoordenadas.length!==0){
            desp_x = objsCoordenadas[0].width/2;
            desp_y = objsCoordenadas[0].depth/2;
            desp_z = objsCoordenadas[0].height/2;
        }*/

        objsCoordenadas.map((item) => {
            let dimension = [0, 0, 0];
            const W = item.width;
            const H = item.height;
            const D = item.depth;
            let position = [0,0,0];
            const pW = item.pX;
            const pH = item.pY;
            const pD = item.pZ;
            
            position = [pW,pH,pD];
            switch(rotation[item.rt]){
                case 'RT_WHD':
                    dimension = [W,H,D];
                    //position = [pW,pH,pD];
                    break;
                case 'RT_HWD':
                    /*dimension = [D,W,H];
                    position = [pW,pD,pH];*/
                    dimension = [H,W,D];
                    //position = [pH,pW,pD];
                    break;
                case 'RT_HDW':
                    dimension = [H,D,W];
                    //position = [pH,pD,pW];
                    break;
                case 'RT_DHW':
                    dimension = [D,H,W];
                    //position = [pD,pH,pW];
                    break;
                case 'RT_DWH':
                    dimension = [D,W,H];
                    //position = [pD,pW,pH];
                    break;
                case 'RT_WDH':
                    dimension = [W,D,H];
                   // position = [pW,pD,pH];
                    break;
            }
            console.log(rotation[item.rt]+'-('+item.rt+')');


            const geometry = new THREE.BoxGeometry(dimension[0], dimension[1], dimension[2]);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const edges = new THREE.EdgesGeometry(geometry);
            const edge_line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfff }));
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            // p__cube = (position real + AjustePivot - AjusteBaulera)
            const pX_cube =( position[0] + (dimension[0]/2) -(bau.width/2));
            const pY_cube =( position[1] + (dimension[1]/2) );
            const pZ_cube =( position[2] + (dimension[2]/2) -(bau.depth/2));
            console.log('N: ' + item.name + '\npX:' + item.pX+ '\npY:' + item.pY+ '\npZ:' + item.pZ);
            cube.position.set(pX_cube,pY_cube,pZ_cube);
            //cube.rotation.set(rotation[item.rt][0], rotation[item.rt][1], rotation[item.rt][2]);
            cube.add(edge_line);
            scene.add(cube);
        });

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-3, 3, 4);
        light.castShadow = true;
        scene.add(light);

        //renderizado de plano 
        const planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.position.set(0, 0, 0);
        plane.rotateX(-_90deg);
        scene.add(plane);

        //renderizado de borde blanco de baulera
        const geometry = new THREE.BoxGeometry(bau.width, bau.height, bau.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0xfff, wireframe:true });
        //const edges = new THREE.EdgesGeometry(geometry);
        //const edge_line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfff,linewidth:4 }));
        const baulera = new THREE.Mesh(geometry, material);
        baulera.castShadow = true;
        baulera.position.set(0,bau.height/2,0);
        //baulera.rotation.set(0,0,0);
        //baulera.add(edge_line);
        scene.add(baulera);
        
        //Helpers
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );
        const size = 10;
        let divisions = 10;
        const gridHelper = new THREE.GridHelper( size, divisions );
        scene.add( gridHelper );


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
