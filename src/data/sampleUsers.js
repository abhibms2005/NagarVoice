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
    ward: null, // Admin manages ALL wards - must select at login
    zone: 'All',
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
    bio: 'BBMP Administrative Officer - Manages all wards',
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
