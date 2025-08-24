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
/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', function() {
    // ====================== Elements ======================
    const quoteElement = document.getElementById('quote-text');
    const buttonContainer = document.getElementById('button-container');

    // Create button dynamically
    const buttonElement = document.createElement('a');
    buttonElement.href = "mailto:codersingh94@gmail.com?subject=Initiating a Custom Web Project&body=Dear Ramandeep Singh,%0A%0AI hope you're doing well.%0A%0AI’m reaching out to explore the possibility of developing a customized web project geared towards my specific needs. I'm looking for a digital solution that reflects my goals, engages effectively with users, and offers a seamless experience across all platforms.%0A%0AIf you're available to discuss this further, I’d love to connect and explore how we can collaborate to bring this project to life with a focus on quality, functionality, and thoughtful design.%0A%0ALooking forward to hearing from you.%0A%0ABest regards,%0A[Your Name]";
    buttonElement.className = "btn primary-btn";
    buttonContainer.appendChild(buttonElement);

    // ====================== Quotes & Button Texts ======================
    const quotes = [
        "Crafting digital journeys, not just interfaces.",
        "Your vision, our code. The perfect digital blend.",
        "Where design meets functionality in every pixel.",
        "The future of frontend is here. We're building it."
    ];

    const buttonTexts = [
        "Start Your Project",
        "Get a Free Quote",
        "Let's Collaborate",
        "Contact Us Now"
    ];

    // ====================== Animation Settings ======================
    let currentQuoteIndex = 0;

    const style = getComputedStyle(document.documentElement);
    const fadeDuration = parseFloat(style.getPropertyValue('--fade-duration')) * 1000 || 500; // default 0.5s

    const displayInterval = 5000; // 5 seconds per cycle

    // ====================== Functions ======================
    function updateQuoteAndButtonContent() {
        currentQuoteIndex = (currentQuoteIndex + 1) % Math.max(quotes.length, buttonTexts.length);

        quoteElement.textContent = quotes[currentQuoteIndex % quotes.length];
        buttonElement.textContent = buttonTexts[currentQuoteIndex % buttonTexts.length];

        quoteElement.style.opacity = '1';
        quoteElement.classList.add('show-opening-mark', 'show-closing-mark');
        buttonElement.classList.remove('fade-out-text');
    }

    function initiateContentChange() {
        // Fade out
        quoteElement.style.opacity = '0';
        quoteElement.classList.remove('show-opening-mark', 'show-closing-mark');

        buttonElement.classList.add('fade-out-text');

        // After fade duration, update content
        setTimeout(updateQuoteAndButtonContent, fadeDuration);
    }

    // ====================== Initial Setup ======================
    quoteElement.textContent = quotes[currentQuoteIndex];
    buttonElement.textContent = buttonTexts[currentQuoteIndex];

    quoteElement.style.opacity = '1';
    quoteElement.classList.add('show-opening-mark', 'show-closing-mark');
    buttonElement.classList.remove('fade-out-text');

    // ====================== Start Interval ======================
    setInterval(initiateContentChange, displayInterval);
});
/* eslint-disable no-undef */

