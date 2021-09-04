import * as THREE from '../three.js/build/three.module.js';
import { BoxHelper, CullFaceBack, PlaneHelper, QuadraticBezierCurve, WireframeGeometry } from './three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';

//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let camerazoom, EnableHelpers, BackgroundColor, EnableClipping, clipPlanes;


init();
animate();

function init() {
    /* READ ME
    De docs zijn kapot handig \/
    https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
    dit is niet eens super moeilijk
    Declare variables in de "Let"
    */

    //boleans and stuff for in the UI and easy acces    
    EnableHelpers = true;
    camerazoom = 1.5;
    BackgroundColor = 0xffffff;
    EnableClipping = true;

    //define a scene
    scene = new THREE.Scene();
    
    //inintialize camera
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000); 
    camera.position.set( 45/camerazoom, 30/camerazoom, 45/camerazoom );
    camera.lookAt( scene.position );

    //renderer configure
    renderer = new THREE.WebGLRenderer({antialias:true}); //the renderer itself its complex go read the docs
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( BackgroundColor, 1); //background define-able above
    document.body.appendChild( renderer.domElement ); //html placement

    //clipping in renderer
    if (EnableClipping) {
        
        //add in the three clipping planes that make-up the box
        clipPlanes = [
            new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 ),
            new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 ),
            new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), 0 )
        ];
        renderer.localClippingEnabled = true;
    }

    // add an inner sphere
    const geometry = new THREE.SphereGeometry( .5, 40, 20 );
    const material = new THREE.MeshStandardMaterial( 
    {   
        color: 0xFF0000, 
        transparent: false, 
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        clipShadows: EnableClipping
    } );
    
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    //add outer sphere
    const geometry2 = new THREE.SphereGeometry( 5, 20, 20 );
    const material2 = new THREE.MeshStandardMaterial( 
    {   
        color: 0x000000, 
        transparent: false, 
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        clipShadows: EnableClipping,
        wireframe: true
    } );
    const mesh2 = new THREE.Mesh( geometry2, material2 );
    scene.add( mesh2 );


    // add a listener so when we resize the window it updates the scene camera
    window.addEventListener( 'resize', onWindowResize );

    //controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window );
    controls.enableDamping =true;
    controls.dampingFactor = 0.5;

    controls.screenSpacePanning=true;
    
    //the min and mx zoom distance on scrollwheel
    controls.minDistance = 5;
    controls.maxDistance = 200;
    //enablepan
    controls.enablePan=false;
    //automagically rotate
    controls.autoRotate=true;
    controls.autoRotateSpeed=1;

    //lighting
    // enable helpers at the top to see what you're doing!

    //ambientlight
    const color = 0xFFFFFF;
    const intensity = .5;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
    
    //directional light
    const colorD2 = 0xFFFFFF;
    const intensityD2 = .2;
    const lightD2 = new THREE.DirectionalLight(colorD2, intensityD2);
    lightD2.position.set(-5, 10, -5);
    lightD2.target.position.set(5, -5, 5);
    scene.add(lightD2);
    scene.add(lightD2.target);

    //directional light
    const colorD = 0xFFFFFF;
    const intensityD = .5;
    const lightD = new THREE.DirectionalLight(colorD, intensityD);
    lightD.position.set(5, 10, 5);
    lightD.target.position.set(-5, -5, -5);
    scene.add(lightD);
    scene.add(lightD.target);

    if (EnableHelpers == true)
    {   //light visualizers
        const helper = new THREE.BoxHelper(lightD.target, 0xFF0000 );
        scene.add(helper);


        const helperd2 = new THREE.BoxHelper(lightD2.target, 0xFF0000 );
        scene.add(helperd2);


        const helperD = new THREE.DirectionalLightHelper( lightD, 5, 0xFF0000 );
        scene.add(helperD);


        const helperD2 = new THREE.DirectionalLightHelper( lightD2, 5, 0xFF0000 );
        scene.add(helperD2);


        //clippingplane helpers
        const planehelpers= [
            new PlaneHelper(clipPlanes[0], 10 ,0xFF0000),
            new PlaneHelper(clipPlanes[1], 10 ,0xFF0000),
            new PlaneHelper(clipPlanes[2], 10 ,0xFF0000)
        ];
        
        scene.add(planehelpers[0]);
        scene.add(planehelpers[1]);
        scene.add(planehelpers[2]);
    }
    

}

function onWindowResize() {
    //make sure your window doesnt get al wonky
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    //do this for animations
    requestAnimationFrame(animate);

    //for controls if you edit it through script
    controls.update();

    //render the scene
    renderer.render( scene, camera );
    renderer.shadowMap.autoUpdate =true;
}