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

    addEventListener(panel) {}
}