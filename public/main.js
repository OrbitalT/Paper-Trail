const tabLinks = document.querySelectorAll('.tab-link');
const formContainers = document.querySelectorAll('.form-container');

// Add event listeners to each tab
tabLinks.forEach((tab) => {
    tab.addEventListener('click', (event) => {
        event.preventDefault();

        // Hide all form containers
        formContainers.forEach((container) => {
            container.style.display = 'none';
        });

        // Remove the active class from all tabs
        tabLinks.forEach((tab) => {
            tab.classList.remove('active');
        });

        // Show the selected form container
        const targetForm = document.querySelector(event.target.getAttribute('href'));
        targetForm.style.display = 'block';

        // Add the active class to the clicked tab
        event.target.classList.add('active');
    });
});

async function submitForm() {
    const formData = new FormData(form);

    const response = await fetch('/generate-tyfr', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `TYFR-${formData.get('lastname')}-${formData.get('unit')}.docx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        // Reset the form
        form.reset();
    } else {
        alert('An error occurred while generating the document. Please try again.');
    }
}