import * as THREE from '../three.js/build/three.module.js';
import { BoxHelper, CullFaceBack, MathUtils, Particle, PlaneHelper, QuadraticBezierCurve, SphereBufferGeometry, Spherical, TriangleFanDrawMode, Vector3, WireframeGeometry } from './three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from './three.js/examples/jsm/libs/dat.gui.module.js';


//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let camerazoom, EnableLightHelpers, EnableClippingHelpers, EnableClipping, clipPlanes, ClippingPlaneOfset, Div, meshIndex = [], RadiusOfDistribution, x, Trials,quantumL,quantumM,quantumN;

init();
animate();

function init() {
    /* READ ME
    De docs zijn kapot handig \/
    https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
    dit is niet eens super moeilijk
    Declare variables in de "Let"
    */

    //#region boleans and stuff for in the UI and easy acces    
    EnableLightHelpers = false;
    EnableClippingHelpers = false;
    EnableClipping = true;
    ClippingPlaneOfset = 0;
    Div="canvas";


    quantumN=3;
    quantumL=0;
    quantumM=0;
    RadiusOfDistribution = 5 * quantumN;
    Trials = 1000000 * quantumN ** 3;
    camerazoom = 2.5 / quantumN;
    let cameramin=1;
    let cameramax=1000000;
    console.log(camerazoom);
    //#endregion

    //renderer configure
    renderer = new THREE.WebGLRenderer({antialias:true, canvas: document.querySelector(Div), alpha: true}); //the renderer itself its complex go read the docs

    //define a scene
    scene = new THREE.Scene();
    scene.background = null

    //inintialize camera
    camera = new THREE.PerspectiveCamera(20, 2 / 1, cameramin, cameramax); 

    camera.position.set( 45/camerazoom, 30/camerazoom, 45/camerazoom );
    camera.lookAt( scene.position );


    //#region clipping in renderer
    if (EnableClipping) {
        
        //add in the three clipping planes that make-up the box
        clipPlanes = [
            new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), ClippingPlaneOfset )
        ];
        renderer.localClippingEnabled = true;
    }
    //#endregion

    //#region geometry
    // add an inner sphere
    const geometry = new THREE.SphereGeometry( .1, 40, 20 );
    const material = new THREE.MeshStandardMaterial( 
    {   
        color: 0x00FF00, 
        transparent: false, 
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        // clipShadows: EnableClipping
    } );
    
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    //add outer sphere
    const geometry2 = new THREE.SphereGeometry( RadiusOfDistribution, 20, 20 );
    const material2 = new THREE.MeshStandardMaterial( 
    {   
        color: 0x000000, 
        transparent: false, 
        side: THREE.DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        // clipShadows: EnableClipping,
        wireframe: true
    } );
    const mesh2 = new THREE.Mesh( geometry2, material2 );
    scene.add( mesh2 );

    //#endregion

    // add a listener so when we resize the window it updates the scene camera
    window.addEventListener( 'resize', onWindowResize );

    //#region controlls
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
    controls.autoRotateSpeed=0.3;
    //#endregion

    //#region lighting
    // enable helpers at the top to see what you're doing!

    //ambientlight
    const color = 0xffffff;
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
    //#endregion

    //#region helpers
    if (EnableLightHelpers == true)
    {   //light visualizers
        const helper = new THREE.BoxHelper(lightD.target, 0xFF0000 );
        scene.add(helper);

        const helperd2 = new THREE.BoxHelper(lightD2.target, 0xFF0000 );
        scene.add(helperd2);

        const helperD = new THREE.DirectionalLightHelper( lightD, 5, 0xFF0000 );
        scene.add(helperD);

        const helperD2 = new THREE.DirectionalLightHelper( lightD2, 5, 0xFF0000 );
        scene.add(helperD2);
    }

    if (EnableClippingHelpers == true)
    {       //clippingplane helpers
        const planehelpers= [
            new PlaneHelper(clipPlanes[0], 10 ,0xFF0000),
            new PlaneHelper(clipPlanes[1], 10 ,0xFF0000),
            new PlaneHelper(clipPlanes[2], 10 ,0xFF0000)      
        ];
        
        scene.add(planehelpers[0]);
        scene.add(planehelpers[1]);
        scene.add(planehelpers[2]);
    }
    //#endregion

    spawnOrbsRParticles()

}

function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  
      // set render target sizes here
    }
  }
  
function onWindowResize() {
    //make sure your window doesnt get al wonky
    //camera.aspect = Div.innerWidth / Div.innerHeight;
    camera.updateProjectionMatrix();

    //renderer.setSize( Div.innerWidth, Div.innerHeight );
}

function animate() {
    //do this for animations
    requestAnimationFrame(animate);

    //for controls if you edit it through script
    controls.update();
    resizeCanvasToDisplaySize();

    //render the scene
    renderer.render( scene, camera );
    // renderer.shadowMap.autoUpdate = false;
}


