import boto3
import os
from dotenv import load_dotenv

load_dotenv()

client = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "ap-southeast-2")
)

def generate_itinerary(destination: str, days: int, budget: float, category: str) -> str:
    """Generates a rich, structured travel itinerary in Markdown using Amazon Bedrock."""
    
    # Challenge: Enhanced prompt with all trip details and Markdown formatting instructions
    prompt = f"""
    You are an expert travel planner. Create a detailed, personalized {days}-day travel itinerary for {destination}.
    
    Trip Details:
    - Destination: {destination}
    - Duration: {days} days
    - Budget: {budget} USD
    - Travel Style / Category: {category}

    Please provide:
    1. A day-by-day itinerary including morning, afternoon (cultural sites and local experiences), and evening activities (dinner spots and nightlife).
    2. Local food and restaurant recommendations.
    3. Estimated daily budget breakdown.
    4. Practical transportation suggestions and travel tips.

    Format your entire response cleanly as Markdown, utilizing headers (## or ###) for days/sections and bullet lists (-) for activities and recommendations.
    """

    try:
        response = client.converse(
            modelId=os.getenv("MODEL_ID", "amazon.nova-lite-v1:0"),
            messages=[{
                "role": "user",
                "content": [{"text": prompt}]
            }]
        )
        return response["output"]["message"]["content"][0]["text"]
    except Exception as e:
        return f"Error generating AI response: {str(e)}"