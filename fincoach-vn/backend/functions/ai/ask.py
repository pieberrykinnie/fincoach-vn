"""
Lambda function for AI-powered financial guidance using RAG
"""
import json
import os
import boto3
from typing import Dict, Any, List

# Add parent directory to path for imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.response import success_response, error_response
from utils.validation import validate_request_body, sanitize_string


# Initialize Bedrock client
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)

# Initialize S3 client
s3_client = boto3.client('s3')


def get_knowledge_base_context(question: str) -> str:
    """
    Retrieve relevant context from knowledge base
    For hackathon, we use simple keyword matching
    """
    # Define some pre-loaded knowledge base content
    knowledge_base = {
        "6-jar method": """
        The 6-jar money management method divides your income into 6 categories:
        1. Necessity (55%): Essential expenses like rent, food, utilities
        2. Education (10%): Learning and self-improvement
        3. Play (10%): Entertainment and fun activities
        4. Long-term Savings (10%): Future goals and emergencies
        5. Financial Freedom (10%): Investments and passive income
        6. Give (5%): Charity and helping others
        
        This method helps you balance current needs with future goals while ensuring you enjoy life and give back to society.
        """,
        
        "saving tips": """
        Tips for saving money in Vietnam:
        1. Cook at home instead of eating out frequently
        2. Use public transportation or carpooling
        3. Compare prices before making purchases
        4. Take advantage of promotions and loyalty programs
        5. Set up automatic transfers to savings accounts
        6. Track your expenses regularly using FinCoach VN
        7. Avoid impulse purchases - wait 24 hours before buying
        """,
        
        "investment basics": """
        Basic investment principles for beginners:
        1. Start with an emergency fund (3-6 months of expenses)
        2. Understand your risk tolerance
        3. Diversify your investments
        4. Consider low-cost index funds for beginners
        5. Think long-term (5+ years)
        6. Educate yourself before investing
        7. Consider consulting with a financial advisor
        
        Remember: Never invest money you can't afford to lose.
        """,
        
        "vpbank products": """
        VPBank offers various financial products:
        1. Savings Accounts: Competitive interest rates for your savings
        2. Credit Cards: Cashback and rewards programs
        3. Personal Loans: Flexible terms for various needs
        4. Investment Products: Mutual funds and securities trading
        5. Insurance: Life and health insurance options
        6. Digital Banking: 24/7 mobile and online banking
        
        Visit VPBank branches or website for detailed information.
        """
    }
    
    # Simple keyword matching for context retrieval
    relevant_contexts = []
    question_lower = question.lower()
    
    for topic, content in knowledge_base.items():
        if any(keyword in question_lower for keyword in topic.split()):
            relevant_contexts.append(content)
    
    # If no specific match, provide general financial literacy context
    if not relevant_contexts:
        relevant_contexts.append(knowledge_base["6-jar method"])
    
    return "\n\n".join(relevant_contexts)


def generate_ai_response(question: str, context: str, user_context: Dict[str, Any]) -> str:
    """
    Generate AI response using Bedrock
    """
    # Prepare the prompt
    prompt = f"""You are FinCoach VN, a helpful AI financial assistant specialized in Vietnamese personal finance.

Context about the user:
- Monthly income: {user_context.get('monthlyIncome', 'Not specified')} VND
- Current jar allocations: {json.dumps(user_context.get('jarAllocations', {}), indent=2)}

Relevant information from knowledge base:
{context}

User question: {question}

Please provide a helpful, concise response in a friendly tone. If the question is about specific VPBank products or services, mention that they should contact VPBank directly for the most up-to-date information. Focus on practical advice relevant to Vietnamese users.

Response:"""

    try:
        # Call Bedrock API
        response = bedrock_runtime.invoke_model(
            modelId=os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0'),
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 500,
                "temperature": 0.7,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        ai_response = response_body['content'][0]['text']
        
        return ai_response
        
    except Exception as e:
        print(f"Error calling Bedrock: {str(e)}")
        # Fallback response if Bedrock fails
        return "I apologize, but I'm having trouble accessing my knowledge base right now. For general financial advice, I recommend following the 6-jar method: allocate 55% for necessities, 10% each for education, play, long-term savings, and financial freedom, and 5% for giving. Please try again later or contact VPBank for specific product information."


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle AI financial guidance requests
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Define validation schema
        schema = {
            "type": "object",
            "properties": {
                "question": {"type": "string", "minLength": 1, "maxLength": 500},
                "userId": {"type": "string"}
            },
            "required": ["question"]
        }
        
        # Validate request
        validation_error = validate_request_body(body, schema)
        if validation_error:
            return error_response(f"Invalid request: {validation_error}", 400)
        
        # Sanitize inputs
        question = sanitize_string(body['question'], 500)
        user_id = body.get('userId')
        
        # Get user context if userId provided
        user_context = {}
        if user_id:
            try:
                users_table = boto3.resource('dynamodb').Table(os.environ['USERS_TABLE'])
                user_response = users_table.get_item(Key={'userId': user_id})
                if 'Item' in user_response:
                    user_data = user_response['Item']
                    user_context = {
                        'monthlyIncome': user_data.get('monthlyIncome'),
                        'jarAllocations': user_data.get('jarAllocations', {})
                    }
            except Exception as e:
                print(f"Error fetching user context: {str(e)}")
        
        # Get relevant context from knowledge base
        kb_context = get_knowledge_base_context(question)
        
        # Generate AI response
        ai_response = generate_ai_response(question, kb_context, user_context)
        
        # Log the interaction for analytics (optional)
        if user_id:
            # Could save to a separate table for analytics
            pass
        
        # Return response
        return success_response({
            'question': question,
            'answer': ai_response,
            'sources': ["FinCoach VN Knowledge Base", "General Financial Literacy"],
            'disclaimer': "This is general financial guidance. For specific VPBank products or personalized advice, please consult with VPBank representatives."
        })
        
    except Exception as e:
        print(f"Error in AI handler: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)