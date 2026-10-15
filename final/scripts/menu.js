document.addEventListener('DOMContentLoaded', () => {
    
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });
});