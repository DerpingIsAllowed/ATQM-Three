import * as THREE from '../three.js/build/three.module.js';
import { BoxHelper, CullFaceBack, DodecahedronBufferGeometry, MathUtils, Particle, PlaneHelper, QuadraticBezierCurve, RedIntegerFormat, SphereBufferGeometry, Spherical, TriangleFanDrawMode, Vector2, Vector3, WireframeGeometry } from './three.js/build/three.module.js';

import {OrbitControls} from './three.js/examples/jsm/controls/OrbitControls.js';
import { GUI } from './three.js/examples/jsm/libs/dat.gui.module.js';


//initiate some variables
let scene, camera, renderer, controls;

//initiate custom variables
let currentAngle=0.25*Math.PI,newAngle=0,campos=0,transpos=0,J=0,IsTransitioning, Frame, camerazoom, ComputationallyLesExpensiveTrials, EnableLightHelpers, EnableClippingHelpers, EnableClipping, clipPlanes, ClippingPlaneOfset, TwoDView, WaveType, ShowProbability, PerformanceMode, Div, meshIndex = [], RadiusOfDistribution, RadialMax, AngularMax, x, Trials,quantumL,quantumM,quantumN, bohrRadius, nucleusCharge, UpdateOnFrames,orbColor = 0xFF0000, complexAngle;
//bufferentities
let geometry, vertices = [], colors = [];
//debug geometry
let DevGeometry,DevMaterial,DevMesh
//slider
let Nslider = document.getElementById("myRangeN")
let Lslider = document.getElementById("myRangeL")

//#region ill Defined Functions
var debug=[]
debug.log=function log(string){
    console.log(string)
}
debug.error=function error(string1){
    console.error(string1)
}
debug.warn=function warn(string2){
    console.warn(string2)
}
//#endregion

init();
animate();


