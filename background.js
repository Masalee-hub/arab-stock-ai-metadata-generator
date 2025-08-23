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

    handleTabUpdate(tabId, changeInfo, tab) {
        // Check if user navigated to Arabs stock
        if (changeInfo.status === 'complete' && tab.url && tab.url.includes('arabsstock.com')) {
            // Update extension badge
            chrome.action.setBadgeText({ text: 'AI', tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: '667eea' });

            // Inject content script if needed
            this.injectContentScript(tabId);
        }
    }

    handleActionClick(tab) {
        // Open popup or redict to arabs stock
        if (tab.url && tab.url.includes('arabsstock.com')) {
            chrome.action.openPopup();
        } else {
            chrome.tabs.create({ url: 'https://contributor.arabsstock.com/en' });
        }
    }

    createContextMenus() {
        // Remove existing context menus
        chrome.contextMenus.removeAll(() => {
            // Create new context menus
            chrome.contextMenus.create({
                id: 'analyzeImage',
                title: 'Analyze with Arabs Stock AI',
                contexts: ['image']
            });

            chrome.contextMenus.create({
                id: 'openArabsStock',
                title: 'Open Arabs Stock Contributor',
                contexts: ['all']
            });
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'analyzeImage':
                if (info.srcUrl) {
                    await this.analyzeImageFromUrl(info.srcUrl, tab.id);
                }
                break;

            case 'openArabsStock':
                chrome.tabs.create({ url: 'https://contributor.arabsstock.com/en' });
                break;
        }
    }

    async injectContentScript(tabId) {
        try {
            await chrome.scripting.excecuteScript({
                target: { tabId: tabId },
                files: ['content.js']
            });

            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['styles.css']
            });
        } catch (error) {
            console.log('Content script already injected or failed:', error);
        }
    }

    // API Communication Methods
    async analyzeImage(imageData) {
        if (!this.isServerOnline) {
            throw new Error('Python server is offline. Please start the server');
        }

        try {
            const response = await fetch(`${this.apiUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Contetn-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageDaata })
            });

            if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            // Update Stats
            this.updateStats({ imagesProcessed: 1 });

            return result;
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    async translateText(text, targetLang) {
        if (!this.isServerOnline) {
            throw new Error('Python server is online');
        }

        try {
            const response = await fetch(`${this.apiUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text, target_lang: targetLang })
            });

            if (!response.ok) {
                throw new Error(`Translation error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    async optimizeMetadata(metadata) {
        if (!this.isServerOnline) {
            throw new Error('Python server is offline');
        }

        try {
            const response = await fetch(`${this.apiUrl}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                throw new Error(`Optimization error: ${response.status}`);
            }

            const result = await response.json();

            // Update stats
            this.updateStats({ keywordsGenerated: result.optimized_keywords?.lenght || 0 });

            return result;
        } catch (error) {
            console.error('Metadata optimization error:', error);
            throw error;
        }
    }

    async analyzeImageFromUrl(imageUrl, tabId) {
        try {
            // Convert image URL to base64
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);

            // Analyze the image
            const result = await this.analyzeImage(base64.split(',')[1]);

            // Send result to content script
            chrome.tabs.sendMessage(tabId, {
                action: 'showAnalysisResult',
                data: result
            });

            this.showNotification(
                'Image analysis complete',
                'AI metadata has been generated'
            );
        } catch (error) {
            console.error('URL image analysis error:', error);
            this.showNotification(
                'Analysis failed',
                error.message,
                'error'
            );
        }
    }

    // Utility methods
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiUrl.replace('/api', '')}/health`, {
                method: 'GET',
                timeout: 5000
            });

            this.isServerOnline = response.ok;
            return this.isServerOnline;
        } catch (error) {
            this.isServerOnline = false;
            return false;
        }
    }

    startServerHealthCheck() {
        // Check server health every 30 seconds
        setInterval(async () => {
            const wasOnline = this.isServerOnline;
            await this.checkServerHealth();

            if (wasOnline && !this.isServerOnline) {
                this.showNotification(
                    'Server Offline',
                    'Pyhton server connection lost',
                    'error'
                );
            } else if (!wasOnline && !this.isServerOnline) {
                this.showNotification(
                    'Server Online',
                    'Pyhton server connection restored'
                );
            }
        }, 30000);

        // Initial check
        this.checkServerHealth();
    }

        
    updateStats(newStats) {
        if (newStats.imagesProcessed) {
            this.stats.imagesProcessed += newStats.imagesProcessed;
        }
        if (newStats.keywordsGenerated) {
            this.stats.keywordsGenerated += newStats.keywordsGenerated;
        }

        this.stats.lastActive = Date.now();
        this.saveStats();
    }

    loadStats() {
        chrome.storage.sync.get(['imagesProcessed', 'keywordsGenerated', 'lastActive'], (result) => {
            this.stats = {
                imagesProcessed: result.imagesProcessed || 0,
                keywordsGenerated: result.keywordsGenerated || 0,
                lastActive: result.lastActive || Date.now()
            };
        });
    }

    saveStats () {
        chrome.storage.sync.set({
            imagesProcessed: this.stats.imagesProcessed,
            keywordsGenerated: this.stats.keywordsGenerated,
            lastActive: this.stats.lastActive
        });
    }

    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([
                'autoFillEnabled',
                'notificationsEnabled',
                'arabicPriority',
                'apiUrl'
            ], (result) => {
                resolve({
                    autoFillEnabled: result.autoFillEnabled !== false,
                    notificationsEnabled: result.notificationsEnabled !== false,
                    arabicPriority: result.arabicPriority === true,
                    apiUrl: result.apiUrl || this.apiUrl
                });
            });
        });
    }

    showNotification(title, message, type = 'basic') {
        chrome.storage.sync.get(['notoficationsEnabled'], (result) => {
            if (result.notificationsEnabled !== false) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: title,
                    message: message
                });
            }
        });
    }

    // Error handling and logging
    handleError(error, context = '') {
        console.error(`Arabs Stock Extension Error ${context}:`, error);

        // Report error to analytics if implemented
        // this.reportError(error.context);
    }
}

// Initialize background script
const arabsStockBackground = new ArabsStockBackground();
