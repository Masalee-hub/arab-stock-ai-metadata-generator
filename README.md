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
2. 