// ====================== Topics with Deep Explanations ======================
const topics = [
    {
        title: "HTML5 Basics",
        id: "html",
        description: `
 HTML5: The Structural Core of Modern Web Applications

HTML5 serves as the foundational language for structuring content on the web. It's the standard that defines the semantic meaning and organization of every page, providing the essential framework upon which all other technologies are built.

Semantic Tags: These tags move beyond simple presentation, conveying explicit meaning about a page's structure to both browsers and assistive technologies. For example, using an <article> for a blog post helps search engine crawlers understand the page's primary content. Similarly, screen readers can leverage tags like <nav> to efficiently guide users to the main navigation menu, significantly enhancing accessibility.
Advanced Forms and Inputs: HTML5 introduced a new generation of input types designed to streamline user data entry. Inputs like <input type="email"> and <input type="date"> provide built-in client-side validation, reducing the need for custom JavaScript and improving data integrity. On mobile devices, these inputs automatically trigger specialized keyboards (e.g., a numeric keypad for <input type="tel">), providing a more intuitive user experience.
Native Multimedia Support: A key advancement of HTML5 was the native inclusion of multimedia capabilities. The <audio> and <video> tags allow for direct embedding of media without relying on third-party plugins like Flash. This not only improves security and performance but also ensures a consistent user experience across different browsers and devices. The <source> tag enables developers to provide multiple file formats (e.g., MP4, WebM) to guarantee playback on all modern browsers.
Web Storage APIs: The localStorage and sessionStorage APIs provide a robust mechanism for client-side data persistence. This capability is fundamental for building modern web applications that are responsive and can function offline. A common real-world use case is using localStorage to save a user's theme preference or the contents of a shopping cart, ensuring the data persists even after the browser is closed.
`
    },
    {
        title: "CSS & Styling",
        id: "css",
        description: `
 CSS: The Language of Visual Presentation

CSS, or Cascading Style Sheets, is the declarative language used to define the visual styling and layout of a web page. It transforms structured HTML content into a cohesive, aesthetically pleasing, and responsive user interface.

Advanced Layout Modules: Modern CSS provides powerful layout tools that have revolutionized web design. Flexbox is a one-dimensional layout system ideal for distributing space and aligning items in a single row or column, such as a navigation bar or a photo gallery. CSS Grid is a two-dimensional system, perfect for creating complex, responsive grid layouts like a professional dashboard or a magazine-style homepage, where precise control over rows and columns is required.
Dynamic Styling and Theming: Beyond basic colors and fonts, CSS offers advanced features for creating dynamic and maintainable designs. Custom properties (CSS Variables) allow developers to define reusable values (e.g., --primary-color: #007bff;) that can be easily updated to manage a site-wide theme from a single location. This approach ensures design consistency and simplifies future updates.
Media Queries and Responsive Design: Media queries are the cornerstone of responsive web design. They allow developers to apply different styles based on the characteristics of a device, such as its screen width, height, or orientation. A real-time example is a website that displays a horizontal navigation menu on a desktop screen but transforms it into a collapsible "hamburger" menu on a smaller mobile device, optimizing the user experience for each viewport.
Animations and Transitions: CSS provides powerful tools for enhancing user interaction through motion. Transitions enable smooth state changes, such as a button gracefully changing color on hover, providing subtle visual feedback. Animations, on the other hand, allow for complex, keyframed sequences, ideal for creating engaging effects like a looping loading spinner or a hero image that fades in dynamically.
`
    },
    {
        title: "JavaScript Essentials",
        id: "javascript",
        description: `
 JavaScript: The Engine of Interactivity

JavaScript is a versatile, high-level programming language that makes web pages dynamic and interactive. It enables complex behaviors, from real-time data updates to seamless user interactions, effectively serving as the application logic layer.

Core Concepts: A solid understanding of core concepts is essential. Closures, for instance, are a powerful feature that allows a function to remember the variables from its outer scope even after the outer function has finished executing. This is a fundamental pattern for creating modular and encapsulated components, preventing data pollution in the global scope.
DOM Manipulation: The Document Object Model (DOM) is a programming interface for web documents. JavaScript can access and manipulate the DOM to dynamically update a page's content without a full page reload. A practical example is a "like" button on a social media post: when clicked, JavaScript intercepts the event, sends data to a server, and instantly updates the like count on the page, providing immediate feedback to the user.
Event Handling: Event listeners are a core part of creating an interactive user experience. They non-invasively wait for a user action—be it a click, a keyboard press, or a mouse hover—and then execute a specific function in response. This allows for a clean separation of concerns, where the logic for a user interaction is handled independently of the HTML structure.
Asynchronous Programming: Modern web applications frequently need to fetch data from external APIs without freezing the user interface. Asynchronous programming is the solution to this challenge. Promises and the async/await syntax provide a clean, readable way to handle these non-blocking operations. A real-world scenario involves fetching a user's profile information from a server; async/await allows the code to "wait" for the data to return before processing it, while the rest of the application remains responsive to the user.
`
    },
    {
        title: "Modern JS Frameworks",
        id: "frameworks",
        description: `
 Modern JavaScript Frameworks: Building Scalable Applications

For large-scale projects and Single-Page Applications (SPAs), managing complex state and a growing number of components can be a challenge. Modern JavaScript frameworks provide a structured, efficient, and scalable approach to development.

React: React is a component-based library that excels at building complex user interfaces. Its core strength lies in a declarative paradigm and the use of a Virtual DOM. By creating a lightweight copy of the actual DOM, React can determine the most efficient way to update the user interface, minimizing expensive reflows and repaints and leading to superior performance.
Vue: Vue is praised for its incremental adoptability, making it a flexible choice for projects of all sizes. Its reactive data bindings are a standout feature, automatically updating the view whenever the underlying data changes. This simplifies state management and reduces the amount of boilerplate code required to create dynamic UIs.
Angular: Angular is a comprehensive, opinionated framework built with TypeScript, which adds static typing for improved code quality and maintainability. Its architecture is well-suited for enterprise-level applications, providing a full suite of built-in features for everything from routing and state management to dependency injection.
State Management Solutions: As applications grow, sharing data across disparate components becomes a significant challenge. Libraries like Redux or framework-specific solutions like Vuex and React's Context API address this by providing a centralized "store" for shared application data. This eliminates the need for "prop drilling"—passing data through many layers of components—and ensures a consistent and predictable application state.
`
    },
    {
        title: "UI/UX Design",
        id: "uiux",
        description: `
 UI/UX Design: Crafting the User Experience

UI and UX are two complementary disciplines that are critical to the success of any digital product. UI (User Interface) design focuses on the visual and interactive elements, while UX (User Experience) design encompasses the entire user journey, ensuring a product is intuitive, efficient, and enjoyable to use.

Wireframing and Prototyping: These are essential steps in the design thinking process. Wireframes are low-fidelity blueprints that focus on a page's information architecture and layout, while prototypes are interactive models that simulate the user flow. Both are invaluable for testing concepts and gathering early feedback to validate design decisions before development begins.
Accessibility Standards: Accessibility is no longer a best practice—it's a legal and ethical imperative. Adhering to standards like the Web Content Accessibility Guidelines (WCAG) ensures that a site is usable by people with disabilities. This includes practices like providing meaningful alt text for images and ensuring full keyboard navigation, allowing all users to interact with your content.
User Testing: The most reliable way to validate a design is through user testing. By observing real users as they interact with a product, designers can gather valuable qualitative and quantitative data. This iterative process of testing, feedback, and refinement is crucial for identifying pain points, validating assumptions, and continuously improving the user experience.
`
    },
{
    title: "About Manmeet Kaur",
    id: "Manmeet Kaur",
    description: `
    Great! Here's About Manmeet Kaur
Kickstart Your NET Success with Manmeet Kaur!  

Ready to conquer the UGC NET in Computer Science? Join <strong>Manmeet Kaur</strong>, a celebrated educator with 8+ years of teaching experience at top universities, for an electrifying learning journey! Experience a high-performance curriculum designed for speed, clarity, and maximum results. Unlock insider strategies that have helped countless students achieve top scores. Don’t just prepare—excel confidently and effectively!  

📺 <a href="https://youtube.com/@unlocknetwithmanmeetkaur?si=LbjpaqvAftIRVXVs" target="_blank" rel="noopener noreferrer">Subscribe to Manmeet Kaur's YouTube channel</a> to discover the secrets behind her students' success and start your NET breakthrough today!`
},
    {
        title: "About DigitalFusion",
        id: "digitalfusion",
        description: `
 DigitalFusion: Pioneering Frontend Innovation

DigitalFusion is a Frontend Innovation Hub committed to delivering exceptional digital experiences. We believe in the power of frontend technology to transform business ideas into immersive and high-performance applications. Our mission is to empower organizations by building responsive, intuitive, and visually stunning user interfaces that not only meet but exceed end-user expectations.
`
    },
    {
        title: "About Ramandeep Singh",
        id: "ramandeep",
        description: `
 About Ramandeep Singh: A Visionary in Frontend

Ramandeep Singh is the visionary founder of DigitalFusion, bringing over three years + of experience and a deep passion for frontend development and UI/UX. His philosophy is rooted in a commitment to crafting digital journeys, not just interfaces. Ramandeep believes that the true power of technology lies in its ability to blend technical excellence with creative design to solve real-world problems. His leadership and commitment to continuous learning drive DigitalFusion's mission to become a global benchmark for innovation in the frontend space.
`
    }
];

