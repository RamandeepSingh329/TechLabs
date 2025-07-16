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
    const typingSpeed = 90; // Slightly faster typing for crispness
    const deletingSpeed = 40; // Slightly faster deleting
    const delayBetweenMessages = 8000; // Reduced delay for a more dynamic feel (4 seconds)
    const initialDelay = 100; // Small delay before the first message starts typing

    // --- REVERTING TO GREEN TONE WITH SUBTLE DEPTH ---
    // Set the direct green color for the text
typewriterTextElement.style.color = '#E0E0E0'; // A soft, warm greyish-white (very close to #EEEEEE but slightly warmer)
    // Remove background-related properties for texture
    typewriterTextElement.style.backgroundImage = 'none';
    typewriterTextElement.style.backgroundSize = 'auto'; // Reset, though 'none' makes it irrelevant
    typewriterTextElement.style.backgroundRepeat = 'initial'; // Reset

    // Remove background-clip for text
    typewriterTextElement.style.webkitBackgroundClip = 'initial'; // Reset for WebKit browsers
    typewriterTextElement.style.backgroundClip = 'initial'; // Reset

    // Add a very subtle text-shadow for a soft, non-glowing depth
    typewriterTextElement.style.textShadow = `
        1px 1px 2px rgba(0, 0, 0, 0.2),    /* Subtle dark shadow for minimal depth */
        -1px -1px 2px rgba(255, 255, 255, 0.05) /* Very subtle light highlight */
    `;
    // --- END REVERSION ---

    typewriterTextElement.style.fontFamily = 'Sacramento, cursive'; // Ensure this is imported via HTML/CSS
    typewriterTextElement.style.fontSize = '2.2em'; // Adjust as needed
    typewriterTextElement.style.whiteSpace = 'nowrap'; // Ensures text stays on one line during typing
    typewriterTextElement.style.overflow = 'hidden'; // Hides overflow while typing
    typewriterTextElement.style.display = 'inline-block'; // Allows the border-right (cursor) to work correctly

    function typeWriter() {
        const currentMessage = messages[messageIndex];
        let displayText = currentMessage.substring(0, charIndex);
        typewriterTextElement.textContent = displayText;

        // Blinking cursor logic (retained for classic typewriter feel)
        typewriterTextElement.style.borderRight = `4px solid var(--primary-color, #007bff)`;
        typewriterTextElement.style.animation = 'blink-caret 0.75s step-end infinite';

        if (!isDeleting && charIndex < currentMessage.length) {
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeWriter, deletingSpeed);
        } else if (!isDeleting && charIndex === currentMessage.length) {
            // Finished typing, start deleting after a delay
            // Remove cursor animation temporarily when text is fully displayed before deleting
            typewriterTextElement.style.animation = 'none';
            typewriterTextElement.style.borderRight = 'none'; // Hide cursor when text is fully visible
            isDeleting = true;
            setTimeout(typeWriter, delayBetweenMessages);
        } else {
            // Finished deleting, move to next message
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
            setTimeout(typeWriter, typingSpeed); // Start typing next message
        }
    }

    // Call the typewriter function to start the animation after an initial delay
    setTimeout(typeWriter, initialDelay);

    // Fade in paragraph and button after a suitable delay
    setTimeout(() => {
        heroParagraph.classList.add('show');
        heroButton.classList.add('show');
    }, 1500);


    // --- Other JavaScript functions (unchanged) ---

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const header = document.querySelector('header');
                const headerOffset = header ? header.offsetHeight : 0;

                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }

            const mainNav = document.getElementById('main-nav');
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
                if (mobileNavToggle) {
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });
    }


    // Project Filtering
    const filterButtons = document.querySelectorAll('.project-filters button');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) {
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
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        const submitButton = contactForm.querySelector('.btn');
        const backendEndpoint = 'process_form.php'; // Ensure this points to your actual backend script

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                formStatus.textContent = 'Please fill in all required fields.';
                formStatus.style.color = 'orange';
                return;
            }

            submitButton.disabled = true;
            formStatus.textContent = 'Sending your inquiry...';
            formStatus.style.color = '#007bff'; // Using a vibrant blue for pending state

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries()); // Convert FormData to plain object for JSON

            try {
                const response = await fetch(backendEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Specify JSON content type
                        'Accept': 'application/json' // Expect JSON response
                    },
                    body: JSON.stringify(data) // Send data as JSON string
                });

                if (response.ok) {
                    const result = await response.json();
                    formStatus.textContent = result.message || 'Message sent successfully!';
                    formStatus.style.color = 'green';
                    contactForm.reset(); // Clear the form on success
                } else {
                    const errorData = await response.json(); // Parse error response
                    formStatus.textContent = errorData.message || response.statusText || 'Failed to send message.';
                    formStatus.style.color = 'red';
                    console.error('Form submission failed:', response.status, errorData);
                }
            } catch (error) {
                formStatus.textContent = 'Oops! There was a network error. Please try again later.';
                formStatus.style.color = 'red';
                console.error('Network or submission error:', error);
            } finally {
                submitButton.disabled = false; // Re-enable button
            }
        });
    }

    // --- Helper function for email validation (now only used internally if needed) ---
    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

});