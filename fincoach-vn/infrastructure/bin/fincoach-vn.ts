#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { AIStack } from '../lib/stacks/ai-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Stack for authentication (Cognito)
const authStack = new AuthStack(app, 'FinCoachVN-AuthStack', {
  env,
  description: 'Authentication infrastructure for FinCoach VN',
});

// Stack for database (DynamoDB)
const databaseStack = new DatabaseStack(app, 'FinCoachVN-DatabaseStack', {
  env,
  description: 'Database infrastructure for FinCoach VN',
});

// Stack for AI/ML services
const aiStack = new AIStack(app, 'FinCoachVN-AIStack', {
  env,
  description: 'AI/ML infrastructure for FinCoach VN',
});

// Stack for API (API Gateway + Lambda)
const apiStack = new ApiStack(app, 'FinCoachVN-ApiStack', {
  env,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  tables: databaseStack.tables,
  knowledgeBucket: aiStack.knowledgeBucket,
  description: 'API infrastructure for FinCoach VN',
});

// Stack for frontend (S3 + CloudFront)
const frontendStack = new FrontendStack(app, 'FinCoachVN-FrontendStack', {
  env,
  api: apiStack.api,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
  description: 'Frontend infrastructure for FinCoach VN',
});

// Add dependencies
apiStack.addDependency(authStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(aiStack);
frontendStack.addDependency(apiStack);

// Add tags to all stacks
const tags = {
  Project: 'FinCoachVN',
  Team: 'Team261',
  Hackathon: 'VPBank2025',
  Environment: 'Development',
};

Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});

app.synth();