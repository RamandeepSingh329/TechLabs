document.addEventListener('DOMContentLoaded', () => {
    // --- Typewriter Effect for Hero Section ---
    const typewriterTextElement = document.getElementById('typewriter-text');
    const heroParagraph = document.querySelector('.hero-content p');
    const heroButton = document.querySelector('.hero-content .btn');

    // ONLY ONE SET OF MESSAGES - NO SHORTENING FOR MOBILE
    const messages = [
        "Crafting interfaces that speak .",
        "UX with purpose. UI with personality .",
        "Design logic with aspirant fluency .",
        "Intelligence in design. Excellence in delivery .",
        "Engaging interfaces, crafted .",
        "Pixel-perfect precision .",
        "Code, art, combined .",
        "Interactive by design .",
        "Your vision, our build ."
    ];

    const MOBILE_BREAKPOINT = 768; // Adjust this value to match your CSS media queries for mobile
    const DESKTOP_FONT_SIZE = '2.2em';
    const MOBILE_FONT_SIZE = '1.8em'; // Adjust this for optimal fit on smartphones

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeWriterTimeoutId; // To store timeout ID for clearing

    // Typewriter Speed Constants
    const TYPING_SPEED = 90;
    const DELETING_SPEED = 40;
    const DELAY_BETWEEN_MESSAGES = 8000;
    const INITIAL_DELAY = 100;

    // Optional: Speed multiplier for longer phrases for a smoother feel
    const LONG_PHRASE_SPEED_MULTIPLIER = 0.8; // e.g., 0.8 means 80% of normal typing speed

    /**
     * Determines if the current view is considered mobile.
     * @returns {boolean} True if the screen width is less than MOBILE_BREAKPOINT.
     */
    function isMobileView() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    /**
     * Applies the styling for the typewriter text element, including mobile adjustments.
     */
    function applyTypewriterStyles() {
        typewriterTextElement.style.color = '#E0E0E0'; // Soft, warm greyish-white
        typewriterTextElement.style.backgroundImage = 'none';
        typewriterTextElement.style.backgroundSize = 'auto';
        typewriterTextElement.style.backgroundRepeat = 'initial';
        typewriterTextElement.style.webkitBackgroundClip = 'initial';
        typewriterTextElement.style.backgroundClip = 'initial';
        typewriterTextElement.style.textShadow = `
            1px 1px 2px rgba(0, 0, 0, 0.2), /* Subtle dark shadow */
            -1px -1px 2px rgba(255, 255, 255, 0.05) /* Very subtle light highlight */
        `;
        typewriterTextElement.style.fontFamily = 'Sacramento, cursive';

        // Crucial: Adjust font size and white-space based on screen size
        if (isMobileView()) {
            typewriterTextElement.style.fontSize = MOBILE_FONT_SIZE;
            typewriterTextElement.style.whiteSpace = 'normal'; // Allow text to wrap on mobile
            // Optional: Ensure it breaks words if necessary to prevent overflow
            typewriterTextElement.style.wordBreak = 'break-word';
        } else {
            typewriterTextElement.style.fontSize = DESKTOP_FONT_SIZE;
            typewriterTextElement.style.whiteSpace = 'nowrap'; // Keep on one line for desktop
            typewriterTextElement.style.wordBreak = 'normal';
        }

        typewriterTextElement.style.overflow = 'hidden';
        typewriterTextElement.style.display = 'inline-block';
    }

    /**
     * Manages the typing and deleting of text for the typewriter effect.
     */
    function typeWriter() {
        const currentMessage = messages[messageIndex];
        let currentTypingSpeed = TYPING_SPEED;
        let currentDeletingSpeed = DELETING_SPEED;

        // Apply speed multiplier for longer phrases, regardless of device type,
        // to make the typing feel more dynamic.
        if (currentMessage.length > 25) { // Arbitrary length for "longer" phrase
            currentTypingSpeed *= LONG_PHRASE_SPEED_MULTIPLIER;
            currentDeletingSpeed *= LONG_PHRASE_SPEED_MULTIPLIER;
        }

        let displayText = currentMessage.substring(0, charIndex);
        typewriterTextElement.textContent = displayText;

        // Blinking cursor logic
        // Show cursor if typing, or if deleting and text isn't empty
        if (!isDeleting && charIndex < currentMessage.length || isDeleting && charIndex > 0) {
            typewriterTextElement.style.borderRight = `4px solid var(--primary-color, #007bff)`;
            typewriterTextElement.style.animation = 'blink-caret 0.75s step-end infinite';
        } else {
            typewriterTextElement.style.animation = 'none';
            typewriterTextElement.style.borderRight = 'none'; // Hide cursor when text is fully visible/deleted
        }

        if (!isDeleting && charIndex < currentMessage.length) {
            charIndex++;
            typeWriterTimeoutId = setTimeout(typeWriter, currentTypingSpeed);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            typeWriterTimeoutId = setTimeout(typeWriter, currentDeletingSpeed);
        } else if (!isDeleting && charIndex === currentMessage.length) {
            // Finished typing, start deleting after a delay
            isDeleting = true;
            typeWriterTimeoutId = setTimeout(typeWriter, DELAY_BETWEEN_MESSAGES);
        } else {
            // Finished deleting, move to next message
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
            typeWriterTimeoutId = setTimeout(typeWriter, currentTypingSpeed); // Start typing next message
        }
    }

    /**
     * Initializes the hero section animations (typewriter, paragraph, button fade-in).
     */
    function initHeroSection() {
        applyTypewriterStyles(); // Apply styles immediately
        typeWriterTimeoutId = setTimeout(typeWriter, INITIAL_DELAY); // Start typewriter

        // Fade in paragraph and button after a suitable delay
        setTimeout(() => {
            heroParagraph.classList.add('show');
            heroButton.classList.add('show');
        }, 1500);
    }

    // Call the main initialization for the hero section
    initHeroSection();

    // Re-initialize on window resize to adjust for responsive changes
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Clear any active typewriter timeout
            clearTimeout(typeWriterTimeoutId);
            // Reapply styles (especially for font size and white-space)
            applyTypewriterStyles();
            // Reset typewriter state and restart it
            messageIndex = 0;
            charIndex = 0;
            isDeleting = false;
            typeWriter();
        }, 250); // Debounce resize event to avoid excessive calls
    });


    // --- Other JavaScript functions (unchanged) ---

    // Smooth scrolling for navigation links
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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
    }

    setupSmoothScrolling();

    // Mobile Navigation Toggle
    function setupMobileNavToggle() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileNavToggle && navLinks) {
            mobileNavToggle.addEventListener('click', () => {
                const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
                mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
            });
        }
    }

    setupMobileNavToggle();

    // Project Filtering
    function setupProjectFiltering() {
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
    }

    setupProjectFiltering();

    // Contact Form Submission (using fetch API)
    function setupContactFormSubmission() {
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
                formStatus.style.color = '#007bff'; // Vibrant blue for pending state

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
    }

    setupContactFormSubmission();
});