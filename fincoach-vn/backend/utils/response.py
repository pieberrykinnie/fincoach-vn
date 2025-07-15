"""
Response utilities for Lambda functions
"""
import json
from typing import Any, Dict, Optional


def success_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """
    Create a successful API response
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        },
        "body": json.dumps({
            "success": True,
            "data": data
        })
    }


def error_response(message: str, status_code: int = 400, error_code: Optional[str] = None) -> Dict[str, Any]:
    """
    Create an error API response
    """
    error_body = {
        "success": False,
        "error": {
            "message": message
        }
    }
    
    if error_code:
        error_body["error"]["code"] = error_code
    
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        },
        "body": json.dumps(error_body)
    }