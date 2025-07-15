import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AIStack extends cdk.Stack {
  public readonly knowledgeBucket: s3.Bucket;
  public readonly bedrockExecutionRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for knowledge base documents
    this.knowledgeBucket = new s3.Bucket(this, 'KnowledgeBaseBucket', {
      bucketName: `fincoach-vn-knowledge-base-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'delete-old-versions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // IAM role for Bedrock execution
    this.bedrockExecutionRole = new iam.Role(this, 'BedrockExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda functions to access Bedrock',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add Bedrock permissions
    this.bedrockExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
        ],
        resources: [
          // Claude 3 Haiku model ARN
          `arn:aws:bedrock:${cdk.Stack.of(this).region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
          // Add other models as needed
        ],
      })
    );

    // Grant read access to knowledge bucket
    this.knowledgeBucket.grantRead(this.bedrockExecutionRole);

    // Policy for OpenSearch (if using for vector search)
    this.bedrockExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'es:ESHttpGet',
          'es:ESHttpPost',
          'es:ESHttpPut',
          'es:ESHttpHead',
        ],
        resources: [
          `arn:aws:es:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:domain/fincoach-vn-vectors/*`,
        ],
      })
    );

    // Output values
    new cdk.CfnOutput(this, 'KnowledgeBucketName', {
      value: this.knowledgeBucket.bucketName,
      description: 'S3 bucket for knowledge base documents',
      exportName: 'FinCoachVN-KnowledgeBucketName',
    });

    new cdk.CfnOutput(this, 'BedrockExecutionRoleArn', {
      value: this.bedrockExecutionRole.roleArn,
      description: 'IAM role for Bedrock execution',
      exportName: 'FinCoachVN-BedrockExecutionRoleArn',
    });
  }
}