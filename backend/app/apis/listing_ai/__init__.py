from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import nltk
import cv2
import numpy as np
import requests
from io import BytesIO
import base64
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
# Removed product identification import until it's fixed

router = APIRouter()

# Download required NLTK data
print('Downloading NLTK data...')
nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('stopwords', quiet=True)
print('NLTK data downloaded successfully')

class GenerateTitleRequest(BaseModel):
    product_name: str
    category: str | None = None
    brand: str | None = None
    condition: str | None = None
    key_features: list[str] | None = None

class GenerateTitleResponse(BaseModel):
    title: str

class GenerateDescriptionRequest(BaseModel):
    product_name: str
    category: str | None = None
    brand: str | None = None
    condition: str | None = None
    key_features: list[str] | None = None
    style: str | None = None

class GenerateDescriptionResponse(BaseModel):
    description: str

class AnalyzeConditionRequest(BaseModel):
    image_url: str
    product_name: str | None = None
    category: str | None = None

class AnalyzeConditionResponse(BaseModel):
    condition: str
    details: str
    confidence: float

@router.post("/generate-title")
def generate_title(request: GenerateTitleRequest) -> GenerateTitleResponse:
    """Generate an SEO-friendly title for a product listing using NLTK"""
    try:
        # Collect all relevant parts
        parts = [request.product_name]
        if request.brand:
            parts.insert(0, request.brand)
        if request.condition:
            parts.append(request.condition)
        if request.key_features:
            # Add up to 2 key features
            parts.extend(request.key_features[:2])
        
        # Join parts and ensure max length
        title = " | ".join(parts)
        if len(title) > 80:
            # Tokenize and keep important words
            tokens = word_tokenize(title)
            pos_tags = pos_tag(tokens)
            
            # Keep nouns, adjectives, and brand
            important_words = [word for word, tag in pos_tags 
                             if tag.startswith(('NN', 'JJ')) 
                             or (request.brand and word.lower() in request.brand.lower())]
            
            title = " ".join(important_words[:8])  # Keep first 8 important words
        
        return GenerateTitleResponse(title=title)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-description")
def generate_description(request: GenerateDescriptionRequest) -> GenerateDescriptionResponse:
    """Generate a detailed description for a product listing using templates"""
    try:
        # Build description parts
        parts = []
        
        # Opening
        if request.brand:
            parts.append(f"Discover this amazing {request.product_name} from {request.brand}!")
        else:
            parts.append(f"Discover this amazing {request.product_name}!")
        
        # Category
        if request.category:
            parts.append(f"Perfect for any {request.category.lower()} enthusiast.")
        
        # Condition
        if request.condition:
            condition_desc = {
                "new": "Brand new and never used.",
                "like_new": "In like-new condition with minimal signs of use.",
                "very_good": "In very good condition with minor wear.",
                "good": "In good condition with normal signs of use.",
                "fair": "In fair condition with visible wear.",
                "poor": "In poor condition and may need repair."
            }.get(request.condition.lower(), f"Condition: {request.condition}")
            parts.append(condition_desc)
        
        # Features
        if request.key_features:
            parts.append("\nKey Features:")
            for feature in request.key_features:
                parts.append(f"• {feature}")
        
        # Style
        if request.style:
            parts.append(f"\nStyle: {request.style}")
        
        # Call to action
        parts.append("\nDon't miss out on this amazing piece! Add to cart now.")
        
        description = "\n".join(parts)
        return GenerateDescriptionResponse(description=description)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-condition")
def analyze_condition(request: AnalyzeConditionRequest) -> AnalyzeConditionResponse:
    """Analyze product condition from image using OpenCV"""
    try:
        # Download image
        response = requests.get(request.image_url)
        img_array = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Enhanced image analysis
        brightness = np.mean(gray)
        
        # Edge detection for wear and damage
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        
        # Color analysis for fading
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        saturation = np.mean(hsv[:,:,1])
        
        # Determine condition based on image features
        if edge_density < 0.05 and brightness > 200 and saturation > 150:
            condition = "New"
            details = "Product appears to be in new condition with vibrant colors and minimal texture or wear patterns."
            confidence = 0.9
        elif edge_density < 0.1 and brightness > 180 and saturation > 130:
            condition = "Like New"
            details = "Product shows very minimal signs of use with good overall appearance and color retention."
            confidence = 0.85
        elif edge_density < 0.15 and brightness > 150 and saturation > 110:
            condition = "Very Good"
            details = "Product shows some minor wear but maintains good overall condition and coloring."
            confidence = 0.8
        elif edge_density < 0.2 and brightness > 120:
            condition = "Good"
            details = "Product shows normal signs of wear and use with some color fading."
            confidence = 0.75
        elif edge_density < 0.25:
            condition = "Fair"
            details = "Product shows significant wear and may have some damage. Colors appear faded."
            confidence = 0.7
        else:
            condition = "Poor"
            details = "Product shows heavy wear and may need repair. Significant fading and wear patterns visible."
            confidence = 0.65
            
        return AnalyzeConditionResponse(
            condition=condition,
            details=details,
            confidence=confidence
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
