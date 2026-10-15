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
    urlParams.forEach((value, key) => {
        formData[key] = decodeURIComponent(value);
    });

    if (Object.keys(formData).length === 0) {
        container.innerHTML = '<p class="results-card-label" style="font-size: 1rem;">No submission data found. Please fill out the contact form first.</p>';
        return;
    }

   
    container.innerHTML = '';
    
    Object.keys(formData).forEach((key) => {
        if (key === '_next' || key === '_captcha') return;
        const readableKey = labels[key] || key;
        const value = formData[key];
        
        const itemEl = document.createElement('div');
        itemEl.className = 'results-card-item';
        itemEl.innerHTML = `
            <strong class="results-card-label">${readableKey}:</strong> 
            <span class="results-card-value">${value}</span>
        `;
        container.appendChild(itemEl);
    });


    const actionWrapper = document.createElement('div');
    actionWrapper.className = 'results-action-wrapper';
    actionWrapper.innerHTML = `
        <button id="confirm-send-btn" class="lth-btn lth-btn-primary">Confirm & Send to Team</button>
    `;
    container.appendChild(actionWrapper);

    document.getElementById('confirm-send-btn').addEventListener('click', async function() {
        const btn = this;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const formSubmitUrl = 'https://formsubmit.co/ajax/f1d9acb3f91f2ae4043567e65d7062b4';

        try {
            const response = await fetch(formSubmitUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName || '',
                    email: formData.email || '',
                    topic: formData.topic || '',
                    message: formData.message || '',
                    _captcha: "false"
                })
            });

            if (response.ok) {
                
                container.innerHTML = `
                    <div class="success-alert-box">
                        <h3 class="success-alert-title">Message Sent Successfully!</h3>
                        <p class="success-alert-text">Your data has been confirmed and successfully sent to our team.</p>
                    </div>
                `;
                actionWrapper.innerHTML = `
                    <a href="contact.html" class="lth-btn lth-btn-primary">Send Another Message</a>
                `;
                container.appendChild(actionWrapper);
            } else {
                throw new Error('Server response failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error sending your message. Please try again.');
            btn.textContent = 'Confirm & Send to Team';
            btn.disabled = false;
        }
    });
});