import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { Construct } from 'constructs';
import { DatabaseTables } from './database-stack';

export interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  tables: DatabaseTables;
  knowledgeBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Lambda layer for common dependencies
    const commonLayer = new lambda.LayerVersion(this, 'CommonLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/layers/common')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'Common dependencies for Lambda functions',
    });

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'FinCoachApi', {
      restApiName: 'FinCoach VN API',
      description: 'API for FinCoach VN application',
      deployOptions: {
        stageName: 'dev',
        tracingEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Create Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [props.userPool],
      authorizerName: 'FinCoachAuthorizer',
      identitySource: 'method.request.header.Authorization',
    });

    // Lambda execution role with necessary permissions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB permissions to Lambda role
    Object.values(props.tables).forEach(table => {
      table.grantReadWriteData(lambdaRole);
      if (table.tableStreamArn) {
        table.grantStreamRead(lambdaRole);
      }
    });

    // Environment variables for all Lambda functions
    const commonEnv = {
      USERS_TABLE: props.tables.usersTable.tableName,
      TRANSACTIONS_TABLE: props.tables.transactionsTable.tableName,
      JARS_TABLE: props.tables.jarsTable.tableName,
      ALERTS_TABLE: props.tables.alertsTable.tableName,
      GAMIFICATION_TABLE: props.tables.gamificationTable.tableName,
      KNOWLEDGE_BUCKET: props.knowledgeBucket.bucketName,
      USER_POOL_ID: props.userPool.userPoolId,
      USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
    };

    // Create Lambda functions
    const functions = {
      // User management
      createUser: this.createLambdaFunction('CreateUser', 'users/create.handler', lambdaRole, commonEnv, commonLayer),
      getUser: this.createLambdaFunction('GetUser', 'users/get.handler', lambdaRole, commonEnv, commonLayer),
      updateUser: this.createLambdaFunction('UpdateUser', 'users/update.handler', lambdaRole, commonEnv, commonLayer),
      
      // Jar management
      setupJars: this.createLambdaFunction('SetupJars', 'jars/setup.handler', lambdaRole, commonEnv, commonLayer),
      getJars: this.createLambdaFunction('GetJars', 'jars/get.handler', lambdaRole, commonEnv, commonLayer),
      updateJarAllocation: this.createLambdaFunction('UpdateJarAllocation', 'jars/update-allocation.handler', lambdaRole, commonEnv, commonLayer),
      
      // Transaction management
      createTransaction: this.createLambdaFunction('CreateTransaction', 'transactions/create.handler', lambdaRole, commonEnv, commonLayer),
      classifyTransaction: this.createLambdaFunction('ClassifyTransaction', 'transactions/classify.handler', lambdaRole, commonEnv, commonLayer),
      getTransactions: this.createLambdaFunction('GetTransactions', 'transactions/list.handler', lambdaRole, commonEnv, commonLayer),
      updateTransaction: this.createLambdaFunction('UpdateTransaction', 'transactions/update.handler', lambdaRole, commonEnv, commonLayer),
      
      // Insights and AI
      getInsights: this.createLambdaFunction('GetInsights', 'insights/get.handler', lambdaRole, commonEnv, commonLayer),
      askAI: this.createLambdaFunction('AskAI', 'ai/ask.handler', lambdaRole, commonEnv, commonLayer),
      
      // Alerts
      getAlerts: this.createLambdaFunction('GetAlerts', 'alerts/list.handler', lambdaRole, commonEnv, commonLayer),
      markAlertRead: this.createLambdaFunction('MarkAlertRead', 'alerts/mark-read.handler', lambdaRole, commonEnv, commonLayer),
      
      // Gamification
      getAchievements: this.createLambdaFunction('GetAchievements', 'gamification/achievements.handler', lambdaRole, commonEnv, commonLayer),
      getLeaderboard: this.createLambdaFunction('GetLeaderboard', 'gamification/leaderboard.handler', lambdaRole, commonEnv, commonLayer),
    };

    // Define API routes
    const apiV1 = this.api.root.addResource('v1');
    
    // User routes
    const users = apiV1.addResource('users');
    users.addMethod('POST', new apigateway.LambdaIntegration(functions.createUser));
    
    const userById = users.addResource('{userId}');
    userById.addMethod('GET', new apigateway.LambdaIntegration(functions.getUser), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    userById.addMethod('PUT', new apigateway.LambdaIntegration(functions.updateUser), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Jar routes
    const jars = userById.addResource('jars');
    jars.addMethod('POST', new apigateway.LambdaIntegration(functions.setupJars), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    jars.addMethod('GET', new apigateway.LambdaIntegration(functions.getJars), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    jars.addMethod('PUT', new apigateway.LambdaIntegration(functions.updateJarAllocation), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Transaction routes
    const transactions = userById.addResource('transactions');
    transactions.addMethod('POST', new apigateway.LambdaIntegration(functions.createTransaction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    transactions.addMethod('GET', new apigateway.LambdaIntegration(functions.getTransactions), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const transactionById = transactions.addResource('{transactionId}');
    transactionById.addMethod('PUT', new apigateway.LambdaIntegration(functions.updateTransaction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const classify = transactions.addResource('classify');
    classify.addMethod('POST', new apigateway.LambdaIntegration(functions.classifyTransaction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Insights routes
    const insights = userById.addResource('insights');
    insights.addMethod('GET', new apigateway.LambdaIntegration(functions.getInsights), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // AI routes
    const ai = apiV1.addResource('ai');
    const ask = ai.addResource('ask');
    ask.addMethod('POST', new apigateway.LambdaIntegration(functions.askAI), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Alert routes
    const alerts = userById.addResource('alerts');
    alerts.addMethod('GET', new apigateway.LambdaIntegration(functions.getAlerts), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const alertById = alerts.addResource('{alertId}');
    const markRead = alertById.addResource('read');
    markRead.addMethod('PUT', new apigateway.LambdaIntegration(functions.markAlertRead), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Gamification routes
    const gamification = apiV1.addResource('gamification');
    const achievements = gamification.addResource('achievements').addResource('{userId}');
    achievements.addMethod('GET', new apigateway.LambdaIntegration(functions.getAchievements), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const leaderboard = gamification.addResource('leaderboard');
    leaderboard.addMethod('GET', new apigateway.LambdaIntegration(functions.getLeaderboard), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: 'FinCoachVN-ApiUrl',
    });
  }

  private createLambdaFunction(
    name: string,
    handler: string,
    role: iam.Role,
    environment: { [key: string]: string },
    layer: lambda.LayerVersion
  ): lambda.Function {
    return new lambda.Function(this, `${name}Function`, {
      functionName: `fincoach-vn-${name.toLowerCase()}`,
      runtime: lambda.Runtime.PYTHON_3_9,
      handler,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/functions')),
      environment,
      role,
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      tracing: lambda.Tracing.ACTIVE,
    });
  }
}