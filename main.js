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

    /**
     * Retrieves queries from local storage.
     * @returns {Array} An array of query objects.
     */
    function getQueriesFromLocalStorage() {
        const queriesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            return queriesJson ? JSON.parse(queriesJson) : [];
        } catch (e) {
            console.error("Error parsing queries from localStorage:", e);
            showNotification("Corrupted data in local storage. Clearing queries.", "error");
            clearAllQueriesFromLocalStorage(); // Clear corrupted data
            return [];
        }
    }

    /**
     * Saves a new query to local storage.
     * @param {Object} query The query object to save.
     */
    function saveQueryToLocalStorage(query) {
        const queries = getQueriesFromLocalStorage();
        queries.push(query);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queries));
        } catch (e) {
            console.error("Error saving query to localStorage:", e);
            showNotification("Failed to save query. Local storage might be full or inaccessible.", "error");
        }
    }

    /**
     * Clears all queries from local storage.
     */
    function clearAllQueriesFromLocalStorage() {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // --- Dynamically Create and Append Contact Form ---
    function createAndAppendContactForm() {
        const mainElement = document.querySelector('main');
        const placeholder = document.getElementById('contact-section-placeholder');

        if (!mainElement && !placeholder) {
            console.error("Neither main element nor contact section placeholder found. Cannot append contact form.");
            return;
        }

        const contactSection = document.createElement('section');
        contactSection.id = 'contact';
        contactSection.classList.add('section', 'contact-section');

        const containerDiv = document.createElement('div');
        containerDiv.classList.add('container');

        const heading = document.createElement('h2');
        heading.textContent = 'Send Us a Query';

        const contactForm = document.createElement('form');
        contactForm.classList.add('query-form');

        const createFormGroup = (labelText, inputType, inputId, isRequired = true, rows = null) => {
            const group = document.createElement('div');
            group.classList.add('form-group');

            const label = document.createElement('label');
            label.setAttribute('for', inputId);
            label.textContent = labelText;

            let inputElement;
            if (inputType === 'textarea') {
                inputElement = document.createElement('textarea');
                if (rows) inputElement.rows = rows;
            } else {
                inputElement = document.createElement('input');
                inputElement.setAttribute('type', inputType);
            }

            inputElement.id = inputId;
            inputElement.name = inputId;
            inputElement.required = isRequired;

            group.appendChild(label);
            group.appendChild(inputElement);
            return { group, inputElement };
        };

        const { group: nameGroup, inputElement: nameInput } = createFormGroup('Name:', 'text', 'name');
        const { group: emailGroup, inputElement: emailInput } = createFormGroup('Email:', 'email', 'email');
        const { group: subjectGroup, inputElement: subjectInput } = createFormGroup('Subject:', 'text', 'subject');
        const { group: messageGroup, inputElement: messageTextarea } = createFormGroup('Message:', 'textarea', 'message', true, 6);

        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.classList.add('btn', 'primary-btn');
        submitButton.textContent = 'Send Query';

        contactForm.appendChild(nameGroup);
        contactForm.appendChild(emailGroup);
        contactForm.appendChild(subjectGroup);
        contactForm.appendChild(messageGroup);
        contactForm.appendChild(submitButton);

        containerDiv.appendChild(heading);
        containerDiv.appendChild(contactForm);

        contactSection.appendChild(containerDiv);

        if (placeholder) {
            placeholder.replaceWith(contactSection);
        } else {
            mainElement.appendChild(contactSection);
        }

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                showNotification('Please fill in all required fields before submitting.', 'error');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const queryData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageTextarea.value.trim(),
                timestamp: new Date().toLocaleString()
            };

            if (!queryData.name || !queryData.email || !queryData.subject || !queryData.message) {
                 showNotification('All fields are required.', 'error');
                 submitButton.disabled = false;
                 submitButton.textContent = 'Send Query';
                 return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(queryData.email)) {
                showNotification('Please enter a valid email address.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Send Query';
                return;
            }

            try {
                saveQueryToLocalStorage(queryData);
                showNotification('Thank you! Your query has been saved locally.', 'success');
                contactForm.reset();
            } catch (error) {
                showNotification('Oops! There was an error saving your query locally. Please try again.', 'error');
                console.error('Local storage save error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Query';
            }
        });
    }

    createAndAppendContactForm();


    // --- Admin Panel Logic ---
    const ADMIN_PASSWORD = 'ProAdmin$0855'; // Client-side password (NOT secure for production)

    const showAdminPanelBtn = document.getElementById('show-admin-panel-btn');
    const adminPanel = document.getElementById('admin-panel');
    const adminPanelContent = document.getElementById('admin-panel-content'); // Reference to the new content div

    let currentSortOrder = 'newest'; // Default sort order
    let currentSearchTerm = ''; // Default search term

    /**
     * Shows the admin panel and triggers the login modal.
     */
    async function showAdminPanel() {
        if (adminPanel) adminPanel.classList.remove('hidden');
        if (showAdminPanelBtn && showAdminPanelBtn.parentElement) {
            showAdminPanelBtn.parentElement.classList.add('hidden');
        }

        const passwordHtml = `<input type="password" id="admin-password-input" placeholder="Enter password" autocomplete="current-password">`;
        const result = await showModal('Admin Login', passwordHtml, [
            { text: 'Login', className: 'primary-btn', value: 'login' },
            { text: 'Cancel', className: 'secondary-btn', value: 'cancel' }
        ]);

        if (result === 'login') {
            const enteredPassword = document.getElementById('admin-password-input').value;
            if (enteredPassword === ADMIN_PASSWORD) {
                showNotification('Admin login successful!', 'success');
                renderAdminPanelContent(); // Render the main admin content
            } else {
                showNotification('Incorrect password. Please try again.', 'error');
                hideAdminPanel(); // Hide panel on failed login
            }
        } else {
            hideAdminPanel(); // Hide panel if cancelled
        }
    }

    /**
     * Hides the admin panel and shows the access button.
     */
    function hideAdminPanel() {
        if (adminPanel) adminPanel.classList.add('hidden');
        if (showAdminPanelBtn && showAdminPanelBtn.parentElement) {
            showAdminPanelBtn.parentElement.classList.remove('hidden');
        }
        if (adminPanelContent) adminPanelContent.innerHTML = ''; // Clear admin content
        hideModal(); // Ensure any open modals are closed
    }

    /**
     * Renders the main content of the admin panel (controls and queries).
     */
    function renderAdminPanelContent() {
        if (!adminPanelContent) return;

        adminPanelContent.innerHTML = `
            <div class="admin-controls-bar">
                <input type="text" id="query-search-input" placeholder="Search queries by name, email, subject...">
                <div class="sort-options">
                    <label for="sort-by">Sort by:</label>
                    <select id="sort-by">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                </div>
                <button id="refresh-queries-btn" class="btn primary-btn">Refresh</button>
                <button id="clear-all-queries-btn" class="btn btn-danger">Clear All</button>
                <button id="admin-logout-btn" class="btn secondary-btn">Logout</button>
            </div>
            <div id="queries-display" class="queries-grid">
                <div class="loading-spinner"></div>
            </div>
        `;

        // Get references to newly created elements
        const querySearchInput = document.getElementById('query-search-input');
        const sortBySelect = document.getElementById('sort-by');
        const refreshQueriesBtn = document.getElementById('refresh-queries-btn');
        const clearAllQueriesBtn = document.getElementById('clear-all-queries-btn');
        const adminLogoutBtn = document.getElementById('admin-logout-btn');
        const queriesDisplay = document.getElementById('queries-display'); // This will be the actual grid

        // Set initial values
        querySearchInput.value = currentSearchTerm;
        sortBySelect.value = currentSortOrder;

        // Attach event listeners
        querySearchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            renderQueries();
        });

        sortBySelect.addEventListener('change', (e) => {
            currentSortOrder = e.target.value;
            renderQueries();
        });

        refreshQueriesBtn.addEventListener('click', () => {
            renderQueries();
            showNotification('Queries refreshed!', 'info');
        });

        clearAllQueriesBtn.addEventListener('click', async () => {
            const confirmed = await showModal(
                'Confirm Clear All',
                '<p>Are you sure you want to clear ALL queries? This action cannot be undone.</p>',
                [
                    { text: 'Yes, Clear All', className: 'btn-danger', value: true },
                    { text: 'Cancel', className: 'secondary-btn', value: false }
                ]
            );

            if (confirmed) {
                clearAllQueriesFromLocalStorage();
                renderQueries();
                showNotification('All queries have been cleared.', 'success');
            } else {
                showNotification('Query clearing cancelled.', 'info');
            }
        });

        adminLogoutBtn.addEventListener('click', () => {
            hideAdminPanel();
            showNotification('Logged out from Admin Panel.', 'info');
        });

        renderQueries(); // Initial render of queries
    }

    /**
     * Renders all stored queries into the admin panel, applying search and sort.
     */
    function renderQueries() {
        const queriesDisplay = document.getElementById('queries-display');
        if (!queriesDisplay) return; // Ensure element exists

        queriesDisplay.innerHTML = '<div class="loading-spinner"></div>'; // Show loading spinner

        // Simulate a small delay for loading effect
        setTimeout(() => {
            let queries = getQueriesFromLocalStorage();

            // Apply Search Filter
            if (currentSearchTerm) {
                queries = queries.filter(query =>
                    (query.name && query.name.toLowerCase().includes(currentSearchTerm)) ||
                    (query.email && query.email.toLowerCase().includes(currentSearchTerm)) ||
                    (query.subject && query.subject.toLowerCase().includes(currentSearchTerm)) ||
                    (query.message && query.message.toLowerCase().includes(currentSearchTerm))
                );
            }

            // Apply Sorting
            queries.sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();

                switch (currentSortOrder) {
                    case 'newest': return dateB.getTime() - dateA.getTime();
                    case 'oldest': return dateA.getTime() - dateB.getTime();
                    case 'name-asc': return nameA.localeCompare(nameB);
                    case 'name-desc': return nameB.localeCompare(nameA);
                    default: return 0;
                }
            });

            queriesDisplay.innerHTML = ''; // Clear loading spinner

            if (queries.length === 0) {
                queriesDisplay.innerHTML = '<p style="text-align: center; color: var(--text-medium);">No queries found matching criteria.</p>';
                return;
            }

            queries.forEach((query, index) => {
                const queryCard = document.createElement('div');
                queryCard.classList.add('query-card');

                const encodedSubject = encodeURIComponent(`Re: ${query.subject || 'Your Query'}`);
                const encodedBody = encodeURIComponent(`Dear ${query.name || 'Sir/Madam'},

Regarding your query received on ${query.timestamp || 'N/A'}:

"${query.message || ''}"

---
[Your reply here]
---

Best regards,
DigitalFusion Team`);
                const mailtoLink = `mailto:${query.email}?subject=${encodedSubject}&body=${encodedBody}`;

                queryCard.innerHTML = `
                    <h3>Query from: ${query.name || 'N/A'}</h3>
                    <p><strong>Email:</strong> <a href="mailto:${query.email}">${query.email || 'N/A'}</a></p>
                    <p><strong>Subject:</strong> ${query.subject || 'N/A'}</p>
                    <p><strong>Message:</strong> ${query.message || 'N/A'}</p>
                    <div class="query-meta">
                        <strong>Received:</strong> ${query.timestamp || 'N/A'}
                    </div>
                    ${query.email ? `<a href="${mailtoLink}" class="btn btn-reply">Reply to Query</a>` : ''}
                    <button class="btn-delete-single" data-index="${index}">&times;</button>
                `;
                queriesDisplay.appendChild(queryCard);
            });

            // Attach event listeners to individual delete buttons after they are rendered
            queriesDisplay.querySelectorAll('.btn-delete-single').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const indexToDelete = parseInt(e.target.dataset.index);
                    const confirmed = await showModal(
                        'Confirm Deletion',
                        `<p>Are you sure you want to delete the query from <strong>${queries[indexToDelete].name || 'this user'}</strong>?</p>`,
                        [
                            { text: 'Yes, Delete', className: 'btn-danger', value: true },
                            { text: 'Cancel', className: 'secondary-btn', value: false }
                        ]
                    );

                    if (confirmed) {
                        deleteQuery(indexToDelete);
                        showNotification('Query deleted successfully!', 'success');
                    } else {
                        showNotification('Query deletion cancelled.', 'info');
                    }
                });
            });

        }, 300); // Small delay for loading spinner visibility
    }

    /**
     * Deletes a specific query from local storage by its index in the current filtered/sorted list.
     * @param {number} indexToDelete - The index of the query to delete in the currently displayed list.
     */
    function deleteQuery(indexToDelete) {
        let queries = getQueriesFromLocalStorage();
        // To delete correctly, we need to find the original index in the full list
        // This requires re-applying the search/sort logic to get the *actual* query object
        // that corresponds to the displayed index.
        // A more robust solution for large datasets would involve unique IDs for queries.
        // For local storage, we'll re-filter/sort to find the exact item.

        // First, get the currently displayed (filtered/sorted) queries
        let displayedQueries = getQueriesFromLocalStorage();
        if (currentSearchTerm) {
            displayedQueries = displayedQueries.filter(query =>
                (query.name && query.name.toLowerCase().includes(currentSearchTerm)) ||
                (query.email && query.email.toLowerCase().includes(currentSearchTerm)) ||
                (query.subject && query.subject.toLowerCase().includes(currentSearchTerm)) ||
                (query.message && query.message.toLowerCase().includes(currentSearchTerm))
            );
        }
        displayedQueries.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();

            switch (currentSortOrder) {
                case 'newest': return dateB.getTime() - dateA.getTime();
                case 'oldest': return dateA.getTime() - dateB.getTime();
                case 'name-asc': return nameA.localeCompare(nameB);
                case 'name-desc': return nameB.localeCompare(nameA);
                default: return 0;
            }
        });

        const queryToDelete = displayedQueries[indexToDelete];

        // Find the original index of this query in the *unfiltered, unsorted* list
        const originalQueries = getQueriesFromLocalStorage();
        const originalIndex = originalQueries.findIndex(q =>
            q.name === queryToDelete.name &&
            q.email === queryToDelete.email &&
            q.subject === queryToDelete.subject &&
            q.message === queryToDelete.message &&
            q.timestamp === queryToDelete.timestamp
        );

        if (originalIndex > -1) {
            originalQueries.splice(originalIndex, 1);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(originalQueries));
            renderQueries(); // Re-render the filtered/sorted list
        } else {
            showNotification("Could not find query to delete. Data might be out of sync.", "error");
            console.error("Failed to find original query for deletion:", queryToDelete);
        }
    }


    // Event Listener for Admin Panel Access Button
    if (showAdminPanelBtn) {
        showAdminPanelBtn.addEventListener('click', showAdminPanel);
    }
});