"""
Lambda function to get user's jar information
"""
import json
import os
from typing import Dict, Any
from decimal import Decimal

# Add parent directory to path for imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from utils.response import success_response, error_response
from utils.dynamodb import get_table, query_by_partition_key, decimal_to_float


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get user's jar balances and allocations
    """
    try:
        # Extract user ID from path parameters
        path_params = event.get('pathParameters', {})
        user_id = path_params.get('userId')
        
        if not user_id:
            return error_response("User ID is required", 400)
        
        # Get user data to fetch monthly income
        users_table = get_table(os.environ['USERS_TABLE'])
        user_response = users_table.get_item(Key={'userId': user_id})
        
        if 'Item' not in user_response:
            return error_response("User not found", 404)
        
        user_data = decimal_to_float(user_response['Item'])
        monthly_income = user_data.get('monthlyIncome', 0)
        
        # Get all jars for the user
        jars = query_by_partition_key(
            table_name=os.environ['JARS_TABLE'],
            partition_key_name='userId',
            partition_key_value=user_id
        )
        
        # Calculate totals
        total_spent = 0
        total_allocated = 0
        jar_details = []
        
        # Define jar order and display names
        jar_order = ['necessity', 'education', 'play', 'longTermSavings', 'financialFreedom', 'give']
        jar_display_names = {
            'necessity': 'Necessity',
            'education': 'Education',
            'play': 'Play',
            'longTermSavings': 'Long-term Savings',
            'financialFreedom': 'Financial Freedom',
            'give': 'Give'
        }
        
        # Process each jar
        jars_dict = {jar['jarType']: jar for jar in jars}
        
        for jar_type in jar_order:
            if jar_type in jars_dict:
                jar = jars_dict[jar_type]
                monthly_limit = float(jar.get('monthlyLimit', 0))
                monthly_spent = float(jar.get('monthlySpent', 0))
                allocation_percentage = float(jar.get('allocationPercentage', 0))
                
                total_spent += monthly_spent
                total_allocated += monthly_limit
                
                # Calculate percentage used
                percentage_used = (monthly_spent / monthly_limit * 100) if monthly_limit > 0 else 0
                
                # Determine status
                if percentage_used >= 100:
                    status = 'exceeded'
                elif percentage_used >= 90:
                    status = 'critical'
                elif percentage_used >= 70:
                    status = 'warning'
                else:
                    status = 'healthy'
                
                jar_details.append({
                    'jarType': jar_type,
                    'displayName': jar_display_names.get(jar_type, jar_type),
                    'allocationPercentage': allocation_percentage,
                    'monthlyLimit': monthly_limit,
                    'monthlySpent': monthly_spent,
                    'percentageUsed': round(percentage_used, 1),
                    'remaining': monthly_limit - monthly_spent,
                    'status': status,
                    'lastResetDate': jar.get('lastResetDate'),
                    'updatedAt': jar.get('updatedAt')
                })
        
        # Calculate overall statistics
        total_remaining = monthly_income - total_spent
        overall_percentage_used = (total_spent / monthly_income * 100) if monthly_income > 0 else 0
        
        # Get spending trends (last 3 months comparison)
        # For hackathon, we'll return mock trend data
        spending_trends = {
            'currentMonth': total_spent,
            'lastMonth': total_spent * 0.95,  # Mock: 5% less last month
            'twoMonthsAgo': total_spent * 0.92,  # Mock: 8% less two months ago
            'trend': 'increasing' if total_spent > (total_spent * 0.95) else 'decreasing'
        }
        
        # Recommendations based on jar status
        recommendations = []
        
        for jar in jar_details:
            if jar['status'] == 'exceeded':
                recommendations.append({
                    'jar': jar['displayName'],
                    'type': 'critical',
                    'message': f"Your {jar['displayName']} jar is over budget by {abs(jar['remaining']):,.0f} VND. Consider reducing expenses in this category."
                })
            elif jar['status'] == 'critical':
                recommendations.append({
                    'jar': jar['displayName'],
                    'type': 'warning',
                    'message': f"Your {jar['displayName']} jar is at {jar['percentageUsed']}% capacity. Be mindful of spending in this category."
                })
        
        # Add positive recommendations
        healthy_jars = [jar for jar in jar_details if jar['status'] == 'healthy' and jar['percentageUsed'] < 50]
        if healthy_jars:
            jar = healthy_jars[0]
            recommendations.append({
                'jar': jar['displayName'],
                'type': 'positive',
                'message': f"Great job managing your {jar['displayName']} jar! You still have {jar['remaining']:,.0f} VND available."
            })
        
        # Return comprehensive jar information
        return success_response({
            'jars': jar_details,
            'summary': {
                'totalIncome': monthly_income,
                'totalAllocated': total_allocated,
                'totalSpent': total_spent,
                'totalRemaining': total_remaining,
                'overallPercentageUsed': round(overall_percentage_used, 1)
            },
            'spendingTrends': spending_trends,
            'recommendations': recommendations,
            'lastUpdated': jar_details[0]['updatedAt'] if jar_details else None
        })
        
    except Exception as e:
        print(f"Error getting jars: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)