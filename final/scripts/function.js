// Función global para obtener, sincronizar y asegurar que la base de datos local nunca esté vacía
window.getStoredData = async function() {
    const STORAGE_KEY = 'lifeToolsData';
    try {
        // Detección blindada de la ruta base compatible con GitHub Pages y entorno local
        let basePath = 'data/resources.json';
        if (window.location.hostname.includes('github.io')) {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            if (pathSegments.length > 0) {
                basePath = `/${pathSegments[0]}/data/resources.json`;
            } else {
                basePath = './data/resources.json';
            }
        }

        const response = await fetch(basePath, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load official resources.json');
        const officialData = await response.json();

        const storedLocal = localStorage.getItem(STORAGE_KEY);
        let localData = storedLocal ? JSON.parse(storedLocal) : null;

        // Si el localStorage está vacío o no es un array válido, inyectamos el JSON oficial de inmediato
        if (!localData || !Array.isArray(localData) || localData.length === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(officialData));
            return officialData;
        }

        // Si ya existen datos guardados, fusionamos inteligentemente manteniendo preferencias del usuario
        officialData.forEach(officialCat => {
            let localCat = localData.find(c => c.id === officialCat.id);
            if (!localCat) {
                localData.push(officialCat);
            } else {
                officialCat.tools.forEach(officialTool => {
                    let localTool = localCat.tools.find(t => t.id === officialTool.id);
                    if (!localTool) {
                        localCat.tools.push(officialTool);
                    } else {
                        localTool.name = officialTool.name;
                        localTool.url = officialTool.url;
                        localTool.desc = officialTool.desc;
                        localTool.logo = officialTool.logo;
                    }
                });
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        return localData;

    } catch (error) {
        console.error('Error loading data, falling back to localStorage:', error);
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'lifeToolsData';
    if (!localStorage.getItem(STORAGE_KEY)) {
        window.getStoredData();
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