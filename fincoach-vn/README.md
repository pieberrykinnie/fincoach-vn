# FinCoach VN - AI-Powered Financial Coach

## 🎯 Project Overview

FinCoach VN is an innovative AI-powered financial coaching application designed to empower young Vietnamese individuals with practical money management skills using the popular 6-jar methodology. Built for the VPBank Technology Hackathon 2025, this MVP demonstrates a complete serverless architecture on AWS with modern frontend technologies.

### Key Features

- **6-Jar Money Management System**: Intuitive allocation of income across six categories
- **Smart Transaction Categorization**: AI-powered automatic transaction classification
- **Real-time Spending Insights**: Proactive alerts and spending tracking
- **AI Financial Guidance**: RAG-based personalized financial advice
- **Gamification**: Wisdom Points system to encourage positive financial habits
- **Serverless Architecture**: Scalable, secure, and cost-effective AWS infrastructure

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│  Lambda         │
│  (Next.js)      │     │                  │     │  Functions      │
└────────┬────────┘     └──────────────────┘     └────────┬────────┘
         │                                                  │
         ▼                                                  ▼
┌─────────────────┐                               ┌─────────────────┐
│   CloudFront    │                               │   DynamoDB      │
│   + S3          │                               │   Tables        │
└─────────────────┘                               └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cognito       │     │   Bedrock        │     │   S3 Storage    │
│   (Auth)        │     │   (AI/RAG)       │     │   (Assets)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- AWS CLI configured with appropriate credentials
- Python 3.9+ for Lambda functions
- Docker (optional, for local testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-team/fincoach-vn.git
   cd fincoach-vn
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   pip install -r requirements.txt

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Deploy infrastructure**
   ```bash
   cd infrastructure
   npm install
   npm run deploy
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   cd frontend
   npm run dev

   # Terminal 2: Backend (local testing)
   cd backend
   npm run dev
   ```

## 📁 Project Structure

```
fincoach-vn/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
│
├── backend/               # Serverless backend
│   ├── functions/         # Lambda function handlers
│   ├── layers/           # Lambda layers
│   ├── utils/            # Shared utilities
│   └── tests/            # Unit and integration tests
│
├── infrastructure/        # AWS CDK infrastructure
│   ├── lib/              # CDK stack definitions
│   ├── bin/              # CDK app entry point
│   └── test/             # Infrastructure tests
│
├── docs/                 # Documentation
│   ├── api/              # API documentation
│   ├── architecture/     # Architecture diagrams
│   └── guides/           # User and developer guides
│
└── scripts/              # Utility scripts
    ├── seed-data.js      # Database seeding
    └── deploy.sh         # Deployment scripts
```

## 🎯 The 6-Jar System

1. **Necessity (55%)**: Essential expenses - rent, food, utilities
2. **Education (10%)**: Learning and self-improvement
3. **Play (10%)**: Entertainment and fun activities
4. **Long-term Savings (10%)**: Future goals and emergencies
5. **Financial Freedom (10%)**: Investments and passive income
6. **Give (5%)**: Charity and helping others

## 🔧 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Data visualization
- **AWS Amplify**: Authentication integration
- **React Query**: Data fetching and caching

### Backend
- **AWS Lambda**: Serverless compute
- **API Gateway**: RESTful API management
- **DynamoDB**: NoSQL database
- **Cognito**: User authentication
- **Bedrock**: AI/ML capabilities
- **S3**: Object storage
- **CloudFront**: CDN

### Infrastructure
- **AWS CDK**: Infrastructure as Code
- **TypeScript**: CDK implementation
- **CloudWatch**: Monitoring and logging

## 📊 Data Models

### User Profile
```json
{
  "userId": "string",
  "email": "string",
  "name": "string",
  "monthlyIncome": "number",
  "jarAllocations": {
    "necessity": 55,
    "education": 10,
    "play": 10,
    "longTermSavings": 10,
    "financialFreedom": 10,
    "give": 5
  },
  "wisdomPoints": "number",
  "createdAt": "timestamp"
}
```

### Transaction
```json
{
  "transactionId": "string",
  "userId": "string",
  "amount": "number",
  "description": "string",
  "category": "string",
  "jar": "string",
  "date": "timestamp",
  "isReviewed": "boolean"
}
```

## 🔐 Security Features

- **Authentication**: AWS Cognito with MFA support
- **Authorization**: IAM roles and policies
- **Encryption**: Data encrypted at rest and in transit
- **API Security**: Rate limiting and CORS configuration
- **Input Validation**: Comprehensive validation on all endpoints

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📝 API Documentation

API documentation is available at `/docs/api/README.md` or can be accessed via Swagger UI when running locally at `http://localhost:3001/api-docs`.

## 🚢 Deployment

The application uses a CI/CD pipeline with GitHub Actions for automated deployment:

1. **Development**: Automatic deployment on push to `develop` branch
2. **Staging**: Manual approval required for `staging` branch
3. **Production**: Manual deployment from `main` branch

See `/docs/guides/deployment.md` for detailed deployment instructions.

## 🤝 Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Team 261** - VPBank Technology Hackathon 2025

- **Vũ Quốc Hoàng** - Project Manager + Cloud Admin
- **Vũ Nhật Nguyên Thư** - AI/ML Engineer
- **Đào Đức Bình** - Frontend Developer
- **Nguyễn Đăng Dương** - Backend Developer
- **Nguyễn Ngọc Bảo Hân** - Tester + Data Analyst

## 🙏 Acknowledgments

- VPBank for organizing the hackathon
- AWS for providing cloud credits
- The open-source community for amazing tools and libraries

---

Built with ❤️ for VPBank Technology Hackathon 2025