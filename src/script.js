import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

const parameters={};
parameters.count=100000;
parameters.size=0.01;
parameters.radius=5;
parameters.branches=3;
parameters.spin=1;
parameters.randomness=0.02;
parameters.randomnessPower=3;
parameters.insideColor='#FD1C03';
parameters.outsideColor='#00FF00';

//This will not change bcz we use a function to generate particles and it takes
// that count & size values so we have to use callback function on finishchange
gui.add(parameters,'count').min(100).max(10000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters,'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters,'radius').min(0.02).max(15).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters,'branches').min(3).max(15).step(1).onFinishChange(generateGalaxy);
gui.add(parameters,'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters,'randomness').min(0).max(2).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters,'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters,'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters,'outsideColor').onFinishChange(generateGalaxy);
//But this gui add will constly add the particles to the scene when we chnage the no 
//of particles so we have to delete the previous particles 
//So we can do that by creating geometry,material and points outside the function

let particleGeometry=null;
let particleMaterials=null;
let points=null;

function generateGalaxy() {

    //So we can delete the previous particles by using dispose meathod
    //So we can delete the previous particls by disposing the geometry and material and removing from scene
    if(points !== null) {
        particleGeometry.dispose();
        particleMaterials.dispose();
        scene.remove(points);
    }
    
    //Geometry
     particleGeometry=new THREE.BufferGeometry();
    const positions=new Float32Array(parameters.count*3);
    const colors=new Float32Array(parameters.count*3);

    //iNSTANCE OF COLOR
    const colorInside=new THREE.Color(parameters.insideColor)
    const colorOutside=new THREE.Color(parameters.outsideColor)

  

    for(let i=0; i<parameters.count; i++){

        const i3=i*3;

        const radius=Math.random()*parameters.radius;
        //The branch angle is for the three branches of the galaxy
        const branchAngle=(i % parameters.branches)/parameters.branches*Math.PI*2
        //The spin angle is for the curve of the three branches of the galaxy
        const spinAngle=(radius* parameters.spin)


        // const randomx=(Math.random()-0.5)*parameters.randomness;
        // const randomy=(Math.random()-0.5)*parameters.randomness;
        // const randomz=(Math.random()-0.5)*parameters.randomness;

        const randomx=Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()< 0.5 ? 1: -1)
        const randomy=Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()< 0.5 ? 1: -1)
        const randomz=Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()< 0.5 ? 1: -1)

        positions[i3]=Math.sin(branchAngle + spinAngle)*radius+randomx;     //x axis
        positions[i3+1]=randomy;         //y axis
        positions[i3+2]=Math.cos(branchAngle + spinAngle)*radius+randomz;    //z axis


       //Clone of First color
       const mixcolor=colorInside.clone();
       mixcolor.lerp(colorOutside,radius/parameters.radius)

        //Color
        colors[i3]=mixcolor.r
        colors[i3+1]=mixcolor.g
        colors[i3+2]=mixcolor.b

          
    }
    particleGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
    particleGeometry.setAttribute("color",new THREE.BufferAttribute(colors,3))


    //Materials
     particleMaterials = new THREE.PointsMaterial({
        size:parameters.size,
        sizeAttenuation:true,
        depthWrite:false,
        blending: THREE.AdditiveBlending,
        vertexColors:true
    })

    //Points
     points=new THREE.Points(particleGeometry,particleMaterials);
    scene.add(points);
}
generateGalaxy();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Animate
    points.rotation.y= elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()