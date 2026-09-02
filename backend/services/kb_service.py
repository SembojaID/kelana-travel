import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ARN = os.getenv("KNOWLEDGE_BASE_MODEL_ARN")

# Clients for Bedrock Agent Runtime (retrieval) and Bedrock Runtime (formatting)
agent_client = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

bedrock_client = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

def format_answer_with_llm(question: str, context_text: str) -> str:
    """Uses Nova Lite to summarize raw PDF text into clean, human-readable bullet points."""
    prompt = f"""You are a helpful travel assistant.
Based ONLY on the following official travel documentation, answer the user's question clearly and concisely using bullet points and short paragraphs.

Document Context:
{context_text}

User Question: {question}

Clean, Grounded Answer:"""

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 500,
            "temperature": 0.2
        }
    }

    response = bedrock_client.invoke_model(
        modelId=MODEL_ARN,
        body=json.dumps(payload)
    )
    
    response_body = json.loads(response['body'].read().decode('utf-8'))
    return response_body['output']['message']['content'][0]['text']


def ask_knowledge_base(question: str):
    """
    Retrieves document chunks from Amazon Bedrock KB and formats them nicely.
    """
    try:
        response = agent_client.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={"text": question},
            retrievalConfiguration={
                "managedSearchConfiguration": {
                    "numberOfResults": 2
                }
            }
        )

        results = response.get("retrievalResults", [])
        
        if not results:
            return {
                "answer": "No relevant travel documents found for your query.",
                "source": "N/A"
            }

        # Combine retrieved document passages
        texts = [r["content"]["text"] for r in results if "content" in r and "text" in r["content"]]
        raw_context = "\n\n".join(texts)

        # Format into clean bullet points
        formatted_answer = format_answer_with_llm(question, raw_context)

        # Extract source filenames
        sources = []
        for r in results:
            uri = r.get("location", {}).get("s3Location", {}).get("uri", "")
            if uri:
                filename = uri.split("/")[-1]
                if filename not in sources:
                    sources.append(filename)

        source_str = ", ".join(sources) if sources else "Travel Knowledge Base"

        return {
            "answer": formatted_answer,
            "source": source_str
        }

    except Exception as e:
        print(f"Knowledge Base Error: {e}")
        raise e