function init() {
    console.warn("Version : 1.3.1")

    
    /* READ ME
    De docs zijn kapot handig \/
    https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
    dit is niet eens super moeilijk
    Declare variables in de "Let"
    */

    //#region boleans and stuff for in the UI and easy acces    
    EnableLightHelpers = false;
    EnableClippingHelpers = false;
    EnableClipping = false;
    ClippingPlaneOfset = 0;
    TwoDView = 0;           // 0 = 3d, 1 = 2d om x-as, 2 = 2d om y-as
    WaveType = 0;           // 0 = Volledige golf, 1 = Radial, 2 = Angular
    ShowProbability = 0;    // 0 = Probability density, 1 = Real part, 2 =  Imaginary part
    PerformanceMode = 3;    // 1 = lowest performance, 2 = medium, 4 = high 
    Div="canvas";

    
    // quantummechanische waardes! 
    bohrRadius = 0.529177210903;
    nucleusCharge = 1; 
    quantumN = 6;
    quantumL = 4;
    quantumM = 0;


    document.getElementsByClassName("NLMDisplay")[0].firstElementChild.innerHTML = "(n, l, m) = (" + quantumN + ", " + quantumL + ", " + quantumM + ")";

    //de maximale radius(niet aan zitten)
    RadiusOfDistribution = AtomicRadius(0, 0.05, quantumN, quantumL, bohrRadius, nucleusCharge);
    RadialMax = RadialWaveMax(RadiusOfDistribution, quantumN, quantumL, bohrRadius, nucleusCharge);
    AngularMax = AngularWaveMax(quantumM, quantumL);
    // console.log(RadialWave(3, 0, 1, bohrRadius))

    //aantal keer dat je een random punt kiest en de berekening uitvoert
    if (TwoDView == 0) {
        Trials = 1000000 * RadiusOfDistribution * RadialMax * AngularMax * PerformanceMode;
    }else{
        Trials = 5000 * RadiusOfDistribution ** 2;
    }
    
    if (WaveType == 1) {
        Trials = 5000 * RadiusOfDistribution;
    } 
    else if (WaveType == 2) {
        Trials = 500 * RadiusOfDistribution ** 2;
    }
    

    console.log("Quantum N: " + quantumN +" Quantum L: "+ quantumL + " Quantum M: " +quantumM)
    console.log("Performance Mode: " +PerformanceMode)
    console.log ("Trials: " +Trials)

    console.log("Radius: " + RadiusOfDistribution)
    console.log("RadialMax: " + RadialMax)
    console.log("AngularMax: " + AngularMax)
    // ik heb een waarde toegevoegd die eigenlijk het maximum pakt de 100% in kansberekening 
    // en vervolgens zegt, alles wat hoger dan 50% is mag ook spawnen wat hetzelfde effect geeft, visueel als de trials omhoog gooien,
    // maar een stuk makkelijker voor je computer is om te hendelen.
    // het staat geschreven als gedeeld door, waardes tussen de ~100 en 800 zijn een beetje de norm
    ComputationallyLesExpensiveTrials= 500;
    
    // camera zoom variabelen
    camerazoom = RadiusOfDistribution;
    console.log("camerazoom: " + camerazoom)
    let cameramin=2;
    let cameramax=500;
    
    UpdateOnFrames=4;
    Frame=0;

    // Set slider maximum :)
    Nslider.value=quantumN
    document.getElementById("myRangeL").max = Nslider.value-1;
    document.getElementById("myRangeM").max = Lslider.value;
    document.getElementById("myRangeM").min = -Lslider.value;
    
    //#endregion
    
    //renderer configure
    renderer = new THREE.WebGLRenderer({antialias:true, canvas: document.querySelector(Div), alpha: true}); //the renderer itself its complex go read the docs

    //define a scene
    scene = new THREE.Scene();
    scene.background = null

    //inintialize camera
    camera = new THREE.PerspectiveCamera(20, 2 / 1, 1, 1000); 
    if (TwoDView == 0) {
        camera.position.set( 3 * camerazoom, 2.25 * camerazoom, 3 * camerazoom );
    } else {
        camera.position.set( 6 * camerazoom, 0, 0 );
    }
    camera.lookAt( scene.position );


    //#region clipping in renderer
    if (EnableClipping) {
        
        //add in the three clipping planes that make-up the box
        clipPlanes = [
            new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), ClippingPlaneOfset ),
            //new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), ClippingPlaneOfset ),
            //new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), ClippingPlaneOfset )
        ];
        renderer.localClippingEnabled = true;
    }
    //#endregion

    //#region geometry
    // add an inner sphere
    const geometry = new THREE.SphereGeometry( .1, 40, 20 );
    let material;
    if (clipPlanes == null)
    {
        material = new THREE.MeshStandardMaterial( 
        {   
            color: 0x00FF00, 
            transparent: false, 
            side: THREE.DoubleSide,
            clipIntersection: true,
        })
    }
    else
    {
        material = new THREE.MeshStandardMaterial( 
        {   
            color: 0x00FF00, 
            transparent: false, 
            side: THREE.DoubleSide,
            clippingPlanes: clipPlanes,
            clipIntersection: true,
        })
    }

    const mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    //add outer sphere
    DevGeometry = new THREE.SphereGeometry( RadiusOfDistribution, 20, 20 );
    if (clipPlanes == null){   
        DevMaterial = new THREE.MeshStandardMaterial( 
        {   
            color: 0x000000, 
            transparent: false, 
            side: THREE.DoubleSide,
            clipIntersection: true,
            wireframe: true
        } )
    } else{
        DevMaterial = new THREE.MeshStandardMaterial( 
        {   
            color: 0x000000, 
            transparent: false, 
            side: THREE.DoubleSide,
            clippingPlanes: clipPlanes,
            clipIntersection: true,
            wireframe: true
        } )
    }

    
    DevMesh = new THREE.Mesh( DevGeometry, DevMaterial );
    // scene.add( DevMesh );

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
    controls.minDistance = cameramin;
    controls.maxDistance = cameramax;
    //enablepan
    controls.enablePan=false;
    controls.enableZoom=true;
    
    //automagically rotate
    if (TwoDView == 0) {
    controls.autoRotate=true;
    controls.autoRotateSpeed=0.3;
    }
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
        if (clippingPlanes!=null){
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
    //#endregion

    spawnOrbsRParticles();
    console.log (SphericalHarmonics(Math.abs(quantumM), quantumL, 1));
    console.log (RadialWave(quantumN, quantumL, bohrRadius, bohrRadius, nucleusCharge));
    console.log (RadialWave(quantumN, quantumL, bohrRadius, bohrRadius, nucleusCharge) * SphericalHarmonics(Math.abs(quantumM), quantumL, 1));
    console.log (HydrogenWave(quantumN, quantumL, quantumM, bohrRadius, 1, bohrRadius, nucleusCharge));

    x=0;

}