// function spawnOrbsR() {
//     const geometry = new THREE.SphereBufferGeometry(0.05, 5, 5);
//     const mat = new THREE.MeshStandardMaterial(
//             {
//                 color: 0xFF0000,
//                 transparent: false,
//                 // side: THREE.DoubleSide,
//                 clippingPlanes: clipPlanes,
//                 clipIntersection: true,
//                 // clipShadows: EnableClipping
//             }
//         );
    
//     let quantumN=3;
//     let quantumL=1;
//     let quantumM=0;
//     let bohrRadius=0.529177210903;

//     // console.log(HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius))

//     for (let X = 0; X < 100000; X++) {
        
//         var sphericalTheta = Math.random() * 2.0 * Math.PI;
//         var sphericalPhi = Math.acos(2.0 * Math.random() - 1.0);
//         var sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;
        
        
//         if (Math.random()/20<HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius)) {
//             meshIndex[x] = new THREE.Mesh(geometry,mat);
//             meshIndex[x].position.setFromSpherical(new Spherical(sphericalRadius, sphericalPhi, sphericalTheta)); //spherical coords
            
//             scene.add(meshIndex[x]); 
//         }
        

//     }
    
// }

function spawnOrbsRParticles() {

    const geometry = new THREE.BufferGeometry();
    const vertices = [];


    let bohrRadius=0.529177210903;

    const texture = new THREE.TextureLoader().load( '/ball.png' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var atbohr= HydrogenWave(1, 0, 0, bohrRadius, 1, bohrRadius) / quantumN
    console.log(atbohr)
    console.log(quantumN + " " + quantumL + " " + quantumM + " " )

    for (let X = 0; X < Trials; X++) {
    
        var sphericalPhi  = Math.random() * 2.0 * Math.PI;
        var sphericalTheta = Math.acos(2.0 * Math.random() - 1.0);
        var sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;


        if (Math.random()*atbohr<HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius)) {
            const v=new Vector3(1,1,1)
            v.setFromSpherical(new Spherical(sphericalRadius,sphericalTheta , sphericalPhi));
    
            vertices.push(v.x,v.y,v.z); 
        }
    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const material = new THREE.PointsMaterial( {alphaTest :.5,map: texture , size: 0.1, sizeAttenuation: true, transparent: true, color: 0xff2222,clippingPlanes: clipPlanes,clipIntersection: true } );

    const particles = new THREE.Points( geometry, material );
    scene.add( particles );

    material.needsUpdate = true
}

function factorial(n) {
    if (n < 0) return;
    if (n < 2) return 1;
    return n * factorial(n - 1);
}

function doubleFactorial(n) {
    if (n < 2)
        return 1;            
        return n * doubleFactorial(n - 2);
}

function Laguerre(laguerreAlpha, laguerreK, laguerreX){
    
    let LaguerreValues = [1, 1 + laguerreAlpha - laguerreX];

    for (let LagIndex = 2; LagIndex <= laguerreK; LagIndex++) {
        LaguerreValues[LagIndex] = ((2 * laguerreK + 1 + laguerreAlpha - laguerreX) * LaguerreValues[LagIndex - 1] - (laguerreK + laguerreAlpha) * LaguerreValues[LagIndex - 2])/(laguerreK + 1);
    }
    return LaguerreValues[laguerreK]; 
}

function Legendre(LegendreL, LegendreM, LegendreX){

    let LegendreValues = [(-1) ** LegendreM * doubleFactorial(2 * LegendreM - 1) * (1 - LegendreX ** 2) ** (LegendreM / 2)];
    LegendreValues[1] = LegendreX * (2 * LegendreM + 1) * LegendreValues[0];

    for (let LegIndex = 2; LegIndex <= LegendreL - LegendreM; LegIndex++) {
        LegendreValues[LegIndex] = ((2 * LegendreL + 1) * LegendreX * LegendreValues[LegIndex - 1] - (LegendreL + LegendreM) * LegendreValues[LegIndex - 2]) / (LegendreL - LegendreM + 1)
    }
    return LegendreValues[LegendreL - LegendreM];   

}

function SphericalHarmonics(quantumM, quantumL, sphericalTheta) {

    return ((-1) ** quantumM * Math.sqrt(((2 * quantumL + 1) * factorial(quantumL - quantumM) / (4 * Math.PI) * factorial(quantumL + quantumM))) * Legendre(quantumL, Math.abs(quantumM), Math.cos(sphericalTheta))/* * Math.exp(math.sqrt(-1) * quantumM * sphericalPhi)*/)

}

function HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius) {

    return  (Math.sqrt((2 / (quantumN * bohrRadius)) ** 3 * factorial(quantumN - quantumL - 1) / (2 * quantumN * factorial(quantumN + quantumL))) * Math.exp(- sphericalRadius / (quantumN * bohrRadius)) * (2 * sphericalRadius / (quantumN * bohrRadius)) ** quantumL
            * Laguerre(2 * quantumL + 1, quantumN - quantumL - 1, 2 * sphericalRadius / (quantumN * bohrRadius))
            * SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta)) ** 2;

}