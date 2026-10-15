// scripts/theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (!themeToggleBtn) return; // Si no existe el botón en la página, se detiene sin errores

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