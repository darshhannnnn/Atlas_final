"""
Test script for Mistral API
"""

from mistralai.client import Mistral
import os

# Get API key from environment
api_key = os.getenv("MISTRAL_API_KEY", "tGTh1pAmBIjMQcmND6xi6bbUDrvhetqy")

print(f"Using Mistral API key: {api_key[:20]}...")

# Initialize client
client = Mistral(api_key=api_key)

# Test available models
models_to_test = [
    "mistral-large-latest",
    "mistral-small-latest",
    "open-mistral-7b",
    "open-mixtral-8x7b",
]

print("\nTesting Mistral models:")
print("=" * 50)

for model_name in models_to_test:
    try:
        print(f"\nTesting {model_name}...")
        response = client.chat.complete(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": "Say hello and tell me your name in one sentence."
                }
            ]
        )
        
        result = response.choices[0].message.content
        print(f"✅ {model_name}: {result[:100]}")
        
    except Exception as e:
        print(f"❌ {model_name}: {str(e)[:150]}")

print("\n" + "=" * 50)
print("✅ Mistral API test complete!")
