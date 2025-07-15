"""
Lambda function to classify transactions
"""
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path for imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.response import success_response, error_response
from utils.validation import validate_request_body
from utils.dynamodb import get_table, float_to_decimal, decimal_to_float
from utils.classifier import TransactionClassifier


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Classify a transaction and update jar balances
    """
    try:
        # Extract user ID from path parameters
        path_params = event.get('pathParameters', {})
        user_id = path_params.get('userId')
        
        if not user_id:
            return error_response("User ID is required", 400)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Define validation schema
        schema = {
            "type": "object",
            "properties": {
                "amount": {"type": "number", "minimum": 0},
                "description": {"type": "string", "minLength": 1},
                "vendor": {"type": "string"},
                "date": {"type": "string"},
                "transactionId": {"type": "string"}
            },
            "required": ["amount", "description"]
        }
        
        # Validate request
        validation_error = validate_request_body(body, schema)
        if validation_error:
            return error_response(f"Invalid request: {validation_error}", 400)
        
        # Extract transaction details
        amount = float(body['amount'])
        description = body['description']
        vendor = body.get('vendor', '')
        date = body.get('date', datetime.utcnow().isoformat())
        transaction_id = body.get('transactionId', str(uuid.uuid4()))
        
        # Initialize classifier
        classifier = TransactionClassifier()
        
        # Classify the transaction
        jar_type, confidence = classifier.classify(description, amount, vendor)
        
        # Get suggestions for user review
        suggestions = classifier.suggest_category(description)
        
        # Update jar balance
        jars_table = get_table(os.environ['JARS_TABLE'])
        
        # Get current jar state
        jar_response = jars_table.get_item(
            Key={
                'userId': user_id,
                'jarType': jar_type
            }
        )
        
        if 'Item' not in jar_response:
            return error_response(f"Jar {jar_type} not found for user", 404)
        
        current_jar = decimal_to_float(jar_response['Item'])
        current_spent = float(current_jar.get('monthlySpent', 0))
        monthly_limit = float(current_jar.get('monthlyLimit', 0))
        
        # Update jar spending
        new_spent = current_spent + amount
        percentage_used = (new_spent / monthly_limit * 100) if monthly_limit > 0 else 0
        
        jars_table.update_item(
            Key={
                'userId': user_id,
                'jarType': jar_type
            },
            UpdateExpression='SET monthlySpent = :spent, updatedAt = :updated',
            ExpressionAttributeValues={
                ':spent': float_to_decimal(new_spent),
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        # Save transaction
        transactions_table = get_table(os.environ['TRANSACTIONS_TABLE'])
        transaction_data = {
            'userId': user_id,
            'transactionId': transaction_id,
            'amount': amount,
            'description': description,
            'vendor': vendor,
            'date': date,
            'jar': jar_type,
            'category': suggestions[0][1] if suggestions else 'general',
            'confidence': confidence,
            'isReviewed': False,
            'createdAt': datetime.utcnow().isoformat()
        }
        
        transactions_table.put_item(Item=float_to_decimal(transaction_data))
        
        # Check if alert needed
        alert_created = False
        alert_message = None
        
        if percentage_used >= 90:
            alert_message = f"Your {jar_type} jar is at {percentage_used:.1f}% capacity!"
            alert_type = "critical"
        elif percentage_used >= 70:
            alert_message = f"Your {jar_type} jar is at {percentage_used:.1f}% - mindful spending ahead!"
            alert_type = "warning"
        
        if alert_message:
            alerts_table = get_table(os.environ['ALERTS_TABLE'])
            alert_data = {
                'userId': user_id,
                'alertId': str(uuid.uuid4()),
                'type': alert_type,
                'jarType': jar_type,
                'message': alert_message,
                'percentageUsed': percentage_used,
                'isRead': 'false',  # Using string for GSI
                'createdAt': datetime.utcnow().isoformat(),
                'ttl': int((datetime.utcnow().timestamp())) + 30 * 24 * 60 * 60  # 30 days TTL
            }
            alerts_table.put_item(Item=float_to_decimal(alert_data))
            alert_created = True
        
        # Award points for transaction tracking
        if len(transactions_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id},
            Limit=1
        ).get('Items', [])) == 1:  # First transaction
            # Award points for first transaction
            gamification_table = get_table(os.environ['GAMIFICATION_TABLE'])
            achievement_data = {
                'userId': user_id,
                'achievementId': f"first-transaction-{user_id}",
                'type': 'milestone',
                'name': 'First Transaction Tracked!',
                'description': 'You tracked your first transaction',
                'pointsAwarded': 50,
                'earnedAt': datetime.utcnow().isoformat()
            }
            gamification_table.put_item(Item=float_to_decimal(achievement_data))
            
            # Update user points
            users_table = get_table(os.environ['USERS_TABLE'])
            users_table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET wisdomPoints = wisdomPoints + :points',
                ExpressionAttributeValues={':points': 50}
            )
        
        # Return response
        return success_response({
            'transactionId': transaction_id,
            'classification': {
                'jar': jar_type,
                'confidence': confidence,
                'category': suggestions[0][1] if suggestions else 'general'
            },
            'jarStatus': {
                'monthlyLimit': monthly_limit,
                'monthlySpent': new_spent,
                'percentageUsed': percentage_used,
                'remaining': monthly_limit - new_spent
            },
            'suggestions': [
                {
                    'jar': sug[0],
                    'category': sug[1],
                    'confidence': sug[2]
                }
                for sug in suggestions
            ],
            'alert': {
                'created': alert_created,
                'message': alert_message
            } if alert_created else None
        })
        
    except Exception as e:
        print(f"Error classifying transaction: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)