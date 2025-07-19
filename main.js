document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const notificationContainer = document.getElementById('notification-container');
    const modalContainer = document.getElementById('modal-container');
    const adminPanelContentDiv = document.getElementById('admin-panel-content'); // New target for admin panel content

    // --- Notification System ---
    /**
     * Displays a custom toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', or 'info'.
     * @param {number} duration - How long the notification stays visible in ms (default 3000).
     */
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationContainer) {
            console.error("Notification container not found. Please add <div id='notification-container'></div> to your HTML.");
            alert(message); // Fallback
            return;
        }

        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;

        notificationContainer.appendChild(notification);

        // Trigger reflow to ensure the initial opacity/transform is applied before animation
        void notification.offsetWidth;

        // Apply animation for showing
        notification.style.animation = `fadeInSlideUp 0.5s forwards ease-out`;

        // Set timeout to start fade-out animation and then remove the element
        setTimeout(() => {
            notification.style.animation = `fadeOutSlideDown 0.5s forwards ease-in`;
            // Remove element after fade-out animation completes
            setTimeout(() => {
                notification.remove();
            }, 500); // 500ms is the duration of fadeOutSlideDown
        }, duration);
    }

    // --- Generic Modal System ---
    let resolveModalPromise; // To store the resolve function for modal promises

    /**
     * Shows a generic modal with custom content and buttons.
     * @param {string} title - Title of the modal.
     * @param {string} contentHtml - HTML string for the modal body.
     * @param {Array} buttons - Array of { text, className, value } for buttons.
     * @returns {Promise<string>} A promise that resolves with the value of the clicked button.
     */
    function showModal(title, contentHtml, buttons) {
        return new Promise(resolve => {
            if (!modalContainer) {
                console.error("Modal container not found.");
                resolve(null);
                return;
            }

            modalContainer.innerHTML = ''; // Clear previous modal content
            modalContainer.classList.add('active'); // Show modal backdrop

            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');
            modalContent.innerHTML = `<h3>${title}</h3><div class="modal-body">${contentHtml}</div><div class="modal-buttons"></div>`;

            const buttonsDiv = modalContent.querySelector('.modal-buttons');
            buttons.forEach(btnConfig => {
                const button = document.createElement('button');
                button.textContent = btnConfig.text;
                button.classList.add('btn', btnConfig.className || 'primary-btn');
                button.addEventListener('click', () => {
                    modalContainer.classList.remove('active');
                    resolve(btnConfig.value);
                });
                buttonsDiv.appendChild(button);
            });

            modalContainer.appendChild(modalContent);
            resolveModalPromise = resolve; // Store resolve for external use (e.g., Enter key)

            // Close modal on backdrop click
            modalContainer.addEventListener('click', (e) => {
                if (e.target === modalContainer) {
                    modalContainer.classList.remove('active');
                    resolve(null); // Resolve with null if backdrop clicked
                }
            }, { once: true }); // Only listen once

            // Focus on first input if available
            const firstInput = modalContent.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }

    /**
     * Hides the currently active modal.
     */
    function hideModal() {
        if (modalContainer) {
            modalContainer.classList.remove('active');
            modalContainer.innerHTML = ''; // Clear content
            if (resolveModalPromise) {
                resolveModalPromise(null); // Resolve any pending promise with null
                resolveModalPromise = null;
            }
        }
    }


    // --- Typewriter Effect for Hero Section ---
    const typewriterTextElement = document.getElementById('typewriter-text');
    const heroParagraph = document.querySelector('.hero-content p');
    const heroButton = document.querySelector('.hero-content .btn');

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

    const MOBILE_BREAKPOINT = 768;
    const DESKTOP_FONT_SIZE = '2.2em';
    const MOBILE_FONT_SIZE = '1.8em';

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeWriterTimeoutId;

    const TYPING_SPEED = 90;
    const DELETING_SPEED = 40;
    const DELAY_BETWEEN_MESSAGES = 8000;
    const INITIAL_DELAY = 100;

    const LONG_PHRASE_SPEED_MULTIPLIER = 0.8;

    function isMobileView() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    function applyTypewriterStyles() {
        typewriterTextElement.style.color = '#E0E0E0';
        typewriterTextElement.style.backgroundImage = 'none';
        typewriterTextElement.style.backgroundSize = 'auto';
        typewriterTextElement.style.backgroundRepeat = 'initial';
        typewriterTextElement.style.webkitBackgroundClip = 'initial';
        typewriterTextElement.style.backgroundClip = 'initial';
        typewriterTextElement.style.textShadow = `
            1px 1px 2px rgba(0, 0, 0, 0.2),
            -1px -1px 2px rgba(255, 255, 255, 0.05)
        `;
        typewriterTextElement.style.fontFamily = 'Sacramento, cursive';

        if (isMobileView()) {
            typewriterTextElement.style.fontSize = MOBILE_FONT_SIZE;
            typewriterTextElement.style.whiteSpace = 'normal';
            typewriterTextElement.style.wordBreak = 'break-word';
        } else {
            typewriterTextElement.style.fontSize = DESKTOP_FONT_SIZE;
            typewriterTextElement.style.whiteSpace = 'nowrap';
            typewriterTextElement.style.wordBreak = 'normal';
        }

        typewriterTextElement.style.overflow = 'hidden';
        typewriterTextElement.style.display = 'inline-block';
    }

    function typeWriter() {
        const currentMessage = messages[messageIndex];
        let currentTypingSpeed = TYPING_SPEED;
        let currentDeletingSpeed = DELETING_SPEED;

        if (currentMessage.length > 25) {
            currentTypingSpeed *= LONG_PHRASE_SPEED_MULTIPLIER;
            currentDeletingSpeed *= LONG_PHRASE_SPEED_MULTIPLIER;
        }

        let displayText = currentMessage.substring(0, charIndex);
        typewriterTextElement.textContent = displayText;

        if ((!isDeleting && charIndex < currentMessage.length) || (isDeleting && charIndex > 0)) {
            typewriterTextElement.style.borderRight = `4px solid var(--primary-color, #007bff)`;
            typewriterTextElement.style.animation = 'blink-caret 0.75s step-end infinite';
        } else {
            typewriterTextElement.style.animation = 'none';
            typewriterTextElement.style.borderRight = 'none';
        }

        if (!isDeleting && charIndex < currentMessage.length) {
            charIndex++;
            typeWriterTimeoutId = setTimeout(typeWriter, currentTypingSpeed);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            typeWriterTimeoutId = setTimeout(typeWriter, currentDeletingSpeed);
        } else if (!isDeleting && charIndex === currentMessage.length) {
            isDeleting = true;
            typeWriterTimeoutId = setTimeout(typeWriter, DELAY_BETWEEN_MESSAGES);
        } else {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
            typeWriterTimeoutId = setTimeout(typeWriter, currentTypingSpeed);
        }
    }

    function initHeroSection() {
        applyTypewriterStyles();
        typeWriterTimeoutId = setTimeout(typeWriter, INITIAL_DELAY);

        setTimeout(() => {
            heroParagraph.classList.add('show');
            heroButton.classList.add('show');
        }, 1500);
    }

    initHeroSection();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            clearTimeout(typeWriterTimeoutId);
            applyTypewriterStyles();
            messageIndex = 0;
            charIndex = 0;
            isDeleting = false;
            typeWriter();
        }, 250);
    });

    // --- Smooth scrolling for navigation links ---
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

    // --- Mobile Navigation Toggle ---
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

    // --- Project Filtering ---
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

    // --- Local Storage Functions for Queries ---
    const LOCAL_STORAGE_KEY = 'digitalFusionQueries';

    
});