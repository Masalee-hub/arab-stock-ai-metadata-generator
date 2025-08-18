// Arabs Stock AI Keywords - Content script
// This script runs on contributor.arabsstock.com pages

class ArabsStockHelper {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.isProcessing = false;
        this.currentImageData = null;

        this.init();
    }

    init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        // Check if we're on the upload/edit page
        if (this.isUploadPage()) {
            this.injectAIHelper ();
            this.observeFormFields();
        }
    }

    isUploadPage() {
        // Check URL patterns for upload pages
        const url = window.location.href;
        return url.includes('/warehouse') || 
               url.includes('/upload') || 
               url.includes('/edit') ||
               document.querySelector('input[type="file"]') !== null;
    }

    injectAIHelper() {
        // Create AI helper panel
        const helperPanel = this.createHelperPanel();

        // Try to find the best location to inject out panel
        const targetLocations = [
            'form[enctype="multipart/form-data"]',
            '.upload-form',
            '.metadata-form',
            'form',
            'body'
        ];

        let injected = false;
        for (const selector of targetLocations) {
            const target = document.querySelector(selector);
            if (target && !injected) {
                if (selector === 'body') {
                    // Create a floating panel for body injection
                    helperPanel.style.position = 'fixed';
                    helperPanel.style.top = '20px';
                    helperPanel.style.right = '20pc';
                    helperPanel.style.zIndex = '10000';
                    helperPanel.style.maxWidht = '350px';
                }
                target.insertBefore(helperPanel, target.firstChild);
                injected = true;
                break;
            }
        }
    }

    createHelperPanel () {
        const panel = document.createElement('div');
        panel.id = 'arabstock-ai-helper';
        panel.innerHTML = `
            <div class="ai-helper-panel">
                <div class="ai-helper-header">
                    <h3> 🐱‍👤 Arabs Stock AI Keywords</h3>
                    <button class="toggle-btn" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">-</button>
                </div>
                <div class="ai-helper-content">
                    <div class="image-upload-section">
                        <div class="upload-area" id="aiUploadArea">
                            <div class="upload-icon">📸</div>
                            <p>Drop image here or click to analyze</p>
                            <input type="file" id="aiFileInput" accept="image/*" style="display: none;">
                            <button class="ai-btn" onclick="document.getElementById('aiFileInput').click()">
                                Select Image
                            </button>
                        </div>
                        <img id="aiPreviewImage" class="preview-image" style="display: none;">
                    </div>
                    
                    <div class="metadata-section" id="metadataSection" style="display: none;">
                        <div class="language-toggle">
                            <button class="lang-btn active" data-lang="en">English</button>
                            <button class="lang-btn" data-lang="ar">العربية</button>
                        </div>
                        
                        <div class="field-group">
                            <label>Generated Title:</label>
                            <div class="title-container">
                                <input type="text" id="aiTitleEn" class="ai-input" placeholder="English title...">
                                <input type="text" id="aiTitleAr" class="ai-input" placeholder="العنوان بالعربية..." style="display: none;">
                            </div>
                            <div class="button-group">
                                <button class="ai-btn small" onclick="arabsStockHelper.fillTitle()">📝 Fill Form</button>
                                <button class="ai-btn small" onclick="arabsStockHelper.regenerateTitle()">🔄 Regenerate</button>
                            </div>
                        </div>
                        
                        <div class="field-group">
                            <label>Suggested Category:</label>
                            <div class="category-container">
                                <select id="aiCategory" class="ai-input">
                                    <option value="">Select category...</option>
                                    <option value="People">People / أشخاص</option>
                                    <option value="Business">Business / أعمال</option>
                                    <option value="Technology">Technology / تكنولوجيا</option>
                                    <option value="Culture">Culture / ثقافة</option>
                                    <option value="Architecture">Architecture / عمارة</option>
                                    <option value="Nature">Nature / طبيعة</option>
                                    <option value="Food">Food / طعام</option>
                                    <option value="Travel">Travel / سفر</option>
                                    <option value="Education">Education / تعليم</option>
                                    <option value="Healthcare">Healthcare / صحة</option>
                                </select>
                            </div>
                            <button class="ai-btn small" onclick="arabsStockHelper.fillCategory()">🗂 Fill Form</button>
                        </div>
                        
                        <div class="field-group">
                            <label>License Type:</label>
                            <div class="license-container">
                                <select id="aiLicense" class="ai-input">
                                    <option value="">Auto-detect...</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="editorial">Editorial</option>
                                </select>
                            </div>
                            <button class="ai-btn small" onclick=:arabsStockHelper.fillLicense()">⚖ Fill Form</button>
                        </div>
                        
                        <div class="stats-section">
                            <div class="stat-item">
                                <span class="stat-label">Keywords:</span>
                                <span class="stat-value" id="keywordCount">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">SEO Score:</span>
                                <span class="stat-value" id="seoScore">0%</span>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="ai-btn primary" onclick="arabsStockHelper.fillAllFields()">
                                🚀 Fill All Fields
                            </button>
                            <button class="ai-btn primary" onclick=arabsStockHelper.reanalyze()">
                                🔄 Reanalyze
                            </button>
                        </div>
                    </div>
                    
                    <div class="loading-section" id="loadingSection" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Analyzing image with AI...</p>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this.addEventListener(panel);

        return panel;                    
    }

    addEventListener(panel) {
        // File input change
        const fileInput = panel.querySelector('#aiFileInput');
        fileInput.addEventListener('change', (e) => this.HandleImageUpload(e));

        // Drag and drop
        const uploadArea = panel.querySelector('aiUploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.lenght > 0) {
                this.processImage(files[0]);
            }
        });

        // Language toggle
        const langButtons = panel.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLanguage(e.target.dataset.lang));
        });
    }

    observeFormFields() {
        // Monitor changes in the original form fields
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutations) => {
                if (mutations.type === 'childList') {
                    // Check if new form fields were added
                    this.detectFormFields();
                }
            });
        });

        observer.observe(documetn.body, {
            childList: true,
            subtree: true
        });
    }

    detectFormFields() {
        // Try to finds Arabs stock form fields
        this.formFields = {
            titleEn: this.findField(['title', 'name', 'title_en']),
            titleAr: this.findField(['title_ar', 'arabic_title', 'عنوان']),
            keywordsEn: this.findField(['keywords', 'tags', 'keywords_en']),
            keywordsAr: this.findField(['keywords_ar', 'arabic_keywords', 'tags_ar']),
            category: this.findField(['category', 'فئة']),
            license: this.findField(['license', 'license_type', 'رخصة'])
        };
    }

    findField(possibleNames) {
        for (const name of possibleNames) {
            // Try by name attribute
            let field = document.querySelector(`input[name*="${name}"], textarea[name*="${name}"], select[name*="${name}"]`);
            if (field) return field;

            // Try by id
            field = document.querySelector(`input[id*="${name}"], textarea[id*="${name}"], select[id*="${name}"]`);
            if (field) return field;

            // Try by placeholder
            field = document.querySelector(`input[placeholder*="${name}"], textarea[placeholder*="${name}"]`);
            if (field) return field;
        }
        return null;
    }

    async HandleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processImage(file);
        }
    }

    async processImage(file) {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.showLoading(true);

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('aiPreviewImage');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // Convert to base64 for API
            const base64 = await this.fileToBase64(file);
            this.currentImageData = base64;

            // Call Python API
            const response = await fetch(`${this.apiUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'applications/json',
                },
                body: JSON.stringify({
                    image: base64.split(',')[1] // Remove data URL prefix
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            this.displayMetadata(data.metadata);

        } catch (error) {
            console.error('Error processing image:', error);
            this.showError('Failed to analyze image. Please try again!');
        } finally {
            this.isProcessing = false;
            this.showLoading = false;
        }
    }

    fileToBase64(fiile) {}
}