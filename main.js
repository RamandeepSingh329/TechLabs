document.addEventListener('DOMContentLoaded', () => {
    // --- Typewriter Effect for Hero Section ---
    const typewriterTextElement = document.getElementById('typewriter-text');
    const heroParagraph = document.querySelector('.hero-content p');
    const heroButton = document.querySelector('.hero-content .btn');
    const messages = [
        "Engaging interfaces, crafted.",
        "Pixel-perfect precision.",
        "Interactive by design.",
        "Your vision, our build."
    ];
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100; // milliseconds per character
    const deletingSpeed = 50; // milliseconds per character
    const delayBetweenMessages = 1500; // milliseconds before typing next message

    function typeWriter() {
        const currentMessage = messages[messageIndex];
        let displayText = currentMessage.substring(0, charIndex);
        typewriterTextElement.textContent = displayText;

        if (!isDeleting && charIndex < currentMessage.length) {
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeWriter, deletingSpeed);
        } else if (!isDeleting && charIndex === currentMessage.length) {
            // Finished typing, start deleting after a delay
            isDeleting = true;
            setTimeout(typeWriter, delayBetweenMessages);
        } else {
            // Finished deleting, move to next message
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
            setTimeout(typeWriter, typingSpeed); // Start typing next message
        }

        // Add/remove blinking cursor based on typing state
        if (isDeleting || charIndex < currentMessage.length) {
            // Ensure --primary-color is defined in your CSS :root
            typewriterTextElement.style.borderRight = `4px solid var(--primary-color, #007bff)`; // Fallback color
            typewriterTextElement.style.animation = 'blink-caret 0.75s step-end infinite';
        } else {
            // Stop cursor animation and hide it after full text is typed and not deleting
            typewriterTextElement.style.borderRight = 'none';
            typewriterTextElement.style.animation = 'none';
        }
    }

    // Call the typewriter function to start the animation
    typeWriter();

    // Fade in paragraph and button after initial typing starts
    // Use a slight delay to let the typewriter start
    setTimeout(() => {
        heroParagraph.classList.add('show');
        heroButton.classList.add('show');
    }, 1000); // Adjust this delay as needed


    // --- Other JavaScript functions (from previous version) ---

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Ensure 'header' element exists for offset calculation
                const header = document.querySelector('header');
                const headerOffset = header ? header.offsetHeight : 0; // Fallback to 0 if no header

                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset - 20; // -20 for extra padding

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }

            const mainNav = document.getElementById('main-nav');
            if (mainNav && mainNav.classList.contains('active')) { // Check if mainNav exists
                mainNav.classList.remove('active');
                const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
                if (mobileNavToggle) { // Check if toggle exists
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinks) { // Ensure elements exist before adding listener
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });
    }


    // Project Filtering
    const filterButtons = document.querySelectorAll('.project-filters button');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) { // Ensure elements exist
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter;

                projectCards.forEach(card => {
                    const cardCategory = card.dataset.category;

                    if (filter === 'all' || cardCategory === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- UPDATED Contact Form Submission (using fetch API) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status'); // Element to display messages

    if (contactForm && formStatus) { // Ensure both elements exist
        const submitButton = contactForm.querySelector('.btn'); // Get the submit button

        // --- IMPORTANT: CONFIGURE YOUR PHP BACKEND ENDPOINT ---
        const backendEndpoint = 'process_form.php'; // Example: if PHP is in the same directory
        // OR: const backendEndpoint = '/api/contact-form'; // For a common API endpoint
        // OR: const backendEndpoint = 'https://yourdomain.com/process_form.php'; // For a full URL


        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default page reload

            // Basic client-side validation (HTML 'required' attribute helps too)
            if (!contactForm.checkValidity()) {
                formStatus.textContent = 'Please fill in all required fields.';
                formStatus.style.color = 'orange';
                return; // Stop execution if form is invalid
            }

            // Disable button and show sending status
            submitButton.disabled = true;
            formStatus.textContent = 'Sending your inquiry...';
            formStatus.style.color = '#007bff'; // Neutral color for loading

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries()); // Convert to plain object for JSON

            try {
                const response = await fetch(backendEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // We are sending JSON
                        'Accept': 'application/json'        // We prefer JSON back
                    },
                    body: JSON.stringify(data) // Convert data object to JSON string
                });

                if (response.ok) { // Check for HTTP status 200-299
                    // Assuming PHP returns JSON, e.g., {'success': true, 'message': '...'}
                    const result = await response.json();
                    formStatus.textContent = result.message || 'Message sent successfully!';
                    formStatus.style.color = 'green';
                    contactForm.reset(); // Clear the form fields
                } else {
                    // Handle server errors (e.g., 4xx, 5xx status codes)
                    const errorData = await response.json(); // Try to get error message from server
                    formStatus.textContent = errorData.message || response.statusText || 'Failed to send message.';
                    formStatus.style.color = 'red';
                    console.error('Form submission failed:', response.status, errorData);
                }
            } catch (error) {
                // Handle network errors or issues with fetch
                formStatus.textContent = 'Oops! There was a network error. Please try again later.';
                formStatus.style.color = 'red';
                console.error('Network or submission error:', error);
            } finally {
                // Re-enable the submit button
                submitButton.disabled = false;
            }
        });
    }

    // --- Helper function for email validation (now only used internally if needed) ---
    // Note: HTML5 type="email" input provides good client-side validation.
    // This regex is a standard one, more robust than the previous example.
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
