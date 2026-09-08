const menuButton = document.querySelector('#menu-button');
const primaryNav = document.querySelector('#primary-nav');

menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    menuButton.classList.toggle('open');
    primaryNav.classList.toggle('open');

    const isExpanded = menuButton.classList.contains('open');
    menuButton.setAttribute('aria-expanded', isExpanded);
});

document.addEventListener('click', (event) => {
    const isClickInsideMenu = primaryNav.contains(event.target);
    const isClickOnButton = menuButton.contains(event.target);

    if (primaryNav.classList.contains('open') && !isClickInsideMenu && !isClickOnButton) {
      primaryNav.classList.remove('open');
      menuButton.classList.remove('open');  
    }
});