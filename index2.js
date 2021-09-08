import * as THREE from '../three.js/build/three.module.js';
import { BoxHelper, CullFaceBack, Particle, PlaneHelper, QuadraticBezierCurve, Spherical, TriangleFanDrawMode, WireframeGeometry } from './three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from './three.js/examples/jsm/libs/dat.gui.module.js';

//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let camerazoom, EnableLightHelpers, EnableClippingHelpers, BackgroundColor, EnableClipping, clipPlanes, ClippingPlaneOfset, Div, sphericalRadius, sphericalPhi, sphericalTheta, meshIndex = [], x;


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
    camerazoom = 1.5;
    EnableClipping = true;
    ClippingPlaneOfset = 0;
    Div="canvas";
    sphericalRadius = 5;
    sphericalPhi = 1.6;
    sphericalTheta = .6;
    //#endregion

    //renderer configure
    renderer = new THREE.WebGLRenderer({antialias:true, canvas: document.querySelector(Div), alpha: true}); //the renderer itself its complex go read the docs

    //define a scene
    scene = new THREE.Scene();
    scene.background = null

    //inintialize camera
    camera = new THREE.PerspectiveCamera(20, 2 / 1, 1, 1000); 

    camera.position.set( 45/camerazoom, 30/camerazoom, 45/camerazoom );
    camera.lookAt( scene.position );


    //#region clipping in renderer
    if (EnableClipping) {
        
        //add in the three clipping planes that make-up the box
        clipPlanes = [
            new THREE.Plane( new THREE.Vector3( 0, 0, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, 0, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, 0, 0 ), ClippingPlaneOfset )
        ];
        renderer.localClippingEnabled = true;
    }
    //#endregion

    //#region geometry
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
    controls.autoRotateSpeed=0;
    //#endregion

    //#region lighting
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

    spawnOrbs()

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
    renderer.shadowMap.autoUpdate =true;
}

//spawning a butt ton of orbs
function spawnOrbs() {

    x = 0;
   
   for(sphericalRadius = 0; sphericalRadius < 10; sphericalRadius++){ 
    //Radius

        for(sphericalPhi = 0; sphericalPhi < 2 * Math.PI; sphericalPhi = sphericalPhi + Math.PI/10){ 
        //Phi

            for(sphericalTheta = 0; sphericalTheta < Math.PI; sphericalTheta = sphericalTheta + Math.PI/10){ 
            //Theta

                meshIndex[x] = 
                    new THREE.Mesh( new THREE.SphereGeometry( 0.1, 5, 5 ),
                                    new THREE.MeshStandardMaterial( 
                                        {   
                                            color: 0xFF0000, 
                                            transparent: false, 
                                            side: THREE.DoubleSide,
                                            clippingPlanes: clipPlanes,
                                            clipIntersection: true,
                                            clipShadows: EnableClipping
                                        } 
                                    ) 
                                );
                scene.add( meshIndex[x] ); //adding new orb
                meshIndex[x].position.setFromSpherical(new Spherical( sphericalRadius, sphericalPhi, sphericalTheta )); //spherical coords
                x++;


            }

        }

   }

}

