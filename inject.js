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

        hookFormHandlers() {}
    }
})