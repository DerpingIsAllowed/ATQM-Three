const menuBtn                         =document.querySelector('.menu-btn');
const menuCube                        =document.querySelector('.menuCube');
const MobileMenuButton                =document.querySelector('.MobileMenuButton');
const aspilltext                      =document.querySelector('.aspilltext');
const collapsable                     =document.querySelector('.collapsable');
const slidercontainer                 =document.querySelector('.slidercontainer');
const closeSliderContainer            =document.querySelector('.closeSliderContainer');
const SubmitSliderValueButton         =document.querySelector('.SubmitQuantumValuesButton');
const PMenu                           =document.querySelectorAll('.PMenu');
const mQuantumWaardes                 =document.querySelector('.mQuantumWaardes');
let root = document.documentElement;
updateTextN();
updateTextL();
updateTextM();
updateTextN();
updateTextL();
updateTextM();
//Open and close Navmenu with the burger
let menuOpen = false;
menuBtn.addEventListener('click', () => {
  if(!menuOpen) {
    menuBtn.classList.add('open');
    menuCube.classList.add('open');
    PMenu.forEach(element => {element.classList.add('open')});
    menuBtn.classList.remove('closed');
    menuCube.classList.remove('closed');
    PMenu.forEach(element => {element.classList.remove('closed')});
    menuOpen = true;

  } else {
    menuBtn.classList.add('closed');
    menuCube.classList.add('closed');
    PMenu.forEach(element => {element.classList.add('closed')});
    menuBtn.classList.remove('open');
    menuCube.classList.remove('open');
    PMenu.forEach(element => {element.classList.remove('open')});
    menuOpen = false;

  }
});

//open and close MobileMenu
let MMBopen =true
MobileMenuButton.addEventListener('click', () => {
  if (!MMBopen) {
    MobileMenuButton.classList.add('open');
    MobileMenuButton.classList.remove('closed');
    aspilltext.classList.add('open');
    aspilltext.classList.remove('closed');
    collapsable.classList.add('open');
    collapsable.classList.remove('closed');
    root.style.setProperty('--MobileMenuText', 1)
    MMBopen=true
  }else{
    MobileMenuButton.classList.add('closed');
    MobileMenuButton.classList.remove('open');
    aspilltext.classList.add('closed');
    aspilltext.classList.remove('open');
    collapsable.classList.add('closed');
    collapsable.classList.remove('open');
    root.style.setProperty('--MobileMenuText', 0)
    MMBopen=false
  }
})

//open and close quantumUI
let userinterfaceOpen=false
mQuantumWaardes.addEventListener('click', () =>{
  if(!userinterfaceOpen){
    slidercontainer.classList.add('open');
        
    setTimeout(() => {
      root.style.setProperty('--popUpMenuOpacity',1)
    }, 10);
    userinterfaceOpen=true
  }
})
  closeSliderContainer.addEventListener('click', () =>{
    
    if(userinterfaceOpen){
    root.style.setProperty('--popUpMenuOpacity',0)
    setTimeout(() => {
      slidercontainer.classList.remove('open');
    }, 200);
    userinterfaceOpen=false
  }
})
SubmitSliderValueButton.addEventListener('click', () =>{
  if(userinterfaceOpen){
    root.style.setProperty('--popUpMenuOpacity',0)
    setTimeout(() => {
      slidercontainer.classList.remove('open');
    }, 200);
    userinterfaceOpen=false
  }
})

// update the text in the quantumUI
function updateTextN(){
  var Nslider = document.getElementById('myRangeN')
  Nslider.previousElementSibling.lastElementChild.innerHTML=Nslider.value
  updateTextL();
  updateTextM();
}

function updateTextL(){
  var Lslider = document.getElementById('myRangeL')
  setTimeout(() => {
  Lslider.previousElementSibling.lastElementChild.innerHTML=Lslider.value;
  },20);
  updateTextM();
}

function updateTextM(){
  var Mslider = document.getElementById('myRangeM')
  setTimeout(() => {
    Mslider.previousElementSibling.lastElementChild.innerHTML=Mslider.value;
    },20);
}
