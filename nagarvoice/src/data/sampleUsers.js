// ============================================
// NagarVoice — Sample User Profiles for Demo
// OTP for all users: 1234
// ============================================

const sampleUsers = [
  {
    id: 'user_9876543210',
    phone: '9876543210',
    name: 'Arjun Sharma',
    ward: 'Koramangala',
    zone: 'South',
    avatar: 'AS',
    avatarColor: '#4361ee',
    civicScore: 820,
    tier: 'Gold',
    points: 820,
    isAdmin: false,
    badges: ['First Report', 'Active Citizen', 'Community Voice', 'Watchdog', 'Local Hero'],
    joinedAt: '2025-08-15T10:00:00',
    issuesReported: 12,
    issuesResolved: 8,
    totalUpvotesReceived: 234,
    bio: 'Software engineer passionate about making Koramangala cleaner and safer.',
  },
  {
    id: 'user_8765432109',
    phone: '8765432109',
    name: 'Priya Nair',
    ward: 'Indiranagar',
    zone: 'East',
    avatar: 'PN',
    avatarColor: '#7209b7',
    civicScore: 540,
    tier: 'Silver',
    points: 540,
    isAdmin: false,
    badges: ['First Report', 'Active Citizen', 'Community Voice'],
    joinedAt: '2025-11-20T14:30:00',
    issuesReported: 7,
    issuesResolved: 4,
    totalUpvotesReceived: 89,
    bio: 'Architect and urban design enthusiast. Indiranagar resident for 6 years.',
  },
  {
    id: 'user_7654321098',
    phone: '7654321098',
    name: 'Mohammed Rafi',
    ward: 'Shivajinagar',
    zone: 'East',
    avatar: 'MR',
    avatarColor: '#06d6a0',
    civicScore: 210,
    tier: 'Bronze',
    points: 210,
    isAdmin: false,
    badges: ['First Report'],
    joinedAt: '2026-01-05T09:00:00',
    issuesReported: 3,
    issuesResolved: 1,
    totalUpvotesReceived: 23,
    bio: 'Small business owner in Shivajinagar. New to civic reporting.',
  },
  {
    id: 'user_6543210987',
    phone: '6543210987',
    name: 'Kavitha Reddy',
    ward: 'Jayanagar',
    zone: 'South',
    avatar: 'KR',
    avatarColor: '#f7b801',
    civicScore: 980,
    tier: 'Platinum',
    points: 980,
    isAdmin: false,
    badges: ['First Report', 'Active Citizen', 'Community Voice', 'Watchdog', 'Local Hero', 'Anonymous Tip'],
    joinedAt: '2025-03-10T08:00:00',
    issuesReported: 28,
    issuesResolved: 22,
    totalUpvotesReceived: 567,
    bio: 'Retired professor and Jayanagar ward committee member. Civic champion.',
  },
  {
    id: 'user_9999999999',
    phone: '9999999999',
    name: 'Admin User',
    ward: 'BBMP HQ',
    zone: 'Central',
    avatar: 'AD',
    avatarColor: '#ef233c',
    civicScore: 0,
    tier: 'Admin',
    points: 0,
    isAdmin: true,
    badges: [],
    joinedAt: '2025-01-01T00:00:00',
    issuesReported: 0,
    issuesResolved: 0,
    totalUpvotesReceived: 0,
    bio: 'BBMP Administrative Officer',
  }
];

// Civic Score tiers
export const civicTiers = [
  { name: 'Bronze', min: 0, max: 299, color: '#cd7f32', icon: '🥉', next: 'Silver' },
  { name: 'Silver', min: 300, max: 599, color: '#c0c0c0', icon: '🥈', next: 'Gold' },
  { name: 'Gold', min: 600, max: 899, color: '#f7b801', icon: '🥇', next: 'Platinum' },
  { name: 'Platinum', min: 900, max: 1000, color: '#4cc9f0', icon: '💎', next: null },
];

export function getTierForScore(score) {
  return civicTiers.find(t => score >= t.min && score <= t.max) || civicTiers[0];
}

export function getUserByPhone(phone) {
  return sampleUsers.find(u => u.phone === phone) || null;
}

export default sampleUsers;
