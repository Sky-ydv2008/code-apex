import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding CodeCraft AI database...');

  // Create Demo User
  const passwordHash = await bcrypt.hash('demo123456', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@codecraft.ai' },
    update: {},
    create: {
      name: 'Apex Innovator',
      email: 'demo@codecraft.ai',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      points: 450,
      streakCount: 5,
    },
  });

  console.log('👤 Created demo user:', demoUser.email);

  // Create Demo Room
  const demoRoom = await prisma.room.upsert({
    where: { roomCode: 'APEX01' },
    update: {},
    create: {
      name: 'Apex Innovators Public Studio',
      roomCode: 'APEX01',
      description: 'Public real-time coding workspace for JavaScript and Python developers.',
      language: 'javascript',
      isPublic: true,
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: 'OWNER',
        },
      },
      projects: {
        create: {
          name: 'Main Workspace',
          description: 'Default project folder',
          files: {
            create: [
              {
                name: 'index.js',
                path: 'index.js',
                language: 'javascript',
                content: `// Welcome to CodeCraft AI Collaborative Workspace!
// Try running this code or asking AI to explain/debug/optimize it.

function calculateFibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

console.log("Fibonacci(10) =", calculateFibonacci(10));
console.log("Fibonacci(20) =", calculateFibonacci(20));
`,
              },
              {
                name: 'main.py',
                path: 'main.py',
                language: 'python',
                content: `# Welcome to CodeCraft AI Python Sandbox!

def is_palindrome(text: str) -> bool:
    cleaned = ''.join(c.lower() for c in text if c.isalnum())
    return cleaned == cleaned[::-1]

test_phrase = "A man, a plan, a canal: Panama"
print(f"Is '{test_phrase}' a palindrome?", is_palindrome(test_phrase))
`,
              },
            ],
          },
        },
      },
    },
  });

  console.log('🏠 Created demo room:', demoRoom.name, `(Code: ${demoRoom.roomCode})`);

  // Create Coding Challenges
  const challenges = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'EASY',
      category: 'Arrays',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

Assume that each input would have **exactly one solution**, and you may not use the same element twice.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\``,
      starterCode: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
      language: 'javascript',
      testCases: JSON.stringify([
        { input: 'twoSum([2, 7, 11, 15], 9)', expected: '[0, 1]' },
        { input: 'twoSum([3, 2, 4], 6)', expected: '[1, 2]' },
        { input: 'twoSum([3, 3], 6)', expected: '[0, 1]' },
      ]),
      hints: JSON.stringify([
        'A brute force approach uses nested loops O(N^2). Can you use a Hash Map to do it in O(N)?',
        'Store each number index in a hash map as you iterate.',
        'Check if (target - currentNumber) exists in your map.'
      ]),
      points: 50,
    },
    {
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: 'EASY',
      category: 'Strings',
      description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
      starterCode: `function isPalindrome(s) {
  // Your code here
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));
`,
      language: 'javascript',
      testCases: JSON.stringify([
        { input: 'isPalindrome("A man, a plan, a canal: Panama")', expected: 'true' },
        { input: 'isPalindrome("race a car")', expected: 'false' },
        { input: 'isPalindrome(" ")', expected: 'true' },
      ]),
      hints: JSON.stringify([
        'Filter out non-alphanumeric characters first using regex.',
        'Compare the string with its reverse or use two pointers from left and right.'
      ]),
      points: 50,
    },
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci-number',
      difficulty: 'MEDIUM',
      category: 'Dynamic Programming',
      description: `The **Fibonacci numbers**, commonly denoted \`F(n)\`, form a sequence such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

Given \`n\`, calculate \`F(n)\`.`,
      starterCode: `function fib(n) {
  // Your code here
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let c = a + b;
    a = b;
    b = c;
  }
  return b;
}

console.log(fib(10));
`,
      language: 'javascript',
      testCases: JSON.stringify([
        { input: 'fib(2)', expected: '1' },
        { input: 'fib(3)', expected: '2' },
        { input: 'fib(4)', expected: '3' },
        { input: 'fib(10)', expected: '55' },
      ]),
      hints: JSON.stringify([
        'Recursion takes O(2^N) time. Can you do it in O(N) using dynamic programming?',
        'Maintain two variables for F(n-1) and F(n-2).'
      ]),
      points: 100,
    },
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log(`🎉 Seeded ${challenges.length} coding challenges.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
