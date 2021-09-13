const menuBtn = document.querySelector('.menu-btn');
const menuCube= document.querySelector('.menuCube');
const PMenu=document.querySelector('.PMenu');

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