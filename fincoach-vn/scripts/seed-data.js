/**
 * Seed script to populate demo data for FinCoach VN
 * Usage: node seed-data.js
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Sample Vietnamese transaction data
const sampleTransactions = [
  // Necessity
  { description: "Tiền điện tháng 12", vendor: "EVN HCMC", amount: 850000, jar: "necessity", category: "electricity" },
  { description: "Đi chợ Bến Thành", vendor: "Chợ Bến Thành", amount: 450000, jar: "necessity", category: "market" },
  { description: "Vinmart - thực phẩm", vendor: "Vinmart", amount: 320000, jar: "necessity", category: "groceries" },
  { description: "Grab bike đi làm", vendor: "Grab", amount: 35000, jar: "necessity", category: "transport" },
  { description: "Tiền nhà tháng 1", vendor: "Chủ nhà", amount: 3500000, jar: "necessity", category: "rent" },
  
  // Education
  { description: "Sách lập trình Python", vendor: "Fahasa", amount: 250000, jar: "education", category: "books" },
  { description: "Khóa học Udemy", vendor: "Udemy", amount: 399000, jar: "education", category: "online_course" },
  { description: "Học phí tiếng Anh", vendor: "ILA", amount: 1200000, jar: "education", category: "language_learning" },
  
  // Play
  { description: "Cafe Highlands", vendor: "Highlands Coffee", amount: 65000, jar: "play", category: "cafe" },
  { description: "Vé xem phim CGV", vendor: "CGV Cinemas", amount: 180000, jar: "play", category: "entertainment" },
  { description: "Ăn tối nhà hàng", vendor: "Pizza 4P's", amount: 450000, jar: "play", category: "dining_out" },
  { description: "Shopee mua đồ", vendor: "Shopee", amount: 250000, jar: "play", category: "online_shopping" },
  
  // Long-term Savings
  { description: "Gửi tiết kiệm", vendor: "VPBank", amount: 1000000, jar: "longTermSavings", category: "savings" },
  { description: "Quỹ dự phòng", vendor: "Self", amount: 500000, jar: "longTermSavings", category: "emergency" },
  
  // Financial Freedom
  { description: "Mua cổ phiếu VNM", vendor: "SSI", amount: 2000000, jar: "financialFreedom", category: "stocks" },
  { description: "Đầu tư crypto", vendor: "Binance", amount: 500000, jar: "financialFreedom", category: "crypto" },
  
  // Give
  { description: "Từ thiện Tết", vendor: "Hội CTĐ", amount: 200000, jar: "give", category: "charity" },
  { description: "Quà sinh nhật bạn", vendor: "Gift Shop", amount: 150000, jar: "give", category: "gifts" },
];

// Financial tips for knowledge base
const knowledgeBaseContent = [
  {
    title: "6 Lọ Chi Tiêu - Phương Pháp Quản Lý Tài Chính Hiệu Quả",
    content: `
Phương pháp 6 lọ chi tiêu giúp bạn phân bổ thu nhập một cách khoa học:

1. **Lọ Thiết Yếu (55%)**: Chi phí sinh hoạt hàng ngày
2. **Lọ Giáo Dục (10%)**: Đầu tư cho bản thân
3. **Lọ Hưởng Thụ (10%)**: Giải trí và thư giãn
4. **Lọ Tiết Kiệm Dài Hạn (10%)**: An toàn tài chính
5. **Lọ Tự Do Tài Chính (10%)**: Đầu tư sinh lời
6. **Lọ Cho Đi (5%)**: Từ thiện và quà tặng

Áp dụng ngay hôm nay với FinCoach VN!
    `,
    category: "basics"
  },
  {
    title: "Mẹo Tiết Kiệm Cho Người Trẻ Việt Nam",
    content: `
Các mẹo tiết kiệm hiệu quả:

• **Nấu ăn tại nhà**: Tiết kiệm đến 70% so với ăn ngoài
• **Sử dụng phương tiện công cộng**: Giảm chi phí xăng xe
• **Mua sắm thông minh**: So sánh giá và tận dụng khuyến mãi
• **Lập ngân sách tháng**: Theo dõi chi tiêu với FinCoach VN
• **Tránh mua sắm cảm xúc**: Chờ 24h trước khi mua

Mỗi đồng tiết kiệm hôm nay là nền tảng cho tương lai!
    `,
    category: "saving"
  },
  {
    title: "Đầu Tư An Toàn Cho Người Mới Bắt Đầu",
    content: `
Nguyên tắc đầu tư cơ bản:

1. **Xây dựng quỹ khẩn cấp**: 3-6 tháng chi tiêu
2. **Hiểu rõ rủi ro**: Không đầu tư số tiền không thể mất
3. **Đa dạng hóa**: Không bỏ hết trứng vào một giỏ
4. **Học hỏi liên tục**: Kiến thức là khoản đầu tư tốt nhất
5. **Kiên nhẫn**: Đầu tư dài hạn thường sinh lời tốt

Hãy bắt đầu từ những khoản nhỏ và học hỏi dần!
    `,
    category: "investment"
  }
];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      userId: uuidv4(),
      email: 'demo@fincoach-vn.com',
      name: 'Nguyễn Văn Demo',
      monthlyIncome: 15000000,
      jarAllocations: {
        necessity: 55,
        education: 10,
        play: 10,
        longTermSavings: 10,
        financialFreedom: 10,
        give: 5
      },
      wisdomPoints: 250,
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  for (const user of users) {
    await dynamodb.put({
      TableName: 'fincoach-vn-users',
      Item: user
    }).promise();

    // Initialize jars for user
    const jarTypes = ['necessity', 'education', 'play', 'longTermSavings', 'financialFreedom', 'give'];
    
    for (const jarType of jarTypes) {
      const allocation = user.jarAllocations[jarType];
      const monthlyLimit = user.monthlyIncome * (allocation / 100);
      
      await dynamodb.put({
        TableName: 'fincoach-vn-jars',
        Item: {
          userId: user.userId,
          jarType: jarType,
          allocationPercentage: allocation,
          monthlyLimit: monthlyLimit,
          monthlySpent: 0,
          currentBalance: 0,
          lastResetDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      }).promise();
    }

    // Seed transactions for demo user
    for (const transaction of sampleTransactions) {
      const transactionId = uuidv4();
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
      
      await dynamodb.put({
        TableName: 'fincoach-vn-transactions',
        Item: {
          userId: user.userId,
          transactionId: transactionId,
          amount: transaction.amount,
          description: transaction.description,
          vendor: transaction.vendor,
          date: date.toISOString(),
          jar: transaction.jar,
          category: transaction.category,
          confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
          isReviewed: Math.random() > 0.3, // 70% reviewed
          createdAt: new Date().toISOString()
        }
      }).promise();

      // Update jar spending
      const jarData = await dynamodb.get({
        TableName: 'fincoach-vn-jars',
        Key: {
          userId: user.userId,
          jarType: transaction.jar
        }
      }).promise();

      if (jarData.Item) {
        const newSpent = (jarData.Item.monthlySpent || 0) + transaction.amount;
        
        await dynamodb.update({
          TableName: 'fincoach-vn-jars',
          Key: {
            userId: user.userId,
            jarType: transaction.jar
          },
          UpdateExpression: 'SET monthlySpent = :spent, updatedAt = :updated',
          ExpressionAttributeValues: {
            ':spent': newSpent,
            ':updated': new Date().toISOString()
          }
        }).promise();
      }
    }

    // Add some achievements
    const achievements = [
      {
        userId: user.userId,
        achievementId: `welcome-${user.userId}`,
        type: 'welcome_bonus',
        name: 'Welcome to FinCoach VN!',
        description: 'You joined the financial wellness journey',
        pointsAwarded: 100,
        earnedAt: new Date().toISOString()
      },
      {
        userId: user.userId,
        achievementId: `first-budget-${user.userId}`,
        type: 'milestone',
        name: 'Budget Master',
        description: 'You set up your first budget',
        pointsAwarded: 50,
        earnedAt: new Date().toISOString()
      },
      {
        userId: user.userId,
        achievementId: `tracker-${user.userId}`,
        type: 'milestone',
        name: 'Transaction Tracker',
        description: 'You tracked 10 transactions',
        pointsAwarded: 100,
        earnedAt: new Date().toISOString()
      }
    ];

    for (const achievement of achievements) {
      await dynamodb.put({
        TableName: 'fincoach-vn-gamification',
        Item: achievement
      }).promise();
    }

    console.log(`✅ Created demo user: ${user.email}`);
  }
}

async function seedKnowledgeBase() {
  console.log('📚 Seeding knowledge base...');
  
  const s3 = new AWS.S3();
  const bucketName = `fincoach-vn-knowledge-base-${AWS.config.credentials.accessKeyId.slice(-6)}`;

  for (const article of knowledgeBaseContent) {
    const key = `articles/${article.category}/${article.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    
    try {
      await s3.putObject({
        Bucket: bucketName,
        Key: key,
        Body: `${article.title}\n\n${article.content}`,
        ContentType: 'text/plain; charset=utf-8',
        Metadata: {
          category: article.category,
          title: article.title
        }
      }).promise();
      
      console.log(`✅ Uploaded: ${article.title}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${article.title}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting FinCoach VN data seeding...\n');
  
  try {
    await seedUsers();
    await seedKnowledgeBase();
    
    console.log('\n✨ Data seeding completed successfully!');
    console.log('📧 Demo account: demo@fincoach-vn.com');
    console.log('🔑 Password: Demo123!@#');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding
main();