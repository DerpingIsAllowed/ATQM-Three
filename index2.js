import * as THREE from '../three.js/build/three.module.js';
import { BoxHelper, CullFaceBack, MathUtils, Particle, PlaneHelper, QuadraticBezierCurve, SphereBufferGeometry, Spherical, TriangleFanDrawMode, Vector3, WireframeGeometry } from './three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from './three.js/examples/jsm/libs/dat.gui.module.js';

//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let camerazoom, EnableLightHelpers, EnableClippingHelpers, EnableClipping, clipPlanes, ClippingPlaneOfset, Div, sphericalRadius, sphericalPhi, sphericalTheta, meshIndex = [], RadiusOfDistribution, x;

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
    camerazoom = 2.5;
    EnableClipping = true;
    ClippingPlaneOfset = 0;
    Div="canvas";
    sphericalRadius = 5;
    sphericalPhi = 1.6;
    sphericalTheta = .6;
    RadiusOfDistribution=3;
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
            new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), ClippingPlaneOfset ),
            new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), ClippingPlaneOfset )
        ];
        renderer.localClippingEnabled = true;
    }
    //#endregion

    //#region geometry
    // add an inner sphere
    const geometry = new THREE.SphereGeometry( .5, 40, 20 );
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
    const geometry2 = new THREE.SphereGeometry( 5, 20, 20 );
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
    //scene.add( mesh2 );

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

    spawnOrbsR()

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

//spawning a butt ton of orbs
function spawnOrbs() {
    const geometry = new THREE.SphereBufferGeometry(0.2, 5, 5);
    const mat = new THREE.MeshStandardMaterial(
            {
                color: 0xFF0000,
                transparent: false,
                side: THREE.DoubleSide,
                clippingPlanes: clipPlanes,
                clipIntersection: true,
                // clipShadows: EnableClipping
            }
        );

    x = 0;
    let randomizer=0.2;

    for (sphericalRadius = 0.2; sphericalRadius < 5; sphericalRadius++) {
        //Radius

        for (sphericalPhi = 0; sphericalPhi < 2 * Math.PI; sphericalPhi = sphericalPhi + Math.PI / 10) {
            //Phi

            for (sphericalTheta = 0; sphericalTheta < Math.PI; sphericalTheta = sphericalTheta + Math.PI / 10) {
                //Theta
                const sphericalRadiusA = MathUtils.randFloat(0, randomizer*2) +sphericalRadius;
                const sphericalPhiA = MathUtils.randFloat(0, randomizer) + sphericalPhi ;
                const sphericalThetaA = MathUtils.randFloat(0,randomizer) + sphericalTheta ;

                meshIndex[x] = new THREE.Mesh(geometry,mat);
                scene.add(meshIndex[x]); //adding new orb
                meshIndex[x].position.setFromSpherical(new Spherical(sphericalRadiusA, sphericalPhiA, sphericalThetaA)); //spherical coords
                x++;

            }
        }
    }
}

function spawnOrbsR() {
    const geometry = new THREE.SphereBufferGeometry(0.05, 5, 5);
    const mat = new THREE.MeshStandardMaterial(
            {
                color: 0xFF0000,
                transparent: false,
                // side: THREE.DoubleSide,
                clippingPlanes: clipPlanes,
                clipIntersection: true,
                // clipShadows: EnableClipping
            }
        );
    
    let quantumN=6;
    let quantumL=4;
    let quantumM=4;
    let bohrRadius=5.29177210903;

    let PartA=Math.sqrt(Math.pow(3, 2/(quantumN*bohrRadius))* (factorial(quantumN-quantumL-1)/2*quantumN*Math.abs(factorial(quantumN+quantumL))));
    console.log(PartA);

    let PartB =Laguerre(2*quantumL+1,quantumN-quantumL-1,(2*sphericalRadius)/(quantumN*bohrRadius));
    console.log(PartB);

    console.log(Legendre(quantumL, Math.abs(quantumM), Math.cos(1)))

    for (let X = 0; X < 10000; X++) {
        
        sphericalTheta = Math.random() * 2.0 * Math.PI;
        sphericalPhi = Math.acos(2.0 * Math.random() - 1.0);
        sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;

        let P =

        meshIndex[x] = new THREE.Mesh(geometry,mat);
        meshIndex[x].position.setFromSpherical(new Spherical(sphericalRadius, sphericalPhi, sphericalTheta)); //spherical coords
        
        scene.add(meshIndex[x]); //adding new orb
    }
    
}

function spawnOrbsRParticles() {

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let X = 0; X < 100000; X++) {
    
        sphericalTheta = Math.random() * 2.0 * Math.PI;
        sphericalPhi = Math.acos(2.0 * Math.random() - 1.0);
        sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;

        const v=new Vector3(1,1,1)
        v.setFromSpherical(new Spherical(sphericalRadius, sphericalPhi, sphericalTheta));
    
        vertices.push(v.x,v.y,v.z); 
        }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const material = new THREE.PointsMaterial( { size: 0.5, sizeAttenuation: true, transparent: true, color: 0x888888,clippingPlanes: clipPlanes,clipIntersection: true, alpha:0.5 } );

    const particles = new THREE.Points( geometry, material );
    scene.add( particles );
}

function factorial(n) {
    if (n < 0) return;
    if (n < 2) return 1;
    return n * factorial(n - 1);
}

function doubleFactorial(n) {
    if (n == 0 || n==1)
        return 1;            
        return n * doubleFactorial(n - 2);
}

function Laguerre(laguerreAlpha, laguerreK, laguerreX){
    
    let LaguerreValues = [1, 1 + laguerreAlpha - laguerreX];

    for (let LagIndex = 2; LagIndex <= laguerreK; LagIndex++) {
        LaguerreValues[LagIndex] = ((2 * laguerreK + 1 + laguerreAlpha - laguerreX) * LaguerreValues[LagIndex - 1] - (laguerreK + laguerreAlpha) * LaguerreValues[LagIndex - 2])/(laguerreK+1);
        console.log(LagIndex + " Lag " + LaguerreValues[LagIndex]);
    }
    return LaguerreValues[laguerreK];   
    // old redundant code it was never finished lmao
    // const part1=(Math.pow(laguerreX,-laguerreAlpha)*Math.pow(E,laguerreX))/factorial(laguerreK);
    // const part2=(Math.pow(E,-laguerreX)*Math.pow(laguerreX,laguerreK+laguerreAlpha))
    
    //return the (k'th deravetive of part 2 times) part 1    
}

function Legendre(LegendreL, LegendreM, LegendreX){

    let LegendreValues = [(-1) ** LegendreM * doubleFactorial(2 * LegendreM - 1) * (1 - LegendreX ** 2) ** (LegendreM / 2)];
    LegendreValues[1] = LegendreX * (2 * LegendreM + 1) * LegendreValues[0];
    console.log(0 + " Leg " + LegendreValues[0]);
    console.log(1 + " Leg " + LegendreValues[1]);
    for (let LegIndex = 2; LegIndex <= LegendreL - LegendreM; LegIndex++) {
        LegendreValues[LegIndex] = ((2 * LegendreL + 1) * LegendreX * LegendreValues[LegIndex - 1] - (LegendreL + LegendreM) * LegendreValues[LegIndex - 2]) / (LegendreL - LegendreM + 1)
        console.log(LegIndex + " Leg " + LegendreValues[LegIndex]);
    }
    return LegendreValues[LegendreL - LegendreM];   

}