# FinCoach VN Architecture Documentation

## System Architecture Overview

FinCoach VN is built on a modern, serverless architecture leveraging AWS services for scalability, security, and cost-effectiveness. The system follows microservices principles with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   Users                                      │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   CloudFront CDN  │
                        │  (Global Edge)    │
                        └─────────┬─────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
      ┌─────────▼─────────┐             ┌──────────▼──────────┐
      │   Static Assets   │             │    API Gateway      │
      │   (S3 Bucket)     │             │  (REST API)         │
      └───────────────────┘             └──────────┬──────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │   AWS Cognito       │
                                        │  (Authentication)   │
                                        └──────────┬──────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────────┐
                        │                          │                          │
              ┌─────────▼────────┐      ┌─────────▼────────┐      ┌─────────▼────────┐
              │ Lambda Functions │      │ Lambda Functions │      │ Lambda Functions │
              │   (Users API)    │      │ (Transactions)   │      │    (AI/RAG)      │
              └─────────┬────────┘      └─────────┬────────┘      └─────────┬────────┘
                        │                          │                          │
                        └──────────────────────────┴──────────────────────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        │                                                      │
              ┌─────────▼────────┐                                  ┌─────────▼────────┐
              │    DynamoDB      │                                  │     Bedrock      │
              │    (NoSQL DB)    │                                  │   (AI Models)    │
              └──────────────────┘                                  └──────────────────┘
```

## Core Components

### 1. Frontend Layer

#### Static Web Hosting
- **Service**: Amazon S3 + CloudFront
- **Purpose**: Host React/Next.js application
- **Key Features**:
  - Global CDN distribution
  - HTTPS encryption
  - DDoS protection
  - Cache optimization

#### Client Application
- **Technology**: Next.js 14 with React
- **Features**:
  - Server-side rendering (SSR)
  - Progressive Web App (PWA) capabilities
  - Responsive design
  - Real-time updates

### 2. API Layer

#### API Gateway
- **Service**: Amazon API Gateway
- **Purpose**: RESTful API management
- **Features**:
  - Request routing
  - Rate limiting
  - CORS handling
  - Request/response transformation
  - API versioning

#### Authentication
- **Service**: AWS Cognito
- **Features**:
  - User registration/login
  - MFA support
  - OAuth 2.0 / JWT tokens
  - Password policies
  - User attributes

### 3. Business Logic Layer

#### Lambda Functions
Serverless compute for all business logic:

**User Management**
- User registration
- Profile management
- Jar allocation setup

**Transaction Processing**
- Transaction classification
- Jar balance updates
- Alert generation

**AI Services**
- RAG implementation
- Financial guidance
- Spending insights

**Gamification**
- Point calculation
- Achievement tracking
- Leaderboard management

### 4. Data Layer

#### DynamoDB Tables

**Users Table**
```
PK: userId
Attributes: email, name, monthlyIncome, jarAllocations, wisdomPoints
GSI: email-index
```

**Transactions Table**
```
PK: userId
SK: transactionId
Attributes: amount, description, jar, date, category
GSI: userId-date-index, userId-jar-index
```

**Jars Table**
```
PK: userId
SK: jarType
Attributes: allocationPercentage, monthlyLimit, monthlySpent
Stream: Enabled for real-time updates
```

**Alerts Table**
```
PK: userId
SK: alertId
Attributes: type, message, isRead, createdAt
TTL: 30 days
GSI: userId-isRead-index
```

**Gamification Table**
```
PK: userId
SK: achievementId
Attributes: type, pointsAwarded, earnedAt
```

### 5. AI/ML Layer

#### Amazon Bedrock
- **Model**: Claude 3 Haiku
- **Use Cases**:
  - Financial Q&A
  - Personalized recommendations
  - Natural language understanding

#### Knowledge Base
- **Storage**: S3 bucket
- **Content**: Financial literacy articles, VPBank product info
- **Indexing**: Vector embeddings for semantic search

## Security Architecture

### Network Security
- **VPC**: Isolated network for Lambda functions
- **Security Groups**: Restrictive inbound/outbound rules
- **NACLs**: Additional network layer protection

### Data Security
- **Encryption at Rest**: All data encrypted in DynamoDB, S3
- **Encryption in Transit**: TLS 1.2+ for all communications
- **Key Management**: AWS KMS for encryption keys

### Application Security
- **Authentication**: AWS Cognito with MFA
- **Authorization**: IAM roles and policies
- **API Security**: API keys, rate limiting
- **Input Validation**: Lambda-level validation
- **OWASP Compliance**: Security best practices

## Scalability Design

### Horizontal Scaling
- **Lambda**: Auto-scales to handle concurrent requests
- **DynamoDB**: On-demand billing with auto-scaling
- **API Gateway**: Handles millions of requests

### Performance Optimization
- **Caching**:
  - CloudFront for static assets
  - API Gateway caching
  - Lambda memory optimization
- **Database**:
  - DynamoDB partition key design
  - GSI for query optimization
  - DynamoDB Accelerator (DAX) ready

## Monitoring & Observability

### CloudWatch Integration
- **Metrics**: API latency, Lambda duration, DynamoDB throttles
- **Logs**: Centralized logging for all services
- **Alarms**: Automated alerts for anomalies

### X-Ray Tracing
- End-to-end request tracing
- Performance bottleneck identification
- Service map visualization

## Disaster Recovery

### Backup Strategy
- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning and cross-region replication
- **Code**: Git-based version control

### RTO/RPO Targets
- **RTO**: 1 hour
- **RPO**: 15 minutes

## Cost Optimization

### Serverless Benefits
- Pay-per-use pricing
- No idle resource costs
- Automatic scaling

### Cost Controls
- Lambda memory optimization
- DynamoDB on-demand pricing
- S3 lifecycle policies
- CloudFront caching strategies

## Future Architecture Enhancements

### Phase 2 (Post-Hackathon)
1. **VPBank Integration**
   - Core banking API integration
   - Real-time transaction streaming
   - Account aggregation

2. **Advanced AI**
   - Custom ML models for classification
   - Predictive analytics
   - Anomaly detection

3. **Enhanced Security**
   - WAF implementation
   - Advanced threat detection
   - Compliance certifications

### Phase 3 (Production Scale)
1. **Multi-Region Deployment**
   - Active-active setup
   - Global database replication
   - Regional compliance

2. **Event-Driven Architecture**
   - EventBridge for event routing
   - SQS/SNS for decoupling
   - Kinesis for streaming

3. **Advanced Analytics**
   - Data lake formation
   - Business intelligence
   - Real-time dashboards

## Development & Deployment

### CI/CD Pipeline
```
GitHub → GitHub Actions → AWS CDK → CloudFormation → AWS Services
```

### Environments
- **Development**: Feature branch deployments
- **Staging**: Integration testing
- **Production**: Blue-green deployments

### Infrastructure as Code
- **Tool**: AWS CDK (TypeScript)
- **Benefits**: Version control, reproducibility, automation

## Compliance & Standards

### Data Privacy
- GDPR-ready architecture
- Data residency controls
- User data deletion capabilities

### Financial Standards
- PCI DSS ready infrastructure
- Audit logging
- Data integrity controls

## Performance Benchmarks

### Target Metrics
- API Response Time: < 200ms (p95)
- Page Load Time: < 2s
- Availability: 99.9%
- Concurrent Users: 10,000+

### Load Testing Results
- Transactions/second: 1,000+
- Concurrent Lambda executions: 1,000
- DynamoDB read/write capacity: Auto-scaled

## Architecture Decision Records (ADRs)

### ADR-001: Serverless Architecture
**Decision**: Use serverless services (Lambda, DynamoDB, S3)
**Rationale**: Cost-effectiveness, scalability, reduced operational overhead

### ADR-002: NoSQL Database
**Decision**: Use DynamoDB instead of RDS
**Rationale**: Better scalability, lower latency, cost-effective for our access patterns

### ADR-003: AI Service
**Decision**: Use Amazon Bedrock instead of custom models
**Rationale**: Faster time-to-market, managed service, proven models

### ADR-004: Frontend Framework
**Decision**: Next.js with React
**Rationale**: SSR capabilities, large ecosystem, developer productivity

## Contact & Support

For architecture questions or proposals:
- **Email**: architecture@fincoach-vn.vpbank.com
- **Slack**: #fincoach-architecture
- **Documentation**: Internal wiki

---

Last Updated: January 2025
Version: 1.0.0