// var modelbtns=document.getElementsByClassName("UpdateModelBtn");

// for (let I = 0; I < modelbtns.length; I++) {
//     const modelbutton = modelbtns[I];
//     modelbutton.addEventListener("click",() => {
//         var NLMValues=document.getElementsByClassName("UpdateModelBtn")[I].parentElement.parentElement.dataset.nlmValues;
//         UpdateModel(NLMValues);
//     })
// }

// var nlmValues;
// var nlmValuesPrev;

// var Progressdots = document.getElementsByClassName("dot")
// Progressdots[0].style.backgroundColor = window.getComputedStyle(document.documentElement).getPropertyValue('--accentcolor');

// document.getElementsByClassName("collapsable")[0].addEventListener('scroll',ModelAnimation)
// function ModelAnimation(){
//     if (resizeCanvas.matches)
//     return;


//     var TriggerModelUpdatesOn = document.getElementsByClassName("TriggerModelUpdate")
    
//     for (let I1 = 0; I1 < TriggerModelUpdatesOn.length; I1++) {
//         const ModelUpdatePoint = TriggerModelUpdatesOn[I1];
        
//         //var windowHeight = window.innerHeight;
//         var revealTop = ModelUpdatePoint.getBoundingClientRect().top;
//         var transitionPoint = window.innerHeight/2;
        
//         if (revealTop < transitionPoint && revealTop > -transitionPoint){
            
//             nlmValues=ModelUpdatePoint.dataset.nlmValues;
//             nlmValues.split();

//             Progressdots[I1].style.backgroundColor = window.getComputedStyle(document.documentElement).getPropertyValue('--accentcolor');
//         }
//         else{
//             Progressdots[I1].style.backgroundColor = window.getComputedStyle(document.documentElement).getPropertyValue('--accentgray');
//         }
        
//         if(nlmValues!=nlmValuesPrev){
//             UpdateModel(nlmValues);
//             nlmValuesPrev=nlmValues;
//         }


//     }

// }


Nslider.addEventListener('change', () => {
    document.getElementById("myRangeL").max = Nslider.value-1;
    document.getElementById("myRangeM").max = Lslider.value;
    document.getElementById("myRangeM").min = -(Lslider.value);
    document.getElementById("myRangeL").previousElementSibling.lastElementChild.innerHTML=document.getElementById("myRangeL").value;
    document.getElementById("myRangeM").previousElementSibling.lastElementChild.innerHTML=document.getElementById("myRangeM").value;
})

Lslider.addEventListener('change', () => {
    document.getElementById("myRangeM").max = Lslider.value;
    document.getElementById("myRangeM").min = -(Lslider.value);
    document.getElementById("myRangeL").previousElementSibling.lastElementChild.innerHTML=document.getElementById("myRangeL").value;
    document.getElementById("myRangeM").previousElementSibling.lastElementChild.innerHTML=document.getElementById("myRangeM").value;
})

const SubmitSliderValueButton = document.querySelector('.SubmitQuantumValuesButton');

SubmitSliderValueButton.addEventListener('click', () => {
    var NLM= [document.getElementById("myRangeN").value,document.getElementById("myRangeL").value,document.getElementById("myRangeM").value];
    UpdateModel(NLM)
});

function PickRandomModel(){
    var N= Math.round( Math.random() * 7 + 1) ;
    var L= Math.round( Math.abs(Math.random() * (N - 1))) ;
    var M=  (Math.random() * L * 2);
    M-=0.5*M;
    M=Math.round(M);

    var NLM=[N,L,M]
    UpdateModel(NLM)
    debug.log(NLM)
}

