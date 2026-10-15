document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'lifeToolsData';
    
    if (!localStorage.getItem(STORAGE_KEY)) {
        const defaultData = {
            categories: [],
            favorites: [],
            hiddenItems: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            hamburgerBtn.classList.toggle('active', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('current-year');
    const modifiedEl = document.getElementById('last-modified');

    if (yearEl) yearEl.textContent = new Date().getFullYear();
    if (modifiedEl) modifiedEl.textContent = `Last Update: ${document.lastModified}`;
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const currentTheme = localStorage.getItem('theme');
    const themeIcon = themeToggleBtn.querySelector('.theme-icon') || themeToggleBtn;

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️ Light';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙 Dark';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        if (themeIcon) themeIcon.textContent = isDark ? '☀️ Light' : '🌙 Dark';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const lazyElements = document.querySelectorAll('.lazy-bg');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '200px 0px' });

    lazyElements.forEach(el => observer.observe(el));
});