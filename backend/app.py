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
                "Arab", "Middle East", "UAE", "Saudi Arabia", "Qatar", "Dubai",
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
                                Keep description concise and stock-photo appropriate."""
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
                main_subject = "person or tall subject"
            else:
                setting = "standard composition"
                main_subject = "balanced scene"

            # Get dominant colors (simplified)
            image_rgb = image.convert('RGB')
            colors = ['blue', 'red', 'green', 'yellow', 'white', 'black'] # Simplified

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

    def _parse_text_analysis(self, text: str) -> Dict:
        """Parse text analysis into structured format when, JSON parsing fails """
        return {
            "main_subject": "professional scene",
            "people": ["person", "professional"],
            "objects": ["business items"],
            "setting": "modern environment",
            "mood": "professional",
            "colors": ["blue", "white", "gray"],
            "style": "contemporary",
            "cultural_context": "arab business setting"
        }

    def _get_fallback_analysis(self) -> Dict:
        """Fallback analysis when AI service is unavailable"""
        return {
            "main_subject": "professional scene",
            "people": ["person", "professional"],
            "objects": ["business items"],
            "setting": "modern environment",
            "mood": "professional",
            "colors": ["blue", "white", "gray"],
            "style": "contemporary",
            "cultural_context": "arab business setting"
        }

    def generate_titles(self, analysis: Dict) -> Dict[str, str]:
        """Generated optimized titles in English and Arabic"""

        # English title generation with AI-based analysis
        main_subject = analysis.get("main_subject", "business scene")
        setting = analysis.get("setting", "office")
        cultural_context = analysis.get("cultural_context", "arab")

        en_templates = [
            f"Professional {main_subject} in Modern Arab {setting}",
            f"Middle Eastern {main_subject} - Business Excellence",
            f"Contemporary Arab {main_subject} in {setting}",
            f"Gulf Business - {main_subject} Success Story",
            f"Islamic Culture - Modern {main_subject}",
            f"Arab Professional {main_subject} Meeting",
            f"Dubai Style {main_subject} in {setting}",
            f"Saudi Business {main_subject} Innovation"
        ]

        # Arabic title generation
        ar_templates = [
            f"اجتماع أعمال عربي مهني في مكتب حديث",
            f"التميز في الأعمال الشرق أوسطية - مشهد مهني",
            f"ثقافة عربية معاصرة في بيئة العمل",
            f"أعمال الخليج - قصة نجاح مهنية",
            f"الثقافة الإسلامية - مشهد أعمال حديث",
            f"اجتماع مهني عربي ناجح",
            f"أسلوب دبي في الأعمال المهنية",
            f"ابتكار الأعمال السعودية الحديث"
        ]

        en_title = random.choice(en_templates)
        ar_title = random.choice(ar_templates)

        return {
            "en": en_title,
            "ar": ar_title
        }

    def generate_keywords(self, analysis: Dict) -> Dict[str, List[str]]:
        """Generate relevant keywords in both languages based on AI analysis"""

        base_keywords_en = []
        base_keywords_ar = []

        # Extract keywords from analysis
        main_subject = analysis.get("main_subject", "").lower()
        people = analysis.get("people", [])
        objects = analysis.get("objects", [])
        setting = analysis.get("setting", "").lower()
        mood = analysis.get("mood", "").lower()
        cultural_context = analysis.get("cultural_context", "").lower()

        # Add subject based keywords
        if any(word in main_subject for word in ["business", "meeting", "professional"]):
            base_keywords_en.extend(["business", "professional", "meeting", "office", "corporate", "teamwork"])
            base_keywords_ar.extend(["تكنولوجيا", "رقمي", "ابتكار", "كمبيوتر", "تقني"])

        if any(word in main_subject for word in ["technology", "computer", "digital"]):
            base_keywords_en.extend(["technology", "digital", "innovation", "computer", "tech"])
            base_keywords_ar.extend(["تكنولوجيا", "رقمي", "ابتكار", "كمبيوتر", "تقني"])

        # add people-based keywords
        if people:
            base_keywords_en.extend(["people", "person", "team", "group", "professional"])
            base_keywords_ar.extend(["أشخاص", "شخص", "فريق", "مجموعة", "مهني"])

        # add cultural context keywords
        if "arab" in cultural_context or "middle" in cultural_context:
            base_keywords_en.extend(["Arab", "Middle Eastern", "Islamic", "Muslim", "Gulf"])
            base_keywords_ar.extend(["عربي", "شرق أوسطي", "إسلامي", "مسلم", "خليجي"])

        # add mood-based keywords
        if "professional" in mood:
            base_keywords_en.extend(["success", "achievement", "excellence"])
            base_keywords_ar.extend(["نجاح", "إنجاز", "تميز"])

        # add objects as keywords
        base_keywords_en.extend([obj.lower() for obj in objects if isinstance(obj, str)])

        # add colors and style
        colors = analysis.get("colors", [])
        base_keywords_en.extend(colors)

        style = analysis.get("style", "")
        if style:
            base_keywords_en.append(style)

        # add trending keywords for better performance
        base_keywords_en.extend(random.sample(self.trending_keywords["en"], 5))
        base_keywords_ar.extend(random.sample(self.trending_keywords["ar"], 5))

        # Remove duplicates and limit
        final_en = list(set([kw for kw in base_keywords_en if kw and len(kw) > 1]))[:30]
        final_ar = list(set([kw for kw in base_keywords_ar if kw and len(kw) > 1]))[:30]

        return {
            "en": final_en,
            "ar": final_ar
        }

    def suggest_category(self, analysis: Dict) -> Tuple[str, str]:
        """Suggest the most appropriate category based on AI analysis"""

        main_subject = analysis.get("main_subject", "").lower()
        objects = [obj.lower() for obj in analysis.get("objects", []) if isinstance(obj, str)]
        setting = analysis.get("setting", "").lower()
        cultural_context = analysis.get("cultural_context", "").lower()

        # Business category detection
        if any(word in main_subject for word in ["business", "meeting", "professional", "office"]):
            return "Business", "أعمال"

        # People category detection
        elif any(word in main_subject for word in ["people", "person", "family", "group"]):
            return "People", "أشخاص"

        # Technology category detection
        elif any(word in main_subject + " ".join(objects) for word in ["technology", "computer", "digital", "tech", "laptop"]):
            return "Technology", "تكنولوجيا"

        # Culture category detection
        elif any(word in cultural_context for word in ["culture", "traditional", "heritage", "islamic"]):
            return "Culture", "ثقافة"

        # Architecture category detection
        elif any(word in setting for word in ["building", "architecture", "contruction", "city"]):
            return "Architecture", "عمارة"

        # Default to people category
        else:
            return "People", "أشخاص"

    def determine_license_type(self, analysis: Dict) -> str:
        """Determine if image should be commercial or editorial based on AI analysis"""

        main_subject = analysis.get("main_subject", "").lower()
        objects = [obj.lower() for obj in analysis.get ("objects", []) if isinstance(obj, str)]
        setting = analysis.get("setting", "").lower()

        # Editorial licence indicators
        editorial_indicators = [
            "news", "event", "celebrity", "politician", "protest", "demonstration",
            "breaking news", "journalism", "reporter", "interview", "press conference"
        ]

        if any(indicator in main_subject + " ".join(objects) + setting for indicator in editorial_indicators):
            return "editorial"
        else:
            return "commercial"

# Enhanced API Endpoints with AI Provider Selection

@app.route('/api/providers', methods=['GET'])
def get_available_providers():
    """Get list of available AI roviders"""
    generator = ArabStockMetadataGenerator

    providers_info = []

    for provider in generator.available_providers:
        provider_info = {
            "name": provider.value,
            "display_name": provider.value.title(),
            "current": provider == generator.current_ai_config.provider,
            "requires_api_key": provider != AIProvider.OFFLINE
        }

        if provider == AIProvider.OPENAI:
            provider_info["models"] = ["gpt-4-vision-preview", "gpt-4o", "gpt-4-turbo"]
            provider_info["description"] = "OpenAI GPT-4 Vision - Most accurate analysis"
        elif provider == AIProvider.GEMINI:
            provider_info["models"] = ["gemini-pro-vision", "gemini-1.5-pro"]
            provider_info["description"] = ["Google Gemini - Fast and reliable"]
        else:
            provider_info["models"] = ["offline"]
            provider_info["description"] = ["Offline mode - Basic analysis without API"]

        providers_info.append(provider_info)

    return jsonify({
        "providers": providers_info,
        "current_provider": generator.current_ai_config.provider.value
    })

@app.route('/api/providers/set', methods=['POST'])
def set_ai_provider():
    """Set the current AI provider"""
    try:
        data = request.json
        provider = data.get('provider')
        api_key = data.get('api_key')
        model = data.get('model')

        if not provider:
            return jsonify({"error": "Provider name is required"}), 400

        generator = ArabStockMetadataGenerator()
        success = generator.set_ai_provider(provider, api_key, model)

        if success:
            return jsonify({
                "status": "success",
                "message": f"Successfully switched to {provider}",
                "current_provider": generator.current_ai_config.provider.value,
                "model": generator.current_ai_config.model
            }), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Main endpoint to analyze image and generate metadata with selected AI provider"""

    try:
        data = request.json
        image_data = data.get('image') # Base64 encoded image

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        generator = ArabStockMetadataGenerator()

        # Analyze image with selected AI provider
        analysis = generator.analyze_image_with_ai(image_data)

        # Generate metadata based on analysis
        titles = generator.generate_titles(analysis)
        keywords = generator.generate_keywords(analysis)
        category = generator.suggest_category(analysis)
        license_type = generator.determine_license_type(analysis)

        response = {
            "status": "success",
            "metadata": {
                "titles": titles,
                "keywords": keywords,
                "category": {
                    "en": category[0],
                    "ar": category[1]
                },
                "license": license_type,
                "analysis": analysis
            },
            "ai_provider": generator.current_ai_config.provider.value,
            "model_used": generator.current_ai_config.model
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/test-provider', methods=['POST'])
def test_provider():
    """Test AI provider connection"""
    try:
        data = request.json
        provider = data.get('provider')
        api_key = data.get('api_key')

        if not provider:
            return jsonify({"error": "Provider name is required"}), 400

        generator = ArabStockMetadataGenerator()