function UpdateModel(NLM){
    console.log(" ")

    quantumN = parseInt(NLM[0]);
    quantumL = parseInt(NLM[1]);
    quantumM = parseInt(NLM[2]);

    IsTransitioning=true;
    console.log("Quantum N: " + quantumN +" Quantum L: "+ quantumL + " Quantum M: " +quantumM)
    document.getElementsByClassName("NLMDisplay")[0].firstElementChild.innerHTML = "(n, l, m) = (" + quantumN + ", " + quantumL + ", " + quantumM + ")";
    
    
    //de maximale radius(niet aan zitten)
    RadiusOfDistribution = AtomicRadius(0, 0.05, quantumN, quantumL, bohrRadius, nucleusCharge);
    RadialMax = RadialWaveMax(RadiusOfDistribution, quantumN, quantumL, bohrRadius, nucleusCharge);
    AngularMax = AngularWaveMax(quantumM, quantumL);

    //aantal keer dat je een random punt kiest en de berekening uitvoert
    if (TwoDView == 0) {
        Trials = 1000000 * RadiusOfDistribution * RadialMax * AngularMax * PerformanceMode;
    }else{
        Trials = 5000 * RadiusOfDistribution ** 2;
    }
    
    if (WaveType == 1) {
        Trials = 5000 * RadiusOfDistribution;
    } 
    else if (WaveType == 2) {
        Trials = 500 * RadiusOfDistribution ** 2;
    }

    console.log("Performance Mode: " +PerformanceMode)
    console.log("Trials: " +Trials)
    console.log("Radius: " + RadiusOfDistribution)
    console.log("RadialMax: " + RadialMax)
    console.log("AngularMax: " + AngularMax)

    // camera zoom variabelen
    camerazoom = RadiusOfDistribution;
    console.log("camerazoom: " + camerazoom)
    
    vertices.length = 0;
    colors.length=0;
    
    //do the thing with the zoom out/in
    //camera.position.set( 3 * camerazoom, 2.25 * camerazoom, 3 * camerazoom );
    camera.lookAt( scene.position );
    J=0;
    
    currentAngle = 2 * Math.atan(camera.position.z / ( camera.position.x + Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)));
    newAngle =  currentAngle + 1/4 * Math.PI;
    
    console.log("Angle: " +currentAngle)
    console.log("newAngle: " +newAngle)

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute(colors, 3));
    
    console.log("geometry updated ")
    if (DevMesh!=null){
        DevMesh.geometry.dispose();
        DevMesh.geometry=new THREE.SphereGeometry( RadiusOfDistribution, 20, 20 );
    }
    x=0;
    Frame=0;
    UpdateOnFrames=4;

    console.log (SphericalHarmonics(Math.abs(quantumM), quantumL, 1));
    console.log (RadialWave(quantumN, quantumL, bohrRadius, bohrRadius, nucleusCharge));
    console.log (RadialWave(quantumN, quantumL, bohrRadius, bohrRadius, nucleusCharge) * SphericalHarmonics(Math.abs(quantumM), quantumL, 1));
    console.log (HydrogenWave(quantumN, quantumL, quantumM, bohrRadius, 1, bohrRadius, nucleusCharge));

    return;
}



// //change the placement of the model based on the breakpoint for mobile on window resize
// var resizeCanvas=window.matchMedia("(max-width: 767px)")

