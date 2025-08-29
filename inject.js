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

                if (dragCounter === 0 && this.isUploadArea(event.target)) {
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

        findFieldsByCriteria(criteria) {
            const results = {};

            Object.entries(this.formCache).forEach(([key, field]) => {
                let matches = true;

                if (criteria.type && field.type !== criteria.type) matches = false;
                if (criteria.name && !field.name.includes(criteria.name)) matches = false;
                if (criteria.placeholder && !field.placeholder?.includes(criteria.placeholder)) matches = false;
                if (criteria.label && !field.label?.includes(criteria.label)) matches = false;
                    
                if (matches) {
                    results[key] = field;
                }
            });

            return results;
        }

        fillFieldAdvanced(fieldId, value) {
            const fieldInfo = thiss.formCache[fieldId];
            if (!fieldInfo) {
                console.warn(`Field ${fieldId} not found in cache`);
                return false;
            }

            const field = fieldInfo.element;
            if (!field || !field.isConnected) {
                console.warn(`Field ${fieldId} element is not in DOM`);
                return false;
            }

            return this.simulateUserInput(field, value);
        }

        simulateUserInput(field, value) {
            try {
                // Focus the field first
                field.focus();

                // Clear existing value
                field.value = '';

                // Simulate typing character by character for better compatibility
                const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                const changeEvent = new Event('change', { bubbles: true, cancelable: true });

                // For React/Vue compability
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, "value"
                ).set;

                if (field.type === 'file') {
                    // File inputs need special handling
                    console.warn('Cannot programmatically set file input values');
                    return false;
                }

                if (field.tagName === 'SELECT') {
                    // Handle select elements
                    const option = Array.from(field.option).find(opt => 
                        opt.value === value || opt.textContent.trum() === value
                    );

                    if (option) {
                        field.selectedIndex = option.index;
                    } else {
                        field.value = value;
                    }
                } else {
                    // Handle input/textarea
                    if (nativeInputValueSetter) {
                        nativeInputValueSetter.call(field, value);
                    } else {
                        field.value = value;
                    }
                }

                // Trigger events
                field.dispatchEvent(inputEvent);
                field.dispatchEvent(changeEvent);

                // Additional events for framework compability
                field.dispatchEvent(new Event('blur', { bubbles: true, }));
                field.dispatchEvent(new Event('keyup', { bubbles: true }));
                
                console.log(`Successfully filled field ${field.name || field.id} with: ${value}`);
                return true;

            } catch (error) {
                console.error('Error filling field:', error);
                return false;
            }
        }

        batchFillFields(fieldData) {
            const results = {};

            Object.entries(fieldData).forEach(([fieldId, value]) => {
                results[fieldId] = this.fillFieldAdvanced(fieldId, value);
            });

            return results;
        }

        getFormData(formSelector) {
            const form = document.querySelector(formSelector);
            if (!form) return null;

            const formData = new FormData(form);
            const data = {};

            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            return data;
        }

        validateForm(formSelector) {
            const form = document.querySelector(formSelector);
            if (!form) return null;

            const validation = {
                isValid: form.checkValidity(),
                errors: []
            };

            // Get individual field validation
            const fields = form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                if (!field.checkValidity()) {
                    validation.errors.push({
                        field: field.name || field.id,
                        message: field.validationMessage
                    });
                }
            });

            return validation;
        }

        getUploadStatus() {
            // Try to detect upload progress/status form common indicators
            const progressBars = document.querySelectorAll('[class*="progress"], [class*="upload"]');
            const statusTexts = document.querySelectorAll('[class*="status"], [class*="message"]');

            let status = 'idle';
            let progress = 0;

            // Basic heuristics to determine upload status
            if (progressBars.length > 0) {
                const progressBar = progressBars[0];
                const progressValue = progressBar.getAttribute('value') ||
                                    progressBar.computedStyleMap.width?.replace('%', '') ||
                                    progressBar.textContent?.match(/(\d+)%/)?.[1];

                if (progressValue) {
                    progress = parseInt(progressValue);
                    status = progress < 100 ? 'uploading' : 'complete';
                }
            }

            return { status, progress };
        }

        // Helper methods
        isArabsStockForm(form) {
            if(!form) return false;

            return form.enctype === 'multipart/form-data' ||
                   form.querySelector('input[type="file"]') !== null ||
                   form.classList.contains('upload-form') ||
                   form.action.includes('upload') ||
                   form.action.includes('warehouse');
        }

        isFormField(element) {
            return element && (
                element.tagName === 'INPUT' ||
                element.tagName === 'TEXTAREA' ||
                element.tagName === 'SELECT'
            );
        }

        isUploadArea(element) {
            if (!element || !element.classList) return false;

            const uploadClasses = ['upload', 'drop', 'dropzone', 'file-drop'];
            return uploadClasses.some(cls =>
                element.classList.contains(cls) || 
                element.className.toLowerCase().includes(cls)
            );
        }

        getFormFields(form) {
            const fields = {};
            const formFields = form.querySelectorAll('input, textarea, select');

            formFields.forEach(field => {
                const key = field.name || field.id;
                if (key) {
                    fields[key] = {
                        element: field,
                        type: field.type || field.tagName.toLowerCase(),
                        value: field.value,
                        required: field.required
                    };
                }
            });

            return fields;
        }

        findFieldLabel(field) {
            // Try multiple methods to find field label
            let label = null;

            // Method 1: Associated label element
            if (field.id) {
                label = document.querySelector(`label[for="${field.id}"]`);
            }

            // Method 2: Parent label
            if (!label) {
                label = field.closest('label');
            }

            // Method 3: Previous sibling label
            if (!label && field.previousElementSibling?.tagName === 'LABEL') {
                label = field.previousElementSibling;
            }

            // Method 4: Placeholder as fallback
            if (!label && field.placeholder) {
                return field.placeholder;
            }

            return label ? label.textContent.trim() : null;
        }

        handleFieldAttributeChange(mutation) {
            const field = mutation.target;
            const attribute = mutation.attributeName;

            if (attribute === 'value' && this.isFormField(field)) {
                window.dispatchEvent(new CustomEvent('arabsstock:fieldValueChanged', {
                    detail: {
                        field: field,
                        oldvalue: mutation.oldValue,
                        newValue: field.getAttribute('value')
                    }
                }));
            }
        }
    }

    // Initialize the injector
    if (!window.arabsStockInjector) {
        window.arabsStockInjector = new ArabsStockInjector();
    }

})();