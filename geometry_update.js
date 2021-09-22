//#region Hydrogen wave function 
function CalcVertices(atbohr){
    for (let I = 0; I < 50000; I++) {   
        var sphericalPhi  = Math.random() * 2.0 * Math.PI;
        var sphericalTheta = Math.acos(2.0 * Math.random() - 1.0);
        var sphericalRadius = Math.cbrt(Math.random())* RadiusOfDistribution;
    
    
        if (Math.random()*(atbohr/ComputationallyLesExpensiveTrials)<HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius)) {
            const v=new Vector3()
            v.setFromSpherical(new Spherical(sphericalRadius, sphericalTheta, sphericalPhi));
            vertices.push(v.x, v.y, v.z); 
        }
        x++;
    }
}

function UpdateGeometry(){
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.update;
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

    let LegendreValues = [doubleFactorial(2 * LegendreM - 1) * (1 - LegendreX ** 2) ** (LegendreM / 2)];
    LegendreValues[1] = LegendreX * (2 * LegendreM + 1) * LegendreValues[0];

    for (let LegIndex = 2; LegIndex <= LegendreL - LegendreM; LegIndex++) {
        LegendreValues[LegIndex] = ((2 * LegendreL + 1) * LegendreX * LegendreValues[LegIndex - 1] - (LegendreL + LegendreM) * LegendreValues[LegIndex - 2]) / (LegendreL - LegendreM + 1)
    }
    return LegendreValues[LegendreL - LegendreM];   

}

function SphericalHarmonics(quantumM, quantumL, sphericalTheta) {

    return Math.sqrt(((2 * quantumL + 1) * factorial(quantumL - quantumM) / ((4 * Math.PI) * factorial(quantumL + quantumM)))) * Legendre(quantumL, Math.abs(quantumM), Math.cos(sphericalTheta))/* * Math.exp(math.sqrt(-1) * quantumM * sphericalPhi)*/

}

function Normalisation(quantumN, quantumL, sphericalRadius, bohrRadius) {

    return  Math.sqrt((2 / (quantumN * bohrRadius)) ** 3 * factorial(quantumN - quantumL - 1) / (2 * quantumN * factorial(quantumN + quantumL))) * Math.exp(- sphericalRadius / (quantumN * bohrRadius)) * (2 * sphericalRadius / (quantumN * bohrRadius)) ** quantumL

}

function HydrogenWave(quantumN, quantumL, quantumM, sphericalRadius, sphericalTheta, bohrRadius) {

    return  (Normalisation(quantumN, quantumL, sphericalRadius, bohrRadius)
            * Laguerre(2 * quantumL + 1, quantumN - quantumL - 1, 2 * sphericalRadius / (quantumN * bohrRadius))
            * SphericalHarmonics(Math.abs(quantumM), quantumL, sphericalTheta)) ** 2;

}
//#endregion