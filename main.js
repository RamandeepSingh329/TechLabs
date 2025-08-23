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
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script: DOMContentLoaded event fired. Starting initialization.');

    const quotes = [
        "True innovation isn't measured by action alone—it flourishes where vision meets interaction, where every pixel becomes a bridge between imagination and experience.",
        "The best way to predict the future is to create it. Let's code your vision into reality.",
        "Great things are done by a series of small things brought together. Your project is our next great thing.",
        "Collaboration is the key to unlocking new possibilities. Together, we can build anything.",
        "In every line of code, there's an opportunity to create something truly impactful."
    ];

    const buttonTexts = [
        "Discover What's Possible",
        "Partner for Innovation",
        "Realize Your Project's Potential",
        "Ignite Your Digital Success",
        "Build Beyond Expectations",
        "Elevate Your Brand Online",
        "Craft Your Strategic Advantage",
        "Transform Concepts into Reality",
        "Unleash Your Project's Future",
        "Initiate Your Next Big Idea"
    ];

    const quoteElement = document.getElementById('collaborationQuote');
    const buttonContainer = document.getElementById('buttonContainer');

    // --- Critical Check: Ensure elements are found ---
    if (!quoteElement) {
        console.error('Script Error: Quote element with ID "collaborationQuote" not found in the DOM.');
        return;
    }
    if (!buttonContainer) {
        console.error('Script Error: Button container with ID "buttonContainer" not found in the DOM.');
        return;
    }
    console.log('Script: Quote and Button container elements found successfully.');

    // --- Create the button element dynamically ---
    const buttonElement = document.createElement('a');
    buttonElement.href = "mailto:codersingh94@gmail.com?subject=Initiating a Custom Web Project&body=Dear Ramandeep Singh,%0A%0AI hope you're doing well.%0A%0AI’m reaching out to explore the possibility of developing a customized web project geared towards my specific needs. I'm looking for a digital solution that reflects my goals, engages effectively with users, and offers a seamless experience across all platforms.%0A%0AIf you're available to discuss this further, I’d love to connect and explore how we can collaborate to bring this project to life with a focus on quality, functionality, and thoughtful design.%0A%0ALooking forward to hearing from you.%0A%0ABest regards,%0A[Your Name]";
    buttonElement.className = "btn primary-btn";
    buttonContainer.appendChild(buttonElement);
    console.log('Script: Button element created and appended to DOM.');

    let currentQuoteIndex = 0;

    const style = getComputedStyle(document.documentElement);
    const fadeDuration = parseFloat(style.getPropertyValue('--fade-duration')) * 1000 || 0;
    console.log(`Script: Retrieved --fade-duration from CSS: ${fadeDuration / 1000}s`);

    // --- Optimized: Single interval for both initial and subsequent changes ---
    const displayInterval = 5000; // 5 seconds total for each cycle (display + fade)

    // Function to update content and trigger fade-in
    function updateQuoteAndButtonContent() {
        console.log(`Script: Updating content. Current index: ${currentQuoteIndex}`);

        // Increment index, loop back to 0 if at end of array
        // Make sure to handle the case where buttonTexts and quotes have different lengths
        currentQuoteIndex = (currentQuoteIndex + 1) % Math.max(quotes.length, buttonTexts.length);

        // Apply new text content, ensuring we don't go out of bounds if arrays are different lengths
        quoteElement.textContent = quotes[currentQuoteIndex % quotes.length];
        buttonElement.textContent = buttonTexts[currentQuoteIndex % buttonTexts.length];

        // Remove fade-out-text class to fade in the button text
        buttonElement.classList.remove('fade-out-text');

        // Ensure visibility and apply pseudo-element classes for quote marks
        quoteElement.style.opacity = '1';
        quoteElement.classList.add('show-opening-mark');
        quoteElement.classList.add('show-closing-mark');
        console.log(`Script: Content updated to index ${currentQuoteIndex}. Opacity set to 1.`);
    }

    // Function to initiate fade-out and then content change
    function initiateContentChange() {
        console.log('Script: Initiating content change (fade-out).');
        // Start fade-out effect for the quote text
        quoteElement.style.opacity = '0';
        quoteElement.classList.remove('show-opening-mark');
        quoteElement.classList.remove('show-closing-mark');

        // Add fade-out-text class to fade out the button text
        buttonElement.classList.add('fade-out-text');

        // After the fade-out duration, update the content and fade it back in
        setTimeout(updateQuoteAndButtonContent, fadeDuration);
        console.log(`Script: Fade-out initiated. Next content update in ${fadeDuration}ms.`);
    }

    // --- Initial setup on page load ---
    currentQuoteIndex = 0; // Ensure it starts at the first element
    quoteElement.textContent = quotes[currentQuoteIndex];
    buttonElement.textContent = buttonTexts[currentQuoteIndex]; // Set initial text for the button

    // Ensure initial visibility for both
    quoteElement.style.opacity = '1';
    quoteElement.classList.add('show-opening-mark');
    quoteElement.classList.add('show-closing-mark');
    buttonElement.classList.remove('fade-out-text'); // Ensures it starts visible

    console.log(`Script: Initial content set to index ${currentQuoteIndex}.`);

    // --- Schedule continuous changes every 'displayInterval' + 'fadeDuration' ---
    // The first change will occur after this total duration.
    // If you want the *first* display to be 5 seconds, then the subsequent calls
    // should happen after the (displayInterval - fadeDuration)
    // To keep it simple and consistent: The cycle length (display + fade) is 5 seconds.
    setInterval(initiateContentChange, displayInterval); // Cycle every 5 seconds including fade

    console.log('Script: Initialization complete.');
});
// ================= Frontend SDLC Descriptions =================
const sdlcDescriptions = {
    Waterfall: "Waterfall in frontend development follows a linear approach: requirements gathering, UI,UX design, static layout implementation (HTML,CSS), interactivity with JavaScript, testing, and deployment. It's ideal for projects with fixed designs and minimal changes.",
    
    Agile: "Agile frontend development emphasizes iterative design and rapid prototyping. UI components, layouts, and interactions are developed incrementally, allowing continuous feedback, responsive adjustments, and faster delivery of functional interfaces.",
    
    Scrum: "Scrum applies Agile principles for frontend teams, breaking development into sprints. Each sprint delivers usable UI components, interactive features, and tested pages. Regular reviews ensure that design, responsiveness, and user experience meet client expectations.",
    
    Iterative: "Iterative frontend development focuses on repeated cycles: design, implement, test, and refine. Each iteration improves layouts, enhances interactions, and optimizes performance, allowing gradual evolution of the web interface until it meets high-quality standards."
};
// ================= References to form elements =================
const form = document.getElementById("projectInquiryForm");
const sdlcSelect = document.getElementById("sdlcModel");

// ================= SDLC Description Display =================
const sdlcDisplay = document.createElement("p");
sdlcDisplay.style.fontStyle = "italic";
sdlcDisplay.style.color = "#1a237e";
sdlcDisplay.style.marginTop = "5px";
sdlcSelect.parentNode.appendChild(sdlcDisplay);

// Event listener to display description and read aloud when SDLC model changes
sdlcSelect.addEventListener("change", () => {
    const selectedModel = sdlcSelect.value;
    const description = sdlcDescriptions[selectedModel] || "No description available for this SDLC model.";
    
    // Display description on form
    sdlcDisplay.textContent = description;

    // Use AI voice to read the description
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${selectedModel} Model: ${description}`);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
});

// ================= Form Submission =================
form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Get form values
    const clientName = document.getElementById("clientName").value.trim();
    const clientEmail = document.getElementById("clientEmail").value.trim();
    const projectType = document.getElementById("projectType").value;
    const projectRequirements = document.getElementById("projectRequirements").value.trim();
    const sdlcModel = document.getElementById("sdlcModel").value;

    // Validate mandatory fields
    if (!clientName || !clientEmail || !projectType || !projectRequirements || !sdlcModel) {
        alert("Please fill in all fields before submitting the form.");
        return;
    }

    // SDLC description
    const sdlcDescription = sdlcDescriptions[sdlcModel] || "No description available for selected SDLC model.";

    // Prepare email content
    const emailSubject = encodeURIComponent(`Project Inquiry from ${clientName}`);
    const emailBody = encodeURIComponent(
`Dear DigitalFusion Team,

Please find my project inquiry details below:

Client Name: ${clientName}
Email: ${clientEmail}
Project Type: ${projectType}
Preferred SDLC Model: ${sdlcModel}

SDLC Description:
${sdlcDescription}

Project Requirements:
${projectRequirements}

Looking forward to your response.

Best regards,
${clientName}`
    );

    // Auto redirect to email
    window.location.href = `mailto:Ramandeep22981@outlook.com?subject=${emailSubject}&body=${emailBody}`;
});
