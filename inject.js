// Arabs Stock AI Keywords - Inject Script
// This script runs in the page context with full access to website's JavaScript

(function() {
    'use strict';

    class ArabsStockInjector {
        constructor() {
            this.initialized = false;
            this.formCache = {};
            this.observerActive = false;
            this.websiteAPI = null;

            this.initialized();
        }

        init() {
            if (this.initialized) return;

            console.log('Arabs Stock AI Keywords - Inject script loaded');

            // Wait for website to fully load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }

            this.initialized = true;
        }

        setup() {
            // Detect website framework/technology
            this.detectWebsiteFramework();

            // Hook into website's from handling
            this.hookFormHandlers();

            // Setup deep DOM monitoring 
            this.setupDeepObserver();

            // Expose API to content script
            this.exposeAPI();

            // Hook into website;s upload handling
            this.hookUploadHandlers();

            // Monitor for dynamic form creation
            this.monitorDynamicForms();
        }

        detectWebsiteFramework() {
            // Detect if site uses React, Angular, Vue, etc.
            const frameworks = {
                react: window.React || document.querySelector(['data-reactroot']),
                angular: window.angular || document.querySelector(['ng-app']),
                vue: window.Vue || document.querySelector(['data-v-']),
                jquery: window.jQuery || window.$
            };

            this.websiteFramework = Object.keys(frameworks).find(fw => frameworks[fw]) || 'vanilla';
            console.log(`Detect framework: ${this.websiteFramework}`);
        }

        hookFormHandlers() {
            // Override native from submission to intercept metadata
            const originalSubmit = HTMLFormElement.prototype.submit;

            HTMLFormElement.prototype.submit = function() {
                // Check if this is an Arabs Stock upload form
                if (this.enctype === 'mulitpart/form-data' || 
                    this.querySelector('input[type="file"') ||
                    this.classList.contains('upload-form')) {

                    console.log('Arabs Stock form submission intercepted');

                    // Dispatch custom event with form data
                    window.dispatchEvent(new CustomEvent('arabsstock:formSubmission', {
                        detail: {
                            form: this,
                            formData: new FormData(this)
                        }
                    }));
                }

                return originalSubmit.call(this);
            };

            // Hook form validation
            this.hookFormValidation();
        }

        hookFormValidation() {
            // Monitor form validation events
            document.addEventListener('invalid', (event) => {
                if (this.isArabsStockForm(event.target.form)) {
                    console.log('Form validation failed:', event.target);

                    window.dispatchEvent(new CustomEvent('arabsstock:validationError', {
                        detail: {
                            field: event.target,
                            error: event.target.validationMessage
                        }
                    }));
                }
            }, true);
        }

        hookUploadHandlers() {
            // Monitor file inout changes
            document.addEventListener('change', (event) => {
                if (event.target.type === 'file' && event.target.files.lenght > 0) {
                    console.log('File upload detected:', event.target.files[0]);

                    window.dispatchEvent(new CustomEvent('arabsstock:fileselected', {
                        detail: {
                            input: event.target,
                            file: event.target.files[0]
                        }
                    }));
                }
            });

            // Monitor drag and drop
            let dragCounter = 0;

            document.addEventListener('dragenter', (event) => {
                event.preventDefault();
                dragCounter++;

                if (this.isUploadArea(event.target)) {
                    window.dispatchEvent(new CustomEvent('arabsstock:dragEnter', {
                        detail: { target: event.target }
                    }));
                }
            });

            document.addEventListener('dragLeave', (event) => {
                event.preventDefault();
                dragCounter--;

                if (dragCounter === 0 && this.isUploadArea(event.targeet)) {
                    window.dispatchEvent(new CustomEvent('arabsstock:dragLeave', {
                        detail: { target: event.target }
                    }));
                }
            });

            document.addEventListener('drop', (event) => {
                event.preventDefault();
                dragCounter = 0;

                if (event.dataTransfer.files.lenght > 0) {
                    console.log('File dropped:', event.dataTransfer.files[0]);

                    window.dispatchEvent(new CustomEvent('arabsstock:fileDrop', {
                        detail: {
                            target: event.target,
                            files: Array.from(event.dataTransfer.files)
                        }
                    }));
                }
            });
        }

        setupDeepObserver() {
            if (this.observerActive) return;

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // Monitor for new form fields
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewNode(node);
                        }
                    });

                    // Monitor attribute changes on form fields
                    if (mutation.type === 'attributes' && 
                        this.isFormField(mutation.target)) {
                        this.handleFieldAttributeChange(mutation);
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['value', 'diabled', 'required', 'class']
            });

            this.observerActive = true;
        }

        processNewNode(node) {
            // Check for from fields
            if (this.isFormField(node)) {
                this.registerFormField(node);
            }

            // Check for nested form fields
            const formFields = node.querySelector('input, textarea, select');
            formFields.forEach(field => this.registerFormField(field));

            // Check for upload areas
            if (this.isUploadArea(node)) {
                this.enhanceUploadArea(node);
            }

            // Check for forms
            if (node.tagName === 'FORM') {
                this.registerForm(node);
            }
        }

        registerFormField(field) {
            if (!field.id && !field.name) return;

            const fieldId = field.id || field.name;
            const fieldInfo = {
                element: field,
                type: field.type || field.tagName.toLowerCase(),
                name: field.name,
                id: field.id,
                placeholder: field.placeholder,
                label: this.findFieldLabel(field)
            };

            this.formCache[fieldId] = fieldInfo;

            // Notify content script about new field
            window.dispatchEvent(new CustomEvent('arabsstock:fieldRegistered', {
                detail: fieldInfo
            }));
        }

        registerForm(form) {
            if (this.isArabsStockForm(form)) {
                console.log('Arabs stock form registered:', form);

                window.dispatchEvent(new CustomEvent('arabsstock:formRegistered', {
                    detail: {
                        form: form,
                        fields: this.getFormFields(form)
                    }
                }));
            }
        }

        enhanceUploadArea(area) {
            // Add visual feedback for drag operations
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('ai-dragover');
            });

            area.addEventListener('dragleave', (e) => {
                area.classList.remove('ai-dragover');
            });

            area.addEventListener('drop', (e) => {
                area.classList.remove('ai-dragover');
            });
        }

        monitorDynamicForms() {
            // Watch for single-page app navigation
            let currentURL = location.href;

            const checkURLChange = () => {
                if (location.href !== currentURL) {
                    console.log('URL changed, rescanning for forms');

                    // Clear form cache
                    this.formCache = {};

                    // Rescan for forms after a short delay
                    setTimeout(() => {
                        this.scanForForms();
                    }, 1000);
                }
            };

            // Check for URL changes (SPA navigation)
            setInterval(checkURLChange, 1000);

            // Also listen for popstate events
            window.addEventListener('popstate', () => {
                setTimeout(() => this.scanForForms(), 500);
            });
        }

        scanForForms() {
            // Scan entire document for forms and fields
            const forms = document.querySelectorAll('form');
            forms.forEach(form => this.registerForm(form));

            const fields = document.querySelectorAll('input, textarea, select');
            fields.forEach(field => this.registerFormField(field));
        }

        exposeAPI() {
            // Create API obbbbject for content script communication
            window.arabsStockInjectorAPI = {
                // Get all cached form fields
                getFormFields: () => this.formCache,

                // Find specific field types
                findFields: (criteria) => this.findFieldsByCriteria(criteria),

                // Fill form field with proper event triggering
                fillField: (fieldId, value) => this.fillFieldAdvanced(fieldId, value),

                // Batch fill multiple fields
                fillFields: (fieldData) => this.batchFillFields(fieldData),

                // Get form data
                getFormData: (formSelector) => this.getFormData(formSelector),

                // Validate form
                validateForm: (formSelector) => this.validateForm(formSelector),
                
                // Simulate user interactions
                simulateUserInput: (field, value) => this.simulateUserInput(field, value),

                // Get upload status
                getUploadStatus: () => this.getUploadStatus()
            };

            console.log('Arabs Stock Injector API exposed');
        }

        findFieldsByCriteria(criteria) {}
        }
    }
)