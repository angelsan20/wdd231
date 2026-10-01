document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resultsContainer = document.getElementById('results-container');
    const displayFirst = document.getElementById('display-first');

    const labels = {
        first: 'First Name',
        last: 'Last Name',
        title: 'Organizational Title',
        email: 'Email Address',
        phone: 'Mobile Phone',
        organization: 'Business/Organization Name',
        membership: 'Membership Level',
        description: 'Business Description',
        timestamp: 'Application Date/Time'
    };

    if (displayFirst) {
        displayFirst.textContent = urlParams.get('first') || 'Applicant';
    }

    if (resultsContainer) {
        let htmlContent = '<ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">';
        
        urlParams.forEach((value, key) => {
            if (value.trim() !== '') {
                const labelName = labels[key] || key;
                let formattedValue = value;

                if (key === 'timestamp') {
                    try {
                        formattedValue = new Date(value).toLocaleString();
                    } catch (e) {
                        formattedValue = value;
                    }
                }

                htmlContent += `<li style="border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; color: var(--text-primary);">
                    <strong>${labelName}:</strong> ${escapeHTML(formattedValue)}
                </li>`;
            }
        });
        
        htmlContent += '</ul>';
        resultsContainer.innerHTML = htmlContent;
    }
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}