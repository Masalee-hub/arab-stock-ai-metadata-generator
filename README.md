# 🚀 Arabs Stock AI Keywords Extension - Setup Guide

## Overview
This extension provides AI-powered metadata generation for Arabb Stock Contributor with support for multiple AI providers (OpenAI, Gemini, or Offline mode).

## 👀 Features
- **Multi-AI Support**: Choose between OpenAI GPT-4 Vision, Google Gemini, or Offilen mode
- **Bilingual Generation**: Arabic and English titles/keywords
- **Smart Analysis**: AI-powered image analysis for stock photography
- **Auto-fill**: One-click from filling analysis for stock
- **SEO Optimization**: Keywords optimized for Arab markets

## 📝 Prequisites
- Python3.8+ installed
- Chrome/Edge browser (Manifest V3 support)
- Arabs Stock contributor account

## 🛠 Installation Steps

### 1.Download/clone Extension Files
Create a folder for the extension and add these files:
- `app.py` - Pyhton backend
- `manifest.json` - Extension manifest
- `content.js` - Content script
- `background.js` - Background script
- `popup.html` - Extension popup
- `styles.css` - Styles
- `requitments.txt` - Python dependecies

### 2.Set Up Python Environment

```bash
# Create virtual environment (recomended)
python -m venv arabs-stock-env

# Activate environment
# Windows:
arabs-stock-env\Scripts\activate
# macOS/Linux:
source arabs-stock-env/bin/activate

# Install dependencies
pip install -r requitments.txt
```

### 3.Configure AI Providers (Choose Your Preferred Option)

**Option A: OpenAI (Recomended for Best Results)**
1. Get API key from https://platform.openai.com/api-keys
2. Set environment variable:
```bash
# Windows:
set OPENAI_API_KEY=your-openai-api-key-here

# macOS/Linux:
export OPENAI_API_KEY="your-openai-api-key-here"
```

**Option B: Google Gemini (Fast & Cost-Effective)**
1. Get API key from: https://makersuite.google.com/app/apikey or https://aistudio.google.com/apikey
2. Set environment  variable:
```bash
# Windows:
set GEMINI_API_KEY=your-gemini-api-key-here

# macOS/Linux:
export GEMINI_API_KEY="your-gemini-api-key-here"
```

**Option C: Offline Mode (No API key Required)**
- Works without any API keys
- Provides bbbasic image analysis
- Good for testing and basic metadata generation

### 4.Start Python Server

```bash
python app.py
```
You should see:
```bash
🚀 Arabs Stock AI Metadata Generator Starting...
💻 Server will run on http://localhost:5000
✅ Available AI Providers: 'openai', 'offline' (or similar)
✨ Current Provider: offline
```

### 5.Install Browser Extension

1. Open chrome/edge browser
2. Go to extension page (`chrome://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select your extension folder
6. Extension should appear in toolbar

### 6.Test Installation

1. Navigate to: https://contributor.arabsstock.com/en/warehouse?type-Images
2. Click the extension icon
3. Check connection status shows "Connected via [PROVIDER]"
4. Upload an image to test AI analysis

## 🔑 Using the Extension

### Basic Workflow
1. **Open Arabs Stock** contributor panel
2. **Upload/edit** an image
3. **Extension appears** automatically on the page
4. **Drag/drop image** to AI analysis area
5. **Review generated** titles and keywords
6. **Click "Fill All Fields"** to auto-populate form
7. **Submit** your optimized content!

### AI Provider Selection
- Use the popup to switch 
- Real-time translation available
- Keywords optimized for Arab markets


## ⚙ Configuration Options

### Extension Setting (Popup)
- **Auto-fill forms**: Automically fill detected form fields
- **Show notification**: Display success/error messages
- **Arabic priority**: Prioritize Arabic content generation

### AI Provider Settings
- **Provider Selection**: Choose between OpenAI, Gemini, or Offline
- **Model Selection**: Different models for different providers
- **API Key Management**: Secure key storage


## 💯 Troubleshooting

### Python Server Issues
```bash
# Check if server is running
curl http://localhost:5000/health

# Common fixes:
pip install --upgrade pip
pip install -r requitments.txt --force-reinstall
```

### Extension Issues
- Check Developer Console (F12) for errors
- Reload extension in chrome://extensions/
- Verify Arabs Stock page is loaded

### API Key Issues
- Ensure extension has access to contributor.arabsstock.com
- Check if popup blocker is disabled
- Verify extension is enabled


## 📊 API Endpoints Reference

| **Endpoint** | **Method** | **Description** |
| :----------- | :--------- | :-------------- |
| `/health` | GET | Check server status |
| `/api/providers` | GET | List available AI providers |
| `/api/providers/set` | POST | Set current AI provider |
| `/api/tes-provider` | POST | Test provider connection |
| `/api/analyze` | POST | Analyze image with AI |
| `/api/translate` | POST | Translate text |
| `/api/optimize` | POST | Optimize metadata |
| `/api/keywords/suggest` | POST | Get keyword suggestions |


## 🔐 Security & Privacy
- API keys stored locally in browser
- Images processed temporarily (not stored)
- No data sent to third parties except chosen AI provider
- All communication over HTTPS

## 📣 Tips for Best Results

### For OpenAI:
- GPT-4 Visions provides most accurate analysis
- Higher cost but best cultural context understanding

### For Gemini:
- Faster processing than OpenAI
- Good bbalance of speed and accuracy
- More cost-effective for high volume

### For Offline Mode:
- No API costs
- Basic but useful analysis
- Good for testing and development

### General Tips:
- Use high-quality, well-lit images
- Review and custoimize generated metadata
- test different provides for your content type
- Keep API keys secure and rotate regularly


## 🆘 Support

### Common Issues:
1. **"Server offline"** - Restart Python server
2. **"Invalid API key"** - Check key format and permissions
3. **"Extension not working"** - Reload extension and Arabs Stock page
4. **"Poor analysis quality"** - Try different AI provider or higher resolution image

### Getting Help:
- Check browser console for error messages
- Verify Python server logs
- Test with simple images first
- Ensure all dependencies are installed


## 🔄 Update & Maintenance

### Updating Python Dependencies:
```bash
pip install -r requirements.txt --upgrade
```

### Updating Extension:
1. Download new version files
2. Replace old files
3. Reload extension in browser

### Backup Settings:
- Extension settings auto-sync with chrome
- Export/import available in extension popup


## 🙌 Success!

Once set up correctly, you should be able to: ✅ Generate AI-powered Arabic and English titles ✅ Get culturally relevant keyword suggestions ✅ Auto-fill Arabs Stock upload forms ✅ Switch bbetween AI providers seamlessly ✅ Track usage statistics ✅ Optimize metadata for Arab markets

Happy contributing to Arabs Stock! 🚀

### Author!

LinkedIn[https://www.linkedin.com/in/haederali/]
GitHub[https://www.github.com/Masalee-hub]