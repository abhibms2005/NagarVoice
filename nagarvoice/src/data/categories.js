export const categories = [
  { id: 'pothole', name: 'Pothole', key: 'pothole', icon: '🕳️', color: '#ef233c', dept: 'BBMP Roads' },
  { id: 'garbage', name: 'Garbage', key: 'garbage', icon: '🗑️', color: '#fca311', dept: 'BBMP Solid Waste' },
  { id: 'streetlight', name: 'Streetlight', key: 'streetlight', icon: '💡', color: '#4cc9f0', dept: 'BESCOM' },
  { id: 'waterLeak', name: 'Water Leak', key: 'waterLeak', icon: '💧', color: '#4361ee', dept: 'BWSSB' },
  { id: 'sewage', name: 'Sewage', key: 'sewage', icon: '🚰', color: '#7209b7', dept: 'BWSSB' },
  { id: 'encroachment', name: 'Encroachment', key: 'encroachment', icon: '🚧', color: '#d00000', dept: 'BBMP Encroachment' },
  { id: 'roadDamage', name: 'Road Damage', key: 'roadDamage', icon: '🛣️', color: '#e85d04', dept: 'BBMP Roads' },
  { id: 'treeFall', name: 'Tree Fall', key: 'treeFall', icon: '🌳', color: '#06d6a0', dept: 'BBMP Horticulture' },
  { id: 'illegalDumping', name: 'Illegal Dumping', key: 'illegalDumping', icon: '⚠️', color: '#fca311', dept: 'BBMP Solid Waste' },
  { id: 'electricalHazard', name: 'Electrical', key: 'electricalHazard', icon: '⚡', color: '#d00000', dept: 'BESCOM' },
  { id: 'drainage', name: 'Drainage', key: 'drainage', icon: '🌊', color: '#4361ee', dept: 'BBMP Storm Water' },
  { id: 'noise', name: 'Noise', key: 'noise', icon: '🔊', color: '#6c757d', dept: 'BBMP Health' },
  { id: 'other', name: 'Other', key: 'other', icon: '📋', color: '#6c757d', dept: 'BBMP General' }
];

export const wardsList = [
  'Koramangala', 'Indiranagar', 'Jayanagar', 'Shivajinagar', 'Malleshwaram',
  'Whitefield', 'HSR Layout', 'BTM Layout', 'Electronic City', 'Marathahalli',
  'KR Puram', 'Majestic', 'Basavanagudi', 'Vijayanagar', 'RR Nagar',
  'Bannerghatta Road', 'Sarjapur Road', 'Nagarbhavi', 'Bommanahalli',
  'Kempegowda Nagar', 'Shantinagar', 'Hebbal', 'Yelahanka', 'JP Nagar', 'Rajajinagar'
];

export const wards = [
  { id: 1, name: 'Kempegowda Nagar', zone: 'South' },
  { id: 2, name: 'Shantinagar', zone: 'East' },
  { id: 3, name: 'Jayanagar', zone: 'South' },
  { id: 4, name: 'Koramangala', zone: 'South' },
  { id: 5, name: 'Indiranagar', zone: 'East' },
  { id: 6, name: 'Whitefield', zone: 'East' },
  { id: 7, name: 'Malleshwaram', zone: 'West' },
  { id: 8, name: 'Rajajinagar', zone: 'West' },
  { id: 9, name: 'Hebbal', zone: 'North' },
  { id: 10, name: 'Yelahanka', zone: 'North' },
  { id: 11, name: 'JP Nagar', zone: 'South' },
  { id: 12, name: 'BTM Layout', zone: 'South' },
  { id: 13, name: 'HSR Layout', zone: 'South' },
  { id: 14, name: 'Electronic City', zone: 'South' },
  { id: 15, name: 'Marathahalli', zone: 'East' },
  { id: 16, name: 'KR Puram', zone: 'East' },
  { id: 17, name: 'Majestic', zone: 'West' },
  { id: 18, name: 'Basavanagudi', zone: 'South' },
  { id: 19, name: 'Vijayanagar', zone: 'West' },
  { id: 20, name: 'RR Nagar', zone: 'West' },
  { id: 21, name: 'Bannerghatta Road', zone: 'South' },
  { id: 22, name: 'Sarjapur Road', zone: 'East' },
  { id: 23, name: 'Nagarbhavi', zone: 'West' },
  { id: 24, name: 'Bommanahalli', zone: 'South' },
];

export const priorityLevels = [
  { id: 'low', label: 'Low', color: '#06d6a0', icon: '🟢' },
  { id: 'medium', label: 'Medium', color: '#fca311', icon: '🟡' },
  { id: 'high', label: 'High', color: '#ef233c', icon: '🔴' },
  { id: 'critical', label: 'Critical', color: '#d00000', icon: '🔴' }
];

export const statusList = [
  { id: 'reported', label: 'Reported', color: '#ef233c' },
  { id: 'acknowledged', label: 'Acknowledged', color: '#fca311' },
  { id: 'in-progress', label: 'In Progress', color: '#4cc9f0' },
  { id: 'resolved', label: 'Resolved', color: '#06d6a0' },
  { id: 'escalated', label: 'Escalated', color: '#7209b7' }
];
