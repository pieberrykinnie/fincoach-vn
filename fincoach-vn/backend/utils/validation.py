"""
Validation utilities for Lambda functions
"""
from typing import Dict, List, Any, Optional
from jsonschema import validate, ValidationError


def validate_request_body(body: Dict[str, Any], schema: Dict[str, Any]) -> Optional[str]:
    """
    Validate request body against JSON schema
    Returns None if valid, error message if invalid
    """
    try:
        validate(instance=body, schema=schema)
        return None
    except ValidationError as e:
        return str(e.message)


def validate_jar_type(jar_type: str) -> bool:
    """
    Validate if jar type is valid
    """
    valid_jars = ["necessity", "education", "play", "longTermSavings", "financialFreedom", "give"]
    return jar_type in valid_jars


def validate_jar_allocations(allocations: Dict[str, float]) -> Optional[str]:
    """
    Validate jar allocations
    Returns None if valid, error message if invalid
    """
    required_jars = ["necessity", "education", "play", "longTermSavings", "financialFreedom", "give"]
    
    # Check all required jars are present
    for jar in required_jars:
        if jar not in allocations:
            return f"Missing allocation for jar: {jar}"
    
    # Check all values are positive
    for jar, value in allocations.items():
        if value < 0:
            return f"Negative allocation for jar: {jar}"
    
    # Check total equals 100
    total = sum(allocations.values())
    if abs(total - 100) > 0.01:  # Allow small floating point differences
        return f"Allocations must sum to 100%, got {total}%"
    
    return None


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input
    """
    if not isinstance(value, str):
        return ""
    
    # Remove control characters and limit length
    sanitized = "".join(ch for ch in value if ch.isprintable())
    return sanitized[:max_length].strip()