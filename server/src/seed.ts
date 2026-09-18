import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding CodeApex database...');

  // Create Demo User with linked platform handles
  const passwordHash = await bcrypt.hash('demo123456', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@codeapex.io' },
    update: {
      leetcodeHandle: 'sky_ydv',
      codeforcesHandle: 'tourist',
      codechefHandle: 'sky_code',
      gfgHandle: 'sky_apex',
    },
    create: {
      name: 'Sky Apex',
      email: 'demo@codeapex.io',
      passwordHash,
      points: 1250,
      streakCount: 14,
      leetcodeHandle: 'sky_ydv',
      codeforcesHandle: 'tourist',
      codechefHandle: 'sky_code',
      gfgHandle: 'sky_apex',
      bio: 'Competitive programmer & full-stack architect building CodeApex.',
    },
  });

  console.log('👤 Created demo user:', demoUser.email);

  // Create Demo Room
  const demoRoom = await prisma.room.upsert({
    where: { roomCode: 'APEX01' },
    update: {},
    create: {
      name: 'Apex Collaborative Hub',
      roomCode: 'APEX01',
      description: 'Real-time multi-language collaborative workspace for team coding',
      language: 'typescript',
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
          name: 'Main Application',
          description: 'Apex core system files',
          files: {
            create: [
              {
                name: 'index.ts',
                path: '/index.ts',
                language: 'typescript',
                content: `// Welcome to CodeApex Real-Time Collaborative Workspace!
// Multi-language execution engine powered by Piston & Proctor Anti-Cheat system.

function calculateApexScore(submissions: number, accuracy: number): number {
  console.log("⚡ Calculating Apex Developer Score...");
  return Math.round((submissions * accuracy) * 1.5);
}

const score = calculateApexScore(42, 94.5);
console.log(\`🚀 Current Apex Rank Score: \${score} Points\`);
`,
              },
              {
                name: 'solution.py',
                path: '/solution.py',
                language: 'python',
                content: `# CodeApex Python Multi-Language Runner
import math

def fibonacci_sequence(n: int):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("🐍 Python 3 Execution:")
print("Fibonacci (10 terms):", fibonacci_sequence(10))
`,
              },
            ],
          },
        },
      },
    },
  });

  console.log('🏠 Created demo room:', demoRoom.name, `(Code: ${demoRoom.roomCode})`);

  // Create Sample Contests
  const contest1 = await prisma.contest.upsert({
    where: { slug: 'codeapex-grand-championship-2026' },
    update: {},
    create: {
      title: 'CodeApex Grand Championship 2026',
      slug: 'codeapex-grand-championship-2026',
      description: 'The ultimate online competitive coding contest featuring real-time proctoring and multi-language support.',
      rules: '1. Tab switching will trigger immediate proctor warnings.\n2. Fullscreen mode is strictly enforced.\n3. 3 strikes result in automatic disqualification.',
      startTime: new Date(Date.now() - 3600000), // started 1 hr ago
      endTime: new Date(Date.now() + 86400000), // ends in 24 hrs
      durationMinutes: 120,
      isPublic: true,
      antiCheatEnabled: true,
      maxStrikes: 3,
      createdById: demoUser.id,
      problems: {
        create: [
          {
            title: 'Apex Subarray Maximum',
            slug: 'apex-subarray-maximum',
            difficulty: 'EASY',
            points: 100,
            order: 1,
            description: 'Given an array of numbers, find the contiguous subarray with the largest sum and return its sum.',
            starterCode: 'function maxSubArray(nums) {\n  // Write your solution here\n}',
            testCases: JSON.stringify([
              { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
              { input: '[1]', expected: '1' },
              { input: '[5,4,-1,7,8]', expected: '23' },
            ]),
            hints: JSON.stringify(['Use Kadane\'s algorithm for O(n) time complexity.']),
          },
          {
            title: 'Valid Parentheses Lock',
            slug: 'valid-parentheses-lock',
            difficulty: 'MEDIUM',
            points: 200,
            order: 2,
            description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
            starterCode: 'function isValid(s) {\n  // Return true or false\n}',
            testCases: JSON.stringify([
              { input: '()[]{}', expected: 'true' },
              { input: '(]', expected: 'false' },
              { input: '{[]}', expected: 'true' },
            ]),
            hints: JSON.stringify(['Use a Stack data structure to track opening brackets.']),
          },
        ],
      },
    },
  });

  console.log('🏆 Created sample contest:', contest1.title);

  // Seed Coding Challenges
  const challenges = [
    {
      title: 'Two Sum Apex',
      slug: 'two-sum-apex',
      difficulty: 'EASY',
      category: 'Arrays',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
      starterCode: 'function twoSum(nums, target) {\n  // Write code here\n}',
      language: 'javascript',
      testCases: JSON.stringify([
        { input: '[2,7,11,15]\n9', expected: '[0, 1]' },
        { input: '[3,2,4]\n6', expected: '[1, 2]' },
      ]),
      hints: JSON.stringify(['Use a hash map to store seen values and their indices.']),
      points: 50,
    },
    {
      title: 'Reverse String Matrix',
      slug: 'reverse-string-matrix',
      difficulty: 'EASY',
      category: 'Strings',
      description: 'Write a function that reverses a string.',
      starterCode: 'function reverseString(s) {\n  return s.split("").reverse().join("");\n}',
      language: 'javascript',
      testCases: JSON.stringify([
        { input: '"hello"', expected: '"olleh"' },
        { input: '"Apex"', expected: '"xepA"' },
      ]),
      hints: JSON.stringify(['Two pointers technique or built-in reverse string methods.']),
      points: 50,
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
