const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, userId = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (userId) {
      options.headers['x-user-id'] = userId;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test the API
async function testAPI() {
  console.log('🚀 Testing Reward System API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const leaderboard = await makeRequest('GET', '/api/leaderboard/top-users');
    console.log('✅ Server is running!');
    console.log('Response:', leaderboard.data);
    console.log('\n---\n');

    // Test 2: Create a test user (directly via MongoDB would be better, but showing the flow)
    console.log('2️⃣ To create users, run this in MongoDB:');
    console.log(`
db.users.insertMany([
  {
    username: "alice",
    email: "alice@example.com",
    points: 0,
    badges: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: "bob",
    email: "bob@example.com",
    points: 0,
    badges: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
    `);
    console.log('\n---\n');

    // Test 3: Show how to create a question
    console.log('3️⃣ Example: Create a question');
    console.log('Replace YOUR_USER_ID with actual user ID from MongoDB\n');
    
    const questionExample = {
      title: "React mein state kaise manage karein?",
      content: "Mujhe React state management samajh nahi aa raha",
      tags: ["react", "state"]
    };
    
    console.log('POST /api/questions');
    console.log('Headers: x-user-id: YOUR_USER_ID');
    console.log('Body:', JSON.stringify(questionExample, null, 2));
    console.log('\n---\n');

    // Test 4: Show how to answer a question
    console.log('4️⃣ Example: Answer a question (Get 5 points!)');
    console.log('Replace QUESTION_ID and YOUR_USER_ID\n');
    
    const answerExample = {
      content: "React mein useState hook use karein. Example: const [count, setCount] = useState(0);"
    };
    
    console.log('POST /api/questions/QUESTION_ID/answers');
    console.log('Headers: x-user-id: YOUR_USER_ID');
    console.log('Body:', JSON.stringify(answerExample, null, 2));
    console.log('\n---\n');

    // Test 5: Show how to transfer points
    console.log('5️⃣ Example: Transfer points (Need 10+ points)');
    console.log('Replace YOUR_USER_ID and OTHER_USER_ID\n');
    
    const transferExample = {
      toUserId: "OTHER_USER_ID",
      points: 5
    };
    
    console.log('POST /api/rewards/transfer');
    console.log('Headers: x-user-id: YOUR_USER_ID');
    console.log('Body:', JSON.stringify(transferExample, null, 2));
    console.log('\n---\n');

    console.log('✅ All examples shown! Server is ready to use.');
    console.log('\n📚 Check README.md for complete API documentation');
    console.log('🌐 Server running at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testAPI();