// function ReCenterModel(){
//     // if(resizeCanvas==null){return}
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     if (canvas.width !== width ||canvas.height !== height) {
//         if (resizeCanvas.matches)
//         {
//             // dosomething
//             debug.log(true);
//             camera.setViewOffset(width,height,0,0,width,height);


//         }
//         else{
//             camera.setViewOffset(width,height,-width/6,0,width,height,0 );
//             camera.updateProjectionMatrix();
//             debug.log(false);
//         }
//     }
// }

// //change the placement of the model based on the breakpoint for mobile on pageload
// resizeCanvas.addEventListener("change", ReCenterModel)
// window.onload=() => {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//         if (resizeCanvas.matches)
//         {
//             // dosomething
//             debug.log(true);
//             camera.setViewOffset(width,height,0,0,width,height);
//             camera.updateProjectionMatrix();

//         }
//         else{
//             camera.setViewOffset(width,height,-width/6,0,width,height,0 );
//             camera.updateProjectionMatrix();
//             debug.log(false);
//         }
//     console.log('page is fully loaded');
// };



function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        renderer.setSize(width, height, false);
        camera.aspect = width / height;

        // let MediaQueryMobile=window.matchMedia("(max-width: 767px)")
        // if(!MediaQueryMobile.matches)
        // {
            camera.setViewOffset(width,height,-width/6,0,width,height,0 );
        // }
        // else{
        //     camera.setViewOffset(width,height,0 ,0 ,width,height);
        // }
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

    if(Math.random()*100>99.95)
    {
        PickRandomModel();
    }
    
    let lerptarget=new Vector3( Math.cos(newAngle) * 6 / Math.sqrt(2) * camerazoom, 2.25 * camerazoom, Math.sin(newAngle) * 6 / Math.sqrt(2) * camerazoom);

    if(IsTransitioning){
        camera.position.lerp( lerptarget,0.03);
        controls.enabled=false;
        controls.autoRotate=false;
        
        campos=camera.position
        transpos=lerptarget
        
    }
    else{controls.enabled=true;
        controls.autoRotate=true;
    }
    
    var rounderror=0.5;
    if (IsTransitioning && campos.x >= transpos.x - rounderror && campos.x <= transpos.x + rounderror && campos.y >= transpos.y - rounderror && campos.y <= transpos.y + rounderror && campos.z >= transpos.z - rounderror && campos.z <= transpos.z + rounderror)
    {
        IsTransitioning=false;
    }
    
    // if (IsTransitioning && campos.equals(transpos)
    // }
    

    //for controls if you edit it through script
    controls.update();
    resizeCanvasToDisplaySize();

    //render the scene
    renderer.render( scene, camera );
    // renderer.shadowMap.autoUpdate = false;
    
    if (x < Trials) {
        CalcVertices();
        UpdateGeometry();
    }
    else if (Trials<x&& x<Trials+100000000){
        console.log("Added particles: "+ geometry.attributes.position.count);
        x+=1;
        x=+1000000000000;
        UpdateGeometry();
        OnModelCalculationEnd();
    }

    
}



function CalcVertices(){
    let I;
    var Wave;

    for (I = 0; I < 20000; I++) {  

        if (TwoDView == 1) {
            var sphericalPhi  = Math.round(Math.random()) * Math.PI;
            var sphericalTheta = 2.0 * Math.PI * Math.random();
            var sphericalRadius = Math.sqrt(Math.random()) * RadiusOfDistribution;
        }
        else if (TwoDView == 2) {
            var sphericalPhi  = Math.random() * 2 * Math.PI + 0.5 * Math.PI;
            var sphericalTheta = 0.5 * Math.PI;
            var sphericalRadius = Math.sqrt(Math.random()) * RadiusOfDistribution;
        }
        else{
            var sphericalPhi  = Math.random() * 2 * Math.PI;
            var sphericalTheta = Math.random() * Math.PI;
            var sphericalRadius = Math.random() * RadiusOfDistribution;
        }

        if (WaveType == 1 ) {           
            if (ShowProbability == 0) {
                Wave = RadialWave(quantumN, quantumL, sphericalRadius, bohrRadius, nucleusCharge) ** 2;
            } 
            else Wave = RadialWave(quantumN, quantumL, sphericalRadius, bohrRadius, nucleusCharge) ** 2;
        } 
        else if (WaveType == 2) {
            if (ShowProbability == 0) {
                Wave = SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta) ** 2;
            } 
            else if (ShowProbability == 1) {
                Wave = Math.abs(SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta) * Math.cos(sphericalPhi * quantumM)) ** 2;
            } 
            else {
                Wave = Math.abs(SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta) * Math.sin(sphericalPhi * quantumM)) ** 2;
            }
        } 
        else {
            if (ShowProbability == 0) {
                Wave = HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius, nucleusCharge) ** 2;
            } 
            else if (ShowProbability == 1) {
                Wave = Math.abs(HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius, nucleusCharge) * Math.cos(sphericalPhi * quantumM)) ** 2;
            } 
            else {
                Wave = Math.abs(HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius, nucleusCharge) * Math.sin(sphericalPhi * quantumM)) ** 2;
            }
        }
        
        if (Math.random() * RadialMax * AngularMax / sphericalRadius ** 2 / Math.sin(sphericalTheta) < Wave) {
            if (Math.sign(HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius, nucleusCharge)) == -1) {
                complexAngle = ((sphericalPhi * quantumM + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            }   else {
                
                complexAngle = ((sphericalPhi * quantumM) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            }
            

            orbColor = HueToRGB(complexAngle);
            

            colors.push(orbColor.r,orbColor.g,orbColor.b);

            const v= new Vector3()
            v.setFromSpherical(new Spherical(sphericalRadius, sphericalTheta, sphericalPhi));
            vertices.push(v.x, v.y, v.z); 
        }
        x++;
    }
}


