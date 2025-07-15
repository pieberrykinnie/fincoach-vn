"""
Lambda function to create a new user
"""
import json
import os
import uuid
from datetime import datetime
import boto3
from typing import Dict, Any

# Add parent directory to path for imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.response import success_response, error_response
from utils.validation import validate_request_body, sanitize_string
from utils.dynamodb import get_table, float_to_decimal


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new user after Cognito sign-up
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Define validation schema
        schema = {
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "name": {"type": "string", "minLength": 1, "maxLength": 100},
                "monthlyIncome": {"type": "number", "minimum": 0},
                "cognitoUserId": {"type": "string"}
            },
            "required": ["email", "name", "monthlyIncome", "cognitoUserId"]
        }
        
        # Validate request
        validation_error = validate_request_body(body, schema)
        if validation_error:
            return error_response(f"Invalid request: {validation_error}", 400)
        
        # Sanitize inputs
        email = sanitize_string(body['email'], 255)
        name = sanitize_string(body['name'], 100)
        monthly_income = float(body['monthlyIncome'])
        cognito_user_id = body['cognitoUserId']
        
        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Create user record
        user_data = {
            'userId': user_id,
            'cognitoUserId': cognito_user_id,
            'email': email,
            'name': name,
            'monthlyIncome': monthly_income,
            'jarAllocations': {
                'necessity': 55.0,
                'education': 10.0,
                'play': 10.0,
                'longTermSavings': 10.0,
                'financialFreedom': 10.0,
                'give': 5.0
            },
            'wisdomPoints': 0,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'isActive': True
        }
        
        # Save to DynamoDB
        table = get_table(os.environ['USERS_TABLE'])
        table.put_item(Item=float_to_decimal(user_data))
        
        # Initialize jars for the user
        jars_table = get_table(os.environ['JARS_TABLE'])
        jar_types = ['necessity', 'education', 'play', 'longTermSavings', 'financialFreedom', 'give']
        
        with jars_table.batch_writer() as batch:
            for jar_type in jar_types:
                allocation_percentage = user_data['jarAllocations'][jar_type]
                jar_limit = monthly_income * (allocation_percentage / 100)
                
                jar_data = {
                    'userId': user_id,
                    'jarType': jar_type,
                    'allocationPercentage': allocation_percentage,
                    'monthlyLimit': jar_limit,
                    'currentBalance': 0.0,
                    'monthlySpent': 0.0,
                    'lastResetDate': datetime.utcnow().isoformat(),
                    'createdAt': datetime.utcnow().isoformat(),
                    'updatedAt': datetime.utcnow().isoformat()
                }
                batch.put_item(Item=float_to_decimal(jar_data))
        
        # Award welcome bonus wisdom points
        gamification_table = get_table(os.environ['GAMIFICATION_TABLE'])
        achievement_data = {
            'userId': user_id,
            'achievementId': f"welcome-{user_id}",
            'type': 'welcome_bonus',
            'name': 'Welcome to FinCoach VN!',
            'description': 'You joined the financial wellness journey',
            'pointsAwarded': 100,
            'earnedAt': datetime.utcnow().isoformat()
        }
        gamification_table.put_item(Item=float_to_decimal(achievement_data))
        
        # Update user's wisdom points
        table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET wisdomPoints = wisdomPoints + :points',
            ExpressionAttributeValues={':points': 100}
        )
        
        # Return success response
        return success_response({
            'userId': user_id,
            'message': 'User created successfully',
            'wisdomPointsAwarded': 100
        }, 201)
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)