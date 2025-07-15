# FinCoach VN Deployment Guide

This guide walks you through deploying FinCoach VN to AWS.

## Prerequisites

1. **AWS Account**
   - AWS account with appropriate permissions
   - AWS CLI configured with credentials
   ```bash
   aws configure
   ```

2. **Development Tools**
   - Node.js 18+ and npm
   - Python 3.9+
   - Docker (optional, for local testing)
   - Git

3. **AWS CDK**
   ```bash
   npm install -g aws-cdk
   ```

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/fincoach-vn.git
cd fincoach-vn
```

### 2. Install Dependencies

**Backend Dependencies:**
```bash
cd backend
npm install
pip install -r requirements.txt
cd layers/common
pip install -r requirements.txt -t python/
zip -r layer.zip python/
cd ../../..
```

**Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..
```

**Infrastructure Dependencies:**
```bash
cd infrastructure
npm install
cd ..
```

### 3. Environment Variables

Create `.env` files:

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**Frontend (.env.local):**
```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

## Deployment Steps

### 1. Bootstrap CDK (First Time Only)

```bash
cd infrastructure
cdk bootstrap
```

### 2. Deploy Infrastructure

Deploy all stacks:
```bash
npm run deploy
```

Or deploy individual stacks:
```bash
# Deploy in order due to dependencies
cdk deploy FinCoachVN-AuthStack
cdk deploy FinCoachVN-DatabaseStack
cdk deploy FinCoachVN-AIStack
cdk deploy FinCoachVN-ApiStack
cdk deploy FinCoachVN-FrontendStack
```

### 3. Build and Deploy Frontend

```bash
cd ../frontend

# Build the application
npm run build

# The CDK will automatically deploy the built files
# If you need to update only frontend:
cd ../infrastructure
cdk deploy FinCoachVN-FrontendStack
```

### 4. Configure Cognito

After deployment, configure Cognito:

1. Note the Cognito User Pool ID and Client ID from CloudFormation outputs
2. Update your frontend `.env.local` with these values
3. Rebuild and redeploy the frontend if needed

### 5. Seed Initial Data (Optional)

```bash
cd ../scripts
node seed-data.js
```

### 6. Verify Deployment

1. Get the CloudFront URL from CloudFormation outputs
2. Navigate to the URL in your browser
3. Register a new account and verify functionality

## Post-Deployment Configuration

### 1. Set Up Knowledge Base

Upload knowledge base documents to S3:
```bash
aws s3 cp docs/knowledge-base/ s3://fincoach-vn-knowledge-base-{account-id}/ --recursive
```

### 2. Configure API Gateway

1. Enable API caching for better performance
2. Set up usage plans and API keys if needed
3. Configure custom domain (optional)

### 3. Set Up Monitoring

1. Configure CloudWatch alarms:
```bash
cd infrastructure
cdk deploy FinCoachVN-MonitoringStack
```

2. Set up notification endpoints for alarms

### 4. Configure Backup

Enable automated backups:
```bash
aws dynamodb update-table \
  --table-name fincoach-vn-users \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## Deployment Environments

### Development
```bash
export CDK_ENV=dev
npm run deploy
```

### Staging
```bash
export CDK_ENV=staging
npm run deploy
```

### Production
```bash
export CDK_ENV=prod
npm run deploy -- --require-approval never
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy FinCoach VN

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        npm install -g aws-cdk
        cd backend && npm install && pip install -r requirements.txt
        cd ../frontend && npm install
        cd ../infrastructure && npm install
    
    - name: Build Frontend
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to AWS
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_REGION: us-east-1
      run: |
        cd infrastructure
        cdk deploy --all --require-approval never
```

## Rollback Procedures

### 1. Frontend Rollback
```bash
# Revert to previous CloudFront distribution
aws cloudfront create-invalidation --distribution-id XXXXXX --paths "/*"
```

### 2. Lambda Function Rollback
```bash
# Use versioning and aliases
aws lambda update-alias --function-name fincoach-vn-classify --function-version '$LATEST-1'
```

### 3. Database Rollback
```bash
# Restore from point-in-time recovery
aws dynamodb restore-table-to-point-in-time \
  --source-table-name fincoach-vn-users \
  --target-table-name fincoach-vn-users-restored \
  --restore-date-time 2025-01-15T10:00:00
```

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Error**
   ```bash
   Error: This stack uses assets, so the toolkit stack must be deployed
   Solution: Run 'cdk bootstrap' first
   ```

2. **Lambda Deployment Timeout**
   ```bash
   Error: Timeout waiting for Lambda function to be ready
   Solution: Increase Lambda deployment timeout in CDK
   ```

3. **CloudFront Distribution Error**
   ```bash
   Error: The specified origin server does not exist
   Solution: Ensure S3 bucket is created before CloudFront
   ```

### Debug Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name FinCoachVN-ApiStack

# View Lambda logs
aws logs tail /aws/lambda/fincoach-vn-classify --follow

# Test API endpoint
curl -X POST https://api.fincoach-vn.vpbank.com/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Security Checklist

- [ ] Enable MFA for AWS root account
- [ ] Use least-privilege IAM roles
- [ ] Enable CloudTrail logging
- [ ] Configure WAF rules
- [ ] Enable GuardDuty
- [ ] Review security groups
- [ ] Enable S3 bucket encryption
- [ ] Configure secrets in AWS Secrets Manager
- [ ] Enable VPC Flow Logs
- [ ] Set up AWS Config rules

## Cost Optimization

1. **Set up billing alerts**
   ```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name "FinCoachVN-BillingAlert" \
     --alarm-description "Alert when AWS charges exceed $100" \
     --metric-name EstimatedCharges \
     --namespace AWS/Billing \
     --statistic Maximum \
     --period 86400 \
     --threshold 100 \
     --comparison-operator GreaterThanThreshold
   ```

2. **Enable cost allocation tags**
3. **Set up Lambda reserved concurrency**
4. **Configure S3 lifecycle policies**
5. **Use DynamoDB on-demand pricing**

## Maintenance

### Regular Tasks
- Review CloudWatch logs weekly
- Update dependencies monthly
- Perform security audits quarterly
- Load test before major releases

### Backup Schedule
- DynamoDB: Continuous (PITR enabled)
- S3: Daily snapshots
- Code: Git commits

## Support

For deployment issues:
- Check AWS service health: https://status.aws.amazon.com
- Review CloudFormation events
- Contact: devops@fincoach-vn.vpbank.com

---

Last Updated: January 2025
Version: 1.0.0