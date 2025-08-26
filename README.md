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
# Create virtual environment (recommended)
python -m venv arabs-stock-env

# Activate environment
# Windows:
arabs-stock-env\Scripts\activate
# macOS/Linux:
source arabs-stock-env/bin/activate

# Install dependencies
pip install -r requirements.txt