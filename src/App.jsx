
import { useRef } from 'react';
import './App.css'
import * as three from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import { useEffect } from 'react';


function App() {
 
  const canvasRef= useRef(null);

  useEffect(() => {

  //initialize scene
  const scene = new three.Scene();

  //add textureLoader
  const textureLoader = new three.TextureLoader();
  const cubeTextureLoader = new three.CubeTextureLoader();
  cubeTextureLoader.setPath('/cube-map/');

  //add geometry
  const SphereGeometry = new three.SphereGeometry(1, 32, 32)
  
  //adding texture
  const sunTexture = textureLoader.load('/2k_sun.jpg');
  const moomTexture = textureLoader.load('/2k_moon.jpg');
  const earthTexture = textureLoader.load('/2k_earth_daymap.jpg');
  const venusTexture = textureLoader.load('/2k_venus.jpg');
  const mercuryTexture = textureLoader.load('/2k_mercury.jpg');
  const marsTexture = textureLoader.load('/2k_mars.jpg');

  //scene background
  const background = cubeTextureLoader.load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
  ]);

  scene.background=background;

  //add materials
  const mercurymaterial = new three.MeshStandardMaterial({map:mercuryTexture})
  const venusmaterial = new three.MeshStandardMaterial({map:venusTexture})
  const earthmaterial = new three.MeshStandardMaterial({map:earthTexture})
  const marsmaterial = new three.MeshStandardMaterial({map:marsTexture})
  const moonMaterial = new three.MeshStandardMaterial({map:moomTexture})
  
  //planets
  const planets = [
      {
        name: 'mercury',
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        material: mercurymaterial,
        moons: []
      },
      {
        name: 'venus',
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        material: venusmaterial,
        moons: []
      },
      {
        name: 'earth',
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthmaterial,
        moons: [
          {
            name: 'moon',
            radius: 0.3,
            distance: 3,
            speed: 0.015,
          }
        ]
      },
      {
        name: 'mars',
        radius: 0.2,
        distance: 25,
        speed: 0.003,
        material: marsmaterial,
        moons: [
          {
            name: 'phobo',
            radius: 0.1,
            distance: 2,
            speed: 0.02,
          },
          {
            name: 'deims',
            radius: 0.2,
            distance: 3,
            speed: 0.015,
            color: 0xffffff
          },
        ]
      },
  ]

  const planetMeshes = planets.map((planet)=>{
    //create mesh
    const planetMesh = new three.Mesh(
      SphereGeometry,
      planet.material
    );
    planetMesh.scale.setScalar(planet.radius);
    planetMesh.position.x = planet.distance;
    
    //add to scene
    scene.add(planetMesh);

    //loop moon and create moon
    planet.moons.forEach((moon)=>{

      const moonMesh = new three.Mesh(
        SphereGeometry,
        moonMaterial
      );

      moonMesh.scale.setScalar(moon.radius);
      moonMesh.position.x = moon.distance;

      //add moon to planet
      planetMesh.add(moonMesh);
    });

    return planetMesh;
  
  })
 
  
  const sunMaterial = new three.MeshBasicMaterial({map:sunTexture});
  const sun = new three.Mesh(SphereGeometry,sunMaterial);
  sun.scale.setScalar(5);
  
  
  
  //adding to scene
  scene.add(sun);


  //initialize light
  const light = new three.AmbientLight(0xffffff,0.3);
  const pointLight = new three.PointLight(0xffffff,1000);
    scene.add(light);
    scene.add(pointLight);

  //initialize camera
  const camera = new three.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,300);
  camera.position.z =100;
  camera.position.y=5;

  //renderer
  const renderer = new three.WebGLRenderer({canvas:canvasRef.current,antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);

  //add controls

  const controls = new OrbitControls(camera,canvasRef.current);
  controls.enableDamping = true;
  controls.autoRotate = false;

     
    const animateFrame = ()=>{

      planetMeshes.forEach((planet,indx)=>{
        planet.rotation.y += planets[indx].speed;
        planet.position.x = Math.sin(planet.rotation.y)* planets[indx].distance
        planet.position.z = Math.cos(planet.rotation.y)* planets[indx].distance

        //moon
        planet.children.forEach((moon,moonIndx)=>{
          moon.rotation.y += planets[indx].moons[moonIndx].speed;
          moon.position.x = Math.sin(moon.rotation.y) * planets[indx].moons[moonIndx].distance
          moon.position.z = Math.cos(moon.rotation.y) * planets[indx].moons[moonIndx].distance
        })
      })

      requestAnimationFrame(animateFrame);
      controls.update();
      renderer.render(scene,camera)
    }

    animateFrame();

    //resize
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', resize);

    // Cleanup on unmount
    return () => {
      renderer.dispose();
      window.removeEventListener('resize', resize);
    };

  },[])
  return (
    <canvas ref={canvasRef}></canvas>
  )
}

export default App
