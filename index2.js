import * as THREE from '../three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';

//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let camerazoom;


init();
animate();

function init() {
    
    //define a scene
    scene = new THREE.Scene();
    
    //inintialize camera
    camerazoom = 1.5;
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000); 
    camera.position.set( 45/camerazoom, 30/camerazoom, 45/camerazoom );
    camera.lookAt( scene.position );

    //renderer configure
    renderer = new THREE.WebGLRenderer({antialias:true}); 
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff, 1);
    document.body.appendChild( renderer.domElement );

    // add a cube
    const geometry = new THREE.BoxGeometry( 5, 5, 5 );
    const material = new THREE.MeshBasicMaterial( { color: 0x83f52c, transparent: false } );
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // add a listener so when we resize the window it updates the scene camera
    window.addEventListener( 'resize', onWindowResize );

    //controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window );
    controls.enableDamping =true;
    controls.dampingFactor = 0.5;

    controls.screenSpacePanning=true;
    
    controls.minDistance = 20;
    controls.maxDistance = 200;

    controls.enablePan=false;
    controls.autoRotate=true;
    controls.autoRotateSpeed=1;

    //lighting

    //ambientlight
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
    

    //directional light
    const colorD = 0xFFFFFF;
    const intensityD = 1;
    const lightD = new THREE.DirectionalLight(colorD, intensityD);
    lightD.position.set(0, 10, 0);
    lightD.target.position.set(-5, 0, 0);
    scene.add(lightD);
    scene.add(lightD.target);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    //do this before animations
    requestAnimationFrame(animate);

    //require controls after manual override
    controls.update();

    //render the scene
    renderer.render( scene, camera );
}