const topicSelect = document.getElementById('topicSelect');
const assistantText = document.getElementById('assistant-text');
const prevBtn = document.getElementById('prevTopic');
const nextBtn = document.getElementById('nextTopic');

let currentTopicIndex = -1;

// Populate dropdown
topics.forEach((topic, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = topic.title;
    topicSelect.appendChild(option);
});

// Resets the section back to its initial state
function resetSection() {
    assistantText.textContent = "The explanation will appear here once you select a topic.";
    topicSelect.value = ""; // Reset the dropdown to the "Select a topic" option
    currentTopicIndex = -1;
}

// Update assistant panel
function updateAssistant(index) {
    if (index < 0 || index >= topics.length) return;
    currentTopicIndex = index;
    const topic = topics[index];
    assistantText.innerHTML = topic.description.replace(/\n/g, "<br>");
    topicSelect.value = index;
    speakText(topic.description);
}

// Dropdown selection
topicSelect.addEventListener('change', () => {
    const index = parseInt(topicSelect.value);
    updateAssistant(index);
});

// Next / Previous buttons
nextBtn.addEventListener('click', () => {
    let nextIndex = currentTopicIndex + 1;
    if (nextIndex >= topics.length) nextIndex = 0;
    updateAssistant(nextIndex);
});

prevBtn.addEventListener('click', () => {
    let prevIndex = currentTopicIndex - 1;
    if (prevIndex < 0) prevIndex = topics.length - 1;
    updateAssistant(prevIndex);
});

