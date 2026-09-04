import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ARN = os.getenv("KNOWLEDGE_BASE_MODEL_ARN", "arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0")

bedrock_client = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

def generate_chat_response(history_messages: list) -> str:
    """
    Constructs multi-turn prompt context and calls Bedrock.
    history_messages is a list of objects or dicts with 'role' and 'content'.
    """
    formatted_messages = []
    for msg in history_messages:
        role = msg.role if hasattr(msg, "role") else msg["role"]
        content = msg.content if hasattr(msg, "content") else msg["content"]
        formatted_messages.append({
            "role": role,
            "content": [{"text": content}]
        })

    payload = {
        "messages": formatted_messages,
        "inferenceConfig": {
            "maxTokens": 600,
            "temperature": 0.7
        }
    }

    try:
        response = bedrock_client.invoke_model(
            modelId=MODEL_ARN,
            body=json.dumps(payload)
        )
        response_body = json.loads(response['body'].read().decode('utf-8'))
        return response_body['output']['message']['content'][0]['text']
    except Exception as e:
        print(f"Bedrock Chat Error: {e}")
        raise e