function UpdateGeometry(){
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
}


function spawnOrbsRParticles() {
    geometry = new THREE.BufferGeometry();
    const texture = new THREE.TextureLoader().load( '/ball.png' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let material 
    if (clipPlanes!=null) {material = new THREE.PointsMaterial( {vertexColors: true, alphaTest :.5 ,map: texture , size: 0.2, sizeAttenuation: true, transparent: true, clippingPlanes: clipPlanes,clipIntersection: true } );}
    else {material = new THREE.PointsMaterial( {vertexColors: true,alphaTest :.5 ,map: texture , size: 0.2, sizeAttenuation: true, transparent: true, clipIntersection: true } );}
    const particles = new THREE.Points( geometry, material );

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    scene.add( particles );
    // let bohrRadius=0.529177210903;


    // var atbohr= HydrogenWave(1, 0, 0, bohrRadius, 1, bohrRadius) / quantumN
    // console.log(atbohr)
    // console.log(quantumN + " " + quantumL + " " + quantumM + " " )

    // for (let X = 0; X < Trials; X++) {
        
    //     var sphericalPhi  = Math.random() * 2.0 * Math.PI;
    //     var sphericalTheta = Math.acos(2.0 * Math.random() - 1.0);
    //     var sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;


    //     if (Math.random()*(atbohr/ComputationallyLesExpensiveTrials)<HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius)) {
    //         const v=new Vector3(1,1,1)
    //         v.setFromSpherical(new Spherical(sphericalRadius,sphericalTheta , sphericalPhi));
    //         vertices.push(v.x,v.y,v.z); 
    //     }
    // }

    // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
}

//#region Hydrogen wave function 


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

function AtomicRadius(sum, r, quantumN, quantumL, bohrRadius, nucleusCharge) {
    if (sum > 0.9999) return r;
    return AtomicRadius(sum + 0.1 * r ** 2 * RadialWave(quantumN, quantumL, r, bohrRadius, nucleusCharge) ** 2, r + 0.1, quantumN, quantumL, bohrRadius, nucleusCharge);
}

function RadialWaveMax(RadiusOfDistribution, quantumN, quantumL, bohrRadius, nucleusCharge) {
    let rMax = [0, 0];

    for (let r = 0; r < RadiusOfDistribution; r += 0.1) {
        rMax[1] = RadialWave(quantumN, quantumL, r, bohrRadius, nucleusCharge) ** 2 * r ** 2;
        if (rMax[1] > rMax[0]) {
            rMax[0] = rMax[1];
        }
    }
    return rMax[0]
}

function AngularWaveMax(quantumM, quantumL) {
    let thetaMax = [0, 0];

    for (let theta = 0; theta < 2 * Math.PI; theta += 1 / 30 * Math.PI) {
        thetaMax[1] = SphericalHarmonics(Math.abs(quantumM), quantumL, theta) ** 2 * Math.sin(theta);
        if (thetaMax[1] > thetaMax[0]) {
            thetaMax[0] = thetaMax[1];
        }
    }
    return thetaMax[0]
}

function Laguerre(laguerreAlpha, laguerreK, laguerreX){
    
    let LaguerreValues = [1, 1 + laguerreAlpha - laguerreX];

    for (let LagIndex = 2; LagIndex <= laguerreK; LagIndex++) {
        LaguerreValues[LagIndex] = ((2 * LagIndex - 1 + laguerreAlpha - laguerreX) * LaguerreValues[LagIndex - 1] - (LagIndex + laguerreAlpha - 1) * LaguerreValues[LagIndex - 2]) / LagIndex;
    }
    return LaguerreValues[laguerreK]; 
}

function Legendre(LegendreL, LegendreM, LegendreX){

    let LegendreValues = [doubleFactorial(2 * LegendreM - 1) * (1 - LegendreX ** 2) ** (LegendreM / 2)];
    LegendreValues[1] = LegendreX * (2 * LegendreM + 1) * LegendreValues[0];

    for (let LegIndex = 2; LegIndex <= LegendreL - LegendreM; LegIndex++) {
        LegendreValues[LegIndex] = ((2 * (LegendreM + LegIndex) - 1) * LegendreX * LegendreValues[LegIndex - 1] - (2 * LegendreM + LegIndex - 1) * LegendreValues[LegIndex - 2]) / LegIndex;
    }
    return LegendreValues[LegendreL - LegendreM];   

}

function SphericalHarmonics(quantumM, quantumL, sphericalTheta) {

    return Math.sqrt((2 * quantumL + 1) * factorial(quantumL - quantumM) / ((4 * Math.PI) * factorial(quantumL + quantumM))) * Legendre(quantumL, Math.abs(quantumM), Math.cos(sphericalTheta)) * (-1) ** quantumM;

}

function RadialWave(quantumN, quantumL, sphericalRadius, bohrRadius, nucleusCharge) {

    return Math.sqrt((2 * nucleusCharge / (quantumN * bohrRadius)) ** 3 * factorial(quantumN - quantumL - 1) / (2 * quantumN * factorial(quantumN + quantumL))) * Math.exp(- sphericalRadius * nucleusCharge / (quantumN * bohrRadius)) * (2 * sphericalRadius * nucleusCharge / (quantumN * bohrRadius)) ** quantumL * Laguerre(2 * quantumL + 1, quantumN - quantumL - 1, 2 * sphericalRadius * nucleusCharge / (quantumN * bohrRadius));

}

function HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius, nucleusCharge) {

    return  RadialWave(quantumN, quantumL, sphericalRadius, bohrRadius, nucleusCharge)
            * SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta);

}

function HueToRGB(h) {
    let r;
    let g;
    let b;
    let x = (1 - Math.abs((h * 3 / Math.PI) % 2 - 1));

    if (0 <= h && h < Math.PI / 3) {
        r = 1; g = x; b = 0;  
      } else if (Math.PI / 3 <= h && h < 2 * Math.PI / 3) {
        r = x; g = 1; b = 0;
      } else if (2 * Math.PI / 3 <= h && h < Math.PI) {
        r = 0; g = 1; b = x;
      } else if (Math.PI <= h && h < 4 * Math.PI / 3) {
        r = 0; g = x; b = 1;
      } else if (4 * Math.PI / 3 <= h && h < 5 * Math.PI / 3) {
        r = x; g = 0; b = 1;
      } else if (5 * Math.PI / 3 <= h && h < 2 * Math.PI) {
        r = 1; g = 0; b = x;
      }
      r = Math.round(r * 255) / 255;
      g = Math.round(g * 255) / 255;
      b = Math.round(b * 255) / 255;
      

      const rgb=new THREE.Color(r,g,b);

      return(rgb)
}

function rgbToHex(r, g, b) {
    return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}



//#endregion

function OnModelCalculationEnd(){
    console.log("Scene polycount:", renderer.info.render.triangles)
    console.log("Active Drawcalls:", renderer.info.render.calls)
    console.log("Textures in Memory", renderer.info.memory.textures)
    console.log("Geometries in Memory", renderer.info.memory.geometries)

    debug.log("vertices: "+ vertices.length)
    debug.log("colors: "+ colors.length)
}