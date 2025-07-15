import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  api: apigateway.RestApi;
  userPoolId: string;
  userPoolClientId: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 bucket for hosting static website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `fincoach-vn-frontend-${cdk.Stack.of(this).account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
          expiration: cdk.Duration.days(90),
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for FinCoach VN frontend',
    });

    // Grant CloudFront access to S3 bucket
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [originAccessIdentity.grantPrincipal],
      })
    );

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(props.api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
      comment: 'CloudFront distribution for FinCoach VN',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // Deploy frontend build to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../../frontend/out'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });

    // Create config file for frontend
    const configBucket = new s3.Bucket(this, 'ConfigBucket', {
      bucketName: `fincoach-vn-config-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda function to generate config
    const configGeneratorRole = new iam.Role(this, 'ConfigGeneratorRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    configBucket.grantWrite(configGeneratorRole);
    websiteBucket.grantWrite(configGeneratorRole);

    const configGenerator = new lambda.Function(this, 'ConfigGenerator', {
      functionName: 'fincoach-vn-config-generator',
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
import json
import boto3
import os

def handler(event, context):
    config = {
        "apiUrl": os.environ['API_URL'],
        "region": os.environ['AWS_REGION'],
        "userPoolId": os.environ['USER_POOL_ID'],
        "userPoolClientId": os.environ['USER_POOL_CLIENT_ID'],
        "identityPoolId": os.environ.get('IDENTITY_POOL_ID', ''),
    }
    
    s3 = boto3.client('s3')
    s3.put_object(
        Bucket=os.environ['WEBSITE_BUCKET'],
        Key='config.json',
        Body=json.dumps(config),
        ContentType='application/json',
        CacheControl='no-cache'
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Config generated successfully')
    }
      `),
      environment: {
        API_URL: props.api.url,
        USER_POOL_ID: props.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClientId,
        WEBSITE_BUCKET: websiteBucket.bucketName,
      },
      role: configGeneratorRole,
      timeout: cdk.Duration.seconds(30),
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL for the website',
      exportName: 'FinCoachVN-WebsiteURL',
    });

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket for website hosting',
      exportName: 'FinCoachVN-WebsiteBucketName',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: 'FinCoachVN-DistributionId',
    });
  }
}