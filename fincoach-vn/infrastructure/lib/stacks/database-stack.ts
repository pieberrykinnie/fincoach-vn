import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DatabaseTables {
  usersTable: dynamodb.Table;
  transactionsTable: dynamodb.Table;
  jarsTable: dynamodb.Table;
  alertsTable: dynamodb.Table;
  gamificationTable: dynamodb.Table;
}

export class DatabaseStack extends cdk.Stack {
  public readonly tables: DatabaseTables;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users Table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'fincoach-vn-users',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for email lookup
    usersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Transactions Table
    const transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      tableName: 'fincoach-vn-transactions',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'transactionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for date-based queries
    transactionsTable.addGlobalSecondaryIndex({
      indexName: 'userId-date-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI for jar-based queries
    transactionsTable.addGlobalSecondaryIndex({
      indexName: 'userId-jar-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'jar',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Jars Table (for jar balances and limits)
    const jarsTable = new dynamodb.Table(this, 'JarsTable', {
      tableName: 'fincoach-vn-jars',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'jarType',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Alerts Table
    const alertsTable = new dynamodb.Table(this, 'AlertsTable', {
      tableName: 'fincoach-vn-alerts',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'alertId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for unread alerts
    alertsTable.addGlobalSecondaryIndex({
      indexName: 'userId-isRead-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'isRead',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Gamification Table
    const gamificationTable = new dynamodb.Table(this, 'GamificationTable', {
      tableName: 'fincoach-vn-gamification',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'achievementId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Store tables reference
    this.tables = {
      usersTable,
      transactionsTable,
      jarsTable,
      alertsTable,
      gamificationTable,
    };

    // Output table names
    Object.entries(this.tables).forEach(([key, table]) => {
      new cdk.CfnOutput(this, `${key}Name`, {
        value: table.tableName,
        description: `DynamoDB ${key} name`,
        exportName: `FinCoachVN-${key}Name`,
      });

      // Output stream ARNs where applicable
      if (table.tableStreamArn) {
        new cdk.CfnOutput(this, `${key}StreamArn`, {
          value: table.tableStreamArn,
          description: `DynamoDB ${key} stream ARN`,
          exportName: `FinCoachVN-${key}StreamArn`,
        });
      }
    });
  }
}