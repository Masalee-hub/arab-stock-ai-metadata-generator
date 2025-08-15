# Arabs Stock AI Metadata Generator
# Python Backend for Browser Extension

import json
import requests
import base64
from PIL import Image
import io
from typing import Dict, List, Tuple, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import google.generativeai as genai
from googletrans import Translator
import random
import os
from enum import Enum
from dataclasses import dataclass

app = Flask(__name__)
CORS(app)   # Enable CORS for browser extension

class AIProvider(Enum):
    OPENAI = 'openai'
    GEMINI = 'gemini'
    OFFLINE ='offline'

@dataclass
class AIConfig:
    provider: AIProvider
    api_key: str
    model: str = None

class ArabStockMetadataGenerator:
    def __init__(self):
        self.translator = Translator()
        self.current_ai_config = AIConfig(
            provider=AIProvider.OFFLINE,
            api_key="",
            model=""
        )

        # Initialize AI providers
        self.setup_ai_providers()

        #Arabs Stock specific categories
        self.categories = {
            "People": "أشخاص",
            "Business": "أعمال",
            "Technology": "تكنولوجيا",
            "Culture": "ثقافة",
            "Architecture": "عمارة",
            "Nature": "طبيعة",
            "Food": "طعام",
            "Travel": "سفر",
            "Education": "تعليم",
            "Healthcare": "صحة",
            "Sports": "رياضة",
            "Art": "فن",
            "Religion": "دين",
            "Fashion": "أزياء",
            "Transportation": "نقل"
        }

        # High-performing keywords for Arab markets
        self.trending_keywords = {
            "en": [
                "Arab", "Middle East", "UAE", "Saudi Arabaia", "Qatar", "Dubai",
                "Islamic", "Muslim", "Gulf", "Traditional", "Modern", "Luxury",
                "Business", "Professional", "Culture", "Heritage", "Family",
                "Technology", "Innovation", "Education", "Youth", "Success"
            ],
            "ar": [
                "عربي", "الشرق الأوسط", "الإمارات", "السعودية", "قطر", "دبي",
                "إسلامي", "مسلم", "خليجي", "تقليدي", "حديث", "فاخر",
                "أعمال", "مهني", "ثقافة", "تراث", "عائلة",
                "تكنولوجيا", "ابتكار", "تعليم", "شباب", "نجاح"
            ]
        }

    def setup_ai_providers(self):
        """Initialize AI providers based on available API keys"""
        self.available_providers = []

        # check OpenAI
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            openai.api_key = openai_key
            self.available_providers.append(AIProvider.OPENAI)
            print('✅ OpenAI provider available')

        # check Gemini
        gemini_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.available_providers.append(AIProvider.GEMINI)
            print('✅ Gemini provider available')

        # Offline mode always available
        self.available_providers.append(AIProvider.OFFLINE)

        # set default provider
        if self.available_providers:
            self.current_ai_config.provider = self.available_providers[0]

    def set_ai_provider(self, provider: str, api_key: str=None, model: str=None) -> bool:
        """Set the current AI provider"""
        try:
            if provider.lower() == 'openai':
                if api_key:
                    openai.api_key = api_key
                    os.environ['OPEN_AI_KEY'] = api_key

                self.current_ai_config = AIConfig(
                    provider=AIProvider.OPENAI,
                    api_key=api_key or os.getenv('OPENAI_API_KEY', ''),
                    model=model or "gpt-4-vision-preview"
                )

                # Test the API key
                if self._test_openai_connection():
                    return True
                else:
                    raise Exception('Invalid OpenAI API key')

            elif provider.lower() == 'gemini':
                if api_key:
                    genai.configure(api_key=api_key)
                    os.environ['GEMINI_API_KEY'] = api_key

                self.current_ai_config = AIConfig(
                    provider=AIProvider.GEMINI,
                    api_key=api_key or os.getenv('GEMINI_API_KEY', ''),
                    model=model or "gemini-pro-vision"
                )

                # Test the API key
                if self._test_gemini_connection():
                    return True
                else:
                    raise Exception('Invalid Gemini API key')

            elif provider.lower() == 'offline':
                self.current_ai_config = AIConfig(
                    provider=AIProvider.OFFLINE,
                    api_key="",
                    model='offline'
                )
                return True
            else:
                raise Exception('Unsupported AI Provider')

        except Exception as e:
            print(f"Error setting AI provider: {e}")
            # Fallback to offline mode
            self.current_ai_config = AIConfig(
                provider=AIProvider.OFFLINE,
                api_key="",
                model='offline'
            )
            return False

    def _test_openai_connection(self) -> bool:
        """Test OpenAI API connection"""
        try:
            response = openai.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[{"role": "user", "content": "test"}],
                max_token=5
            )
            return True
        except Exception as e:
            print(f"OpenAI connection test failed: {e}")
            return False

    def _test_gemini_connection(self) -> bool:
        """Test Gemini API connection"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("test")
            return True
        except Exception as e:
            print(f"Gemini connection test failed: {e}")
            return False

    def analyze_image_with_ai(self, image_data: str) -> Dict:
        """Analyze image using the selected AI provider"""
        try:
            if self.current_ai_config.provider == AIProvider.OPENAI:
                return self._analyze_with_openai(image_data)
            elif self.current_ai_config.provider == AIProvider.GEMINI:
                return self._analyze_with_gemini(image_data)
            else:
                return self._analyze_offline(image_data)
        except Exception as e:
            print(f"AI analysis error: {e}")
            return  self._analyze_offline(image_data)

    def _analyze_with_openai(self, image_data: str) -> Dict:
        """Analyze image using OpenAI Vision API"""
        try:
            response = openai.chat.completions.create(
                model=self.current_ai_config.model,
                meesages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this image for stock photography metadata.
                                Focus on: main subject, people, ibjects, setting, mood, 
                                Return a JSON with: main_subject, people (array), object (array), setting, mood, colors (array), style, cultural_context.
                                Keeo description concise and stock-photo appropriate."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64, {image_data}"}
                            }
                        ]
                    }
                ],
                max_tokens=300
            )

            content = response.choices[0].message.content
            # Try to extract JSON from response
            try:
                analysis = json.loads(content)
            except:
                # If not valid JSON, create structure response from text
                analysis = self._parse_text_analysis(content)

        except Exception as e:
            print(f"OpenAI analysis error: {e}")
            return self._get_fallback_analysis()

    def _analyze_with_gemini(self, image_data: str) -> Dict:
        """Analyze image using Gemini Vision API"""
        try:
            # Convert base64 to PIL Image for gemini
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))

            model = genai.GenerativeModel('gemini-pro-vision')

            prompt = """Analyze this image for stock photography metadata for Arab/Middle Eastern markets.
            Describe: main subject, people, objects, setting, mood, colors, style, cultural context.
            Format as JSON: {"main_subject": "", "people": [], "objects": [], "setting": "", "mood": "", "colors": [], "style": "", "cultural_context": ""}"""

            response = model.generate_content([prompt, image])

            # Try to extract JSON from response
            try:
                content = response.text
                # Look for JSON in the response
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end != 0:
                    json_str = content[start:end]
                    analysis = json.loads(json_str)
                else:
                    analysis = self._parse_text_analysis(content)
            except:
                analysis = self._parse_text_analysis(response.text)

            return analysis

        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return self._get_fallback_analysis()

    def _analyze_offline(self, image_data: str) -> Dict:
        """Offline analysis using basic image processing"""
        try:
            # Convert base64 to PIL image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))

            # Basic image analysis
            width, height = image.size
            aspect_ratio = width / height

            # Determine likely content based on aspect ratio and size
            if aspect_ratio >1.5:
                setting = "landscape or panoramic view"
                main_subject = "wide scene"
            elif aspect_ratio < 0.7:
                setting = "portrait or vertical composition"
                main_subject = "peson or tall subject"
            else:
                setting = "standard composition"
                main_subject = "balanced scene"

            # Get dominant colors (simplified)
            image_rgb = im,age.convert('RGB')
            colors = ['blue', 'red', 'green', 'yelllow', 'white', 'black'] # Simplified

            return {
                "main_subject": main_subject,
                "people": ["person"],
                "objects": ["general object"],
                "setting": setting,
                "mood": "professional",
                "colors": random.sample(colors, 3),
                "style": "modern",
                "cultural_context": "arab business enviroment"
            }

        except Exception as e:
            print(f"Offline analysis error: {e}")
            return self._get_fallback_analysis()
