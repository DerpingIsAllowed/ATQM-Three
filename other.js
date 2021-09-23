const menuBtn = document.querySelector('.menu-btn');
const menuCube= document.querySelector('.menuCube');
const PMenu=document.querySelector('.PMenu');
const MobileMenuButton=document.querySelector('.MobileMenuButton');
const aspilltext=document.querySelector('.aspilltext');
const collapsable=document.querySelector('.collapsable');
const slidercontainer=document.querySelector('.slidercontainer')
const closeSliderContainer = document.querySelector('.closeSliderContainer')
let root = document.documentElement;

let menuOpen = false;
menuBtn.addEventListener('click', () => {
  if(!menuOpen) {
    menuBtn.classList.add('open');
    menuCube.classList.add('open');
    PMenu.classList.add('open');
    menuBtn.classList.remove('closed');
    menuCube.classList.remove('closed');
    PMenu.classList.remove('closed');
    menuOpen = true;
  } else {
    menuBtn.classList.add('closed');
    menuCube.classList.add('closed');
    PMenu.classList.add('closed');
    menuBtn.classList.remove('open');
    menuCube.classList.remove('open');
    PMenu.classList.remove('open');
    menuOpen = false;
  }
});


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

let userinterfaceOpen=false
PMenu.addEventListener('click', () =>{
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