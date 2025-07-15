terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  required_version = ">= 1.5"
}

provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region"
  default     = "ap-southeast-1"
}

# S3 bucket for static frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "fincoach-frontend-${random_id.suffix.hex}"
  force_destroy = true
}

resource "random_id" "suffix" {
  byte_length = 4
}

# DynamoDB table for Users (simplified)
resource "aws_dynamodb_table" "users" {
  name         = "fincoach-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# More resources (API Gateway, Lambda, IAM roles) to be added after hackathon demo