document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const container = document.getElementById('results-container');

    const labels = {
        fullName: 'Full Name',
        email: 'Email Address',
        topic: 'Subject Topic',
        message: 'Message / Feedback'
    };

    if (!container) return;

    let formData = {};
    
    if (urlParams.toString() !== '') {
        urlParams.forEach((value, key) => {
            formData[key] = decodeURIComponent(value);
        });
    } else {
        const savedData = localStorage.getItem('lastSubmission');
        if (savedData) {
            formData = JSON.parse(savedData);
            localStorage.removeItem('lastSubmission');
        }
    }

    if (Object.keys(formData).length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-weight: 600;">No submission data found. Please fill out the contact form first.</p>';
        return;
    }

    Object.keys(formData).forEach((key) => {
        if (key === '_next' || key === '_captcha') return;
        const readableKey = labels[key] || key;
        const value = formData[key];
        
        const itemEl = document.createElement('div');
        itemEl.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 6px;';
        itemEl.innerHTML = `
            <strong style="display: block; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">${readableKey}:</strong> 
            <span style="font-size: 1rem; font-weight: 600; color: var(--text-main);">${value}</span>
        `;
        container.appendChild(itemEl);
    });
});