import google.generativeai as genai
import os

# Configure with your API key from environment
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBwpx8cBFbifQ-DUjOSCpfrAlb70PYQbSU")
genai.configure(api_key=api_key)

print(f"Using API key: {api_key[:20]}...")

# List available models
print("\nAvailable Gemini models:")
try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")

# Try different model names
model_names = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
]

print("\nTesting models:")
for model_name in model_names:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"✅ {model_name}: {response.text[:50]}")
        break
    except Exception as e:
        print(f"❌ {model_name}: {str(e)[:100]}")
