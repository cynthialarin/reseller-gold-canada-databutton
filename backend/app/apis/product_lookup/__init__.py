from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import json
from typing import List, Optional
from PIL import Image
import io
import base64
# Image processing imports
import databutton as db

router = APIRouter()

class ProductLookupRequest(BaseModel):
    barcode: str

class ProductImage(BaseModel):
    url: str
    is_primary: bool = False

class ProductDetails(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    images: List[ProductImage] = []
    barcode: Optional[str] = None

class ProcessImageRequest(BaseModel):
    image_data: str  # Base64 encoded image
    remove_background: bool = False
    make_square: bool = True

class ProcessImageResponse(BaseModel):
    processed_image: str  # Base64 encoded image

def fetch_from_open_food_facts(barcode: str) -> ProductDetails:
    """Fetch product details from Open Food Facts API"""
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") != 1:
            raise HTTPException(status_code=404, detail="Product not found")
            
        product = data["product"]
        
        # Extract images if available
        images = []
        if product.get("image_url"):
            images.append(ProductImage(url=product["image_url"], is_primary=True))
            
        # Add additional images if available
        for i in range(1, 10):  # Check up to 9 additional images
            key = f"image_url_{i}"
            if product.get(key):
                images.append(ProductImage(url=product[key]))
        
        return ProductDetails(
            name=product.get("product_name", ""),
            brand=product.get("brands"),
            category=product.get("categories"),
            description=product.get("generic_name") or product.get("product_name"),
            images=images,
            barcode=barcode
        )
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

def process_image(image_data: str, remove_background: bool = False, make_square: bool = True) -> str:
    """Process an image: make square and optimize for web"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGBA
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Make square if requested
        if make_square:
            size = max(img.size)
            new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            paste_x = (size - img.size[0]) // 2
            paste_y = (size - img.size[1]) // 2
            new_img.paste(img, (paste_x, paste_y))
            img = new_img
        
        # Optimize size
        max_size = 1200
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert back to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/lookup")
def lookup_product(request: ProductLookupRequest) -> ProductDetails:
    """Look up product details by barcode"""
    return fetch_from_open_food_facts(request.barcode)

@router.post("/process-image")
def process_product_image(request: ProcessImageRequest) -> ProcessImageResponse:
    """Process a product image: remove background and/or make square"""
    processed_image = process_image(
        request.image_data,
        remove_background=request.remove_background,
        make_square=request.make_square
    )
    return ProcessImageResponse(processed_image=processed_image)