// ====================== AI Voice Function (Updated) ======================
let femaleVoice = null;

// Find and set a female voice once voices are loaded
function setFemaleVoice() {
    const voices = speechSynthesis.getVoices();
    for (let i = 0; i < voices.length; i++) {
        // Look for a common female-sounding voice for US English
        if (voices[i].lang === 'en-US' && (voices[i].name.includes('Zira') || voices[i].name.includes('Samantha') || voices[i].name.includes('Google US English'))) {
            femaleVoice = voices[i];
            break;
        }
    }
    if (!femaleVoice) {
        // Fallback to the first available US English voice
        femaleVoice = voices.find(voice => voice.lang === 'en-US');
    }
}

// Event listener to set the voice as soon as voices are available
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = setFemaleVoice;
    setFemaleVoice(); // Try to set it immediately in case voices are already loaded
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        // Remove markdown syntax like '#', '*', and '<br>' to ensure clean narration
        const cleanText = text.replace(/#|`|\*|<br>/g, '').replace(/\n/g, ". ");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.1;

        // Use the female voice if it has been found
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        // Add the onend event listener to reset the section
        utterance.onend = () => {
            console.log("Speech finished. Resetting section in 5 seconds...");
            setTimeout(resetSection, 5000); // 5000 milliseconds = 5 seconds
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        console.warn("Text-to-speech not supported in this browser.");
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('projectInquiryForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Collect input values
        const clientName = document.getElementById('clientName').value.trim();
        const clientEmail = document.getElementById('clientEmail').value.trim();
        const projectType = document.getElementById('projectType').value;
        const projectRequirements = document.getElementById('projectRequirements').value.trim();

        // Professional email body
        const emailBody = 
`Dear Ramandeep Singh,

I hope this message finds you well.

I would like to initiate a custom web project with DigitalFusion. Here are my project details:

Client Name: ${clientName}
Client Email: ${clientEmail}
Project Type: ${projectType}
Project Requirements:
${projectRequirements}

I look forward to discussing this project with you and exploring the possibilities for collaboration.

Best regards,
${clientName}`;

        // Encode for mailto link
        const mailtoLink = `mailto:codersingh94@gmail.com?subject=${encodeURIComponent("New Web Project Submission")}&body=${encodeURIComponent(emailBody)}`;

        // Open default email client
        window.location.href = mailtoLink;
    });
});
