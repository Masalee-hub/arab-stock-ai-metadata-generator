// Arabs Stock AI Keywords - Background Service Worker
// Handles extension lifecycle, API comunication, and data management

class ArabsStockBackground {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.isServerOnline = false;
        this.stats = {
            imagesProcessed: 0,
            keywordsGenerated: 0,
            lastActive: Date.now()
        };

        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();

        // Load saved stats
        this.loadStats();

        // Check server status periodically
        this.startServerHealthCheck();

        console.log('Arabs Stock AI Keywords Background Script Initialized');
    }

    setupEventListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstall(details);
        });

        // Message Handling
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        })

        // Tab Updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Browse action (extension icon) clicked
        chrome.action.onClicked.addListener((tab) => {
            this.handleActionClick(tab);
        });

        // Context menu creation
        chrome.runtime.onStartup.addListener(() => {
            this.createContextMenus();
        });
    }

    handleInstall(details) {
        if (details.reason === 'install') {
            console.log('Arabs Stock AI Keywords installed');

            // Set deafult settings
            chrome.storage.sync.set({
                autoFillEnabled: true,
                notificationEnabled: true,
                arabicPriority: false,
                apiUrl: this.apiUrl,
                imagesProcessed: 0,
                keywordsGenerated: 0
            });

            // Open welcome page
            chrome.tabs.create({
                url: 'https://contributor.arabsstock.com/en'
            });

            // Show installation notification
            this.showNotification(
                'Arabs Stock AI Keywords installed successfully!',
                'Navigate to Arabs Stock to start using the extensions.'
            );
        }

        this.createContextMenus();
    }

    async handleMessage(request, sender, sendResponse){
        try {
            switch (request.action) {
                case 'analyzeImage':
                    const result = await this.analyzeImage(request.imageData);
                    sendResponse({ success: true, data: result });
                    break;

                case 'translateText':
                    const translation = await this.translateText(request.text, request.targetLang);
                    sendResponse({ success: true, data: translation });
                    break;

                case 'optimizeMetadata':
                    const optimized = await this.optimizeMetadata(request.metadata);
                    sendResponse({ success: true, data: optimized });
                    break;
                    
                case 'updateStats':
                    this.updateStats(request.stats);
                    sendResponse({ success: true });
                    break;

                case 'getStats':
                    sendResponse({ success: true, data: this.stats });
                    break;

                case 'checkServerStatus':
                    const status = await this.checkServerHealth();
                    sendResponse({ success: true, online: status });
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, data: settings });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unkown action' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {}

}