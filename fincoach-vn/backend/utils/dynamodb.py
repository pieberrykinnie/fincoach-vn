"""
DynamoDB utility functions
"""
import os
import boto3
from typing import Dict, Any, Optional, List
from decimal import Decimal
import json


# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def get_table(table_name: str):
    """Get DynamoDB table resource"""
    return dynamodb.Table(table_name)


def decimal_to_float(obj):
    """Convert Decimal values to float recursively"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj


def float_to_decimal(obj):
    """Convert float values to Decimal recursively for DynamoDB"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [float_to_decimal(item) for item in obj]
    return obj


def batch_write_items(table_name: str, items: List[Dict[str, Any]]) -> bool:
    """
    Write multiple items to DynamoDB table in batches
    """
    table = get_table(table_name)
    
    # Convert floats to Decimal
    items = [float_to_decimal(item) for item in items]
    
    # DynamoDB batch write limit is 25 items
    batch_size = 25
    
    try:
        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            with table.batch_writer() as batch_writer:
                for item in batch:
                    batch_writer.put_item(Item=item)
        return True
    except Exception as e:
        print(f"Error in batch write: {str(e)}")
        return False


def query_by_partition_key(
    table_name: str,
    partition_key_name: str,
    partition_key_value: str,
    index_name: Optional[str] = None,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Query items by partition key
    """
    table = get_table(table_name)
    
    query_params = {
        'KeyConditionExpression': boto3.dynamodb.conditions.Key(partition_key_name).eq(partition_key_value)
    }
    
    if index_name:
        query_params['IndexName'] = index_name
    
    if limit:
        query_params['Limit'] = limit
    
    try:
        response = table.query(**query_params)
        items = response.get('Items', [])
        
        # Convert Decimal to float for JSON serialization
        return [decimal_to_float(item) for item in items]
    except Exception as e:
        print(f"Error querying table: {str(e)}")
        return []


def update_item_attributes(
    table_name: str,
    key: Dict[str, Any],
    attributes: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Update specific attributes of an item
    """
    table = get_table(table_name)
    
    # Build update expression
    update_expressions = []
    expression_attribute_values = {}
    expression_attribute_names = {}
    
    for i, (attr_name, attr_value) in enumerate(attributes.items()):
        attr_placeholder = f":val{i}"
        name_placeholder = f"#attr{i}"
        
        update_expressions.append(f"{name_placeholder} = {attr_placeholder}")
        expression_attribute_values[attr_placeholder] = float_to_decimal(attr_value)
        expression_attribute_names[name_placeholder] = attr_name
    
    try:
        response = table.update_item(
            Key=key,
            UpdateExpression="SET " + ", ".join(update_expressions),
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="ALL_NEW"
        )
        
        return decimal_to_float(response.get('Attributes', {}))
    except Exception as e:
        print(f"Error updating item: {str(e)}")
        return None