import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'FinCoachUserPool', {
      userPoolName: 'fincoach-vn-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        monthlyIncome: new cognito.NumberAttribute({
          min: 0,
          mutable: true,
        }),
        wisdomPoints: new cognito.NumberAttribute({
          min: 0,
          mutable: true,
        }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'FinCoachUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'fincoach-vn-web-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/callback',
          'https://fincoach-vn.vpbank.com/callback', // Production URL
        ],
        logoutUrls: [
          'http://localhost:3000',
          'https://fincoach-vn.vpbank.com',
        ],
      },
    });

    // Add User Pool Domain for hosted UI (optional)
    const userPoolDomain = new cognito.UserPoolDomain(this, 'FinCoachUserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: 'fincoach-vn',
      },
    });

    // Output important values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'FinCoachVN-UserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'FinCoachVN-UserPoolClientId',
    });

    new cdk.CfnOutput(this, 'UserPoolDomainName', {
      value: userPoolDomain.domainName,
      description: 'Cognito User Pool Domain',
      exportName: 'FinCoachVN-UserPoolDomain',
    });
  }
}