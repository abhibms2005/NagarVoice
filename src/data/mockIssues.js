// 50+ realistic Bangalore civic issues with real coordinates
// Issues ISS001-ISS010 are linked to sample user profiles
const mockIssues = [
  {
    id: 'ISS001', category: 'pothole', title: 'Large pothole on 80 Feet Road',
    description: 'A deep pothole near the bus stop on 80 Feet Road, Koramangala. Multiple vehicles have been damaged. The pothole is approximately 2 feet wide and 8 inches deep.',
    location: { lat: 12.9352, lng: 77.6245, address: '80 Feet Road, Koramangala, Bangalore - 560034' },
    ward: 'Koramangala', zone: 'South', status: 'in-progress', priority: 'high',
    reportedBy: 'user_9876543210', reporterName: 'Arjun Sharma', anonymous: false,
    upvotes: 47, upvotedBy: [], comments: [
      { id: 'c1', user: 'Priya Nair', text: 'This pothole has been here for 3 weeks now!', time: '2026-03-10T10:00:00' },
      { id: 'c2', user: 'Karthik R', text: 'I damaged my bike tire here yesterday', time: '2026-03-11T14:30:00' }
    ],
    photos: ['pothole_80ft.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-05T09:30:00', note: 'Issue reported by citizen' },
      { status: 'acknowledged', time: '2026-03-06T11:00:00', note: 'Acknowledged by BBMP Roads Dept' },
      { status: 'in-progress', time: '2026-03-10T08:00:00', note: 'Repair crew dispatched. Material procured.' }
    ],
    assignedTo: 'BBMP Roads Division - South', createdAt: '2026-03-05T09:30:00', updatedAt: '2026-03-10T08:00:00', afterPhoto: null
  },
  {
    id: 'ISS002', category: 'garbage', title: 'Garbage dump near Silk Board junction',
    description: 'Large pile of mixed waste dumped on the roadside near Silk Board junction. Causing terrible smell and blocking pedestrian walkway.',
    location: { lat: 12.9177, lng: 77.6233, address: 'Silk Board Junction, BTM Layout, Bangalore - 560076' },
    ward: 'BTM Layout', zone: 'South', status: 'reported', priority: 'high',
    reportedBy: 'user_9876543210', reporterName: 'Arjun Sharma', anonymous: false,
    upvotes: 89, upvotedBy: [], comments: [
      { id: 'c3', user: 'Suresh K', text: 'This is a health hazard. Dogs are scavenging through it.', time: '2026-03-12T16:00:00' }
    ],
    photos: ['garbage_silkboard.jpg'],
    timeline: [{ status: 'reported', time: '2026-03-11T17:45:00', note: 'Issue reported by citizen' }],
    assignedTo: null, createdAt: '2026-03-11T17:45:00', updatedAt: '2026-03-11T17:45:00', afterPhoto: null
  },
  {
    id: 'ISS003', category: 'streetlight', title: 'Broken streetlight on MG Road',
    description: 'Streetlight near MG Road metro station has been non-functional for over 10 days. The area becomes very dark at night making it unsafe.',
    location: { lat: 12.9756, lng: 77.6062, address: 'MG Road, Near Metro Station, Bangalore - 560001' },
    ward: 'Shantinagar', zone: 'East', status: 'resolved', priority: 'medium',
    reportedBy: 'user_9876543210', reporterName: 'Arjun Sharma', anonymous: false,
    upvotes: 23, upvotedBy: [], comments: [],
    photos: ['streetlight_mg.jpg'],
    timeline: [
      { status: 'reported', time: '2026-02-28T20:00:00', note: 'Issue reported by citizen' },
      { status: 'acknowledged', time: '2026-03-01T09:00:00', note: 'BESCOM notified' },
      { status: 'in-progress', time: '2026-03-03T10:00:00', note: 'Electrician dispatched' },
      { status: 'resolved', time: '2026-03-04T16:30:00', note: 'Streetlight replaced and working' }
    ],
    assignedTo: 'BESCOM - East Division', createdAt: '2026-02-28T20:00:00', updatedAt: '2026-03-04T16:30:00',
    afterPhoto: 'streetlight_mg_after.jpg'
  },
  {
    id: 'ISS004', category: 'waterLeak', title: 'Water pipe burst on 100ft Road Indiranagar',
    description: 'Major water pipe burst causing water wastage and road flooding. Water has been flowing non-stop for 2 days.',
    location: { lat: 12.9784, lng: 77.6408, address: '100 Feet Road, Indiranagar, Bangalore - 560038' },
    ward: 'Indiranagar', zone: 'East', status: 'in-progress', priority: 'critical',
    reportedBy: 'user_8765432109', reporterName: 'Priya Nair', anonymous: false,
    upvotes: 156, upvotedBy: [], comments: [
      { id: 'c4', user: 'Vijay S', text: 'Lakhs of litres wasted. BWSSB please act!', time: '2026-03-13T09:00:00' },
      { id: 'c5', user: 'Lakshmi P', text: 'No water supply in our area because of this', time: '2026-03-13T10:30:00' }
    ],
    photos: ['waterleak_indiranagar.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-12T06:00:00', note: 'Issue reported by citizen' },
      { status: 'acknowledged', time: '2026-03-12T08:00:00', note: 'BWSSB emergency team alerted' },
      { status: 'in-progress', time: '2026-03-13T07:00:00', note: 'Repair team on site' }
    ],
    assignedTo: 'BWSSB - East Zone', createdAt: '2026-03-12T06:00:00', updatedAt: '2026-03-13T07:00:00', afterPhoto: null
  },
  {
    id: 'ISS005', category: 'sewage', title: 'Sewage overflow in Jayanagar 4th Block',
    description: 'Sewage water overflowing from manhole near 4th Block main road. Unbearable stench affecting nearby residences and shops.',
    location: { lat: 12.9250, lng: 77.5838, address: '4th Block, Jayanagar, Bangalore - 560011' },
    ward: 'Jayanagar', zone: 'South', status: 'escalated', priority: 'critical',
    reportedBy: 'user_6543210987', reporterName: 'Kavitha Reddy', anonymous: false,
    upvotes: 112, upvotedBy: [], comments: [
      { id: 'c6', user: 'Ravi Kumar', text: 'Has been like this for 2 weeks! Escalate immediately!', time: '2026-03-09T12:00:00' }
    ],
    photos: ['sewage_jayanagar.jpg'],
    timeline: [
      { status: 'reported', time: '2026-02-25T08:00:00', note: 'Issue reported by citizen' },
      { status: 'acknowledged', time: '2026-02-26T10:00:00', note: 'BWSSB acknowledged' },
      { status: 'escalated', time: '2026-03-04T08:00:00', note: 'Auto-escalated after 7 days without resolution' }
    ],
    assignedTo: 'BWSSB - South Zone (Escalated to Zonal Head)', createdAt: '2026-02-25T08:00:00', updatedAt: '2026-03-04T08:00:00', afterPhoto: null
  },
  {
    id: 'ISS006', category: 'encroachment', title: 'Footpath encroachment on CMH Road',
    description: 'Multiple vendors have permanently encroached upon the footpath making it impossible for pedestrians. Senior citizens and disabled people are forced to walk on the road.',
    location: { lat: 12.9810, lng: 77.6370, address: 'CMH Road, Indiranagar, Bangalore - 560038' },
    ward: 'Indiranagar', zone: 'East', status: 'reported', priority: 'medium',
    reportedBy: 'user_8765432109', reporterName: 'Priya Nair', anonymous: false,
    upvotes: 34, upvotedBy: [], comments: [],
    photos: ['encroachment_cmh.jpg'],
    timeline: [{ status: 'reported', time: '2026-03-13T11:00:00', note: 'Issue reported by citizen' }],
    assignedTo: null, createdAt: '2026-03-13T11:00:00', updatedAt: '2026-03-13T11:00:00', afterPhoto: null
  },
  {
    id: 'ISS007', category: 'roadDamage', title: 'Road completely damaged near Hebbal flyover',
    description: 'The road surface near Hebbal flyover entry has completely deteriorated. Large cracks and uneven surface causing accidents daily.',
    location: { lat: 13.0358, lng: 77.5970, address: 'Hebbal Flyover, Hebbal, Bangalore - 560024' },
    ward: 'Hebbal', zone: 'North', status: 'acknowledged', priority: 'high',
    reportedBy: 'user_7654321098', reporterName: 'Mohammed Rafi', anonymous: false,
    upvotes: 78, upvotedBy: [], comments: [
      { id: 'c7', user: 'Naveen B', text: 'I saw 3 accidents here this week alone', time: '2026-03-12T18:00:00' }
    ],
    photos: ['road_hebbal.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-08T07:30:00', note: 'Issue reported with photos' },
      { status: 'acknowledged', time: '2026-03-09T10:00:00', note: 'BBMP Roads Dept acknowledged' }
    ],
    assignedTo: 'BBMP Roads Division - North', createdAt: '2026-03-08T07:30:00', updatedAt: '2026-03-09T10:00:00', afterPhoto: null
  },
  {
    id: 'ISS008', category: 'treeFall', title: 'Fallen tree blocking road in Malleshwaram',
    description: 'Large tree has fallen across the road after last night\'s storm. Completely blocking traffic and has damaged two parked cars.',
    location: { lat: 13.0035, lng: 77.5647, address: '15th Cross, Malleshwaram, Bangalore - 560003' },
    ward: 'Malleshwaram', zone: 'West', status: 'resolved', priority: 'critical',
    reportedBy: 'user_7654321098', reporterName: 'Mohammed Rafi', anonymous: false,
    upvotes: 45, upvotedBy: [], comments: [],
    photos: ['tree_malleshwaram.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-10T06:00:00', note: 'Reported as emergency' },
      { status: 'acknowledged', time: '2026-03-10T06:30:00', note: 'Emergency response activated' },
      { status: 'in-progress', time: '2026-03-10T07:00:00', note: 'BBMP tree cutting team arrived' },
      { status: 'resolved', time: '2026-03-10T10:00:00', note: 'Tree removed, road cleared' }
    ],
    assignedTo: 'BBMP Horticulture - West', createdAt: '2026-03-10T06:00:00', updatedAt: '2026-03-10T10:00:00', afterPhoto: null
  },
  {
    id: 'ISS009', category: 'drainage', title: 'Blocked drain causing waterlogging in Whitefield',
    description: 'Storm water drain blocked with debris near ITPL Main Road. Even light rain causes severe waterlogging affecting thousands of commuters.',
    location: { lat: 12.9698, lng: 77.7500, address: 'ITPL Main Road, Whitefield, Bangalore - 560066' },
    ward: 'Whitefield', zone: 'East', status: 'in-progress', priority: 'high',
    reportedBy: 'user_8765432109', reporterName: 'Priya Nair', anonymous: false,
    upvotes: 203, upvotedBy: [], comments: [
      { id: 'c8', user: 'Pooja D', text: 'Every rainy day this area becomes a lake!', time: '2026-03-07T19:00:00' },
      { id: 'c9', user: 'Ahmed K', text: 'BBMP has been promising to fix this for 6 months', time: '2026-03-08T08:00:00' }
    ],
    photos: ['drainage_whitefield.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-01T16:00:00', note: 'Reported with video evidence' },
      { status: 'acknowledged', time: '2026-03-02T09:30:00', note: 'BBMP Storm Water Dept notified' },
      { status: 'in-progress', time: '2026-03-10T08:00:00', note: 'Desilting work commenced' }
    ],
    assignedTo: 'BBMP Storm Water - East', createdAt: '2026-03-01T16:00:00', updatedAt: '2026-03-10T08:00:00', afterPhoto: null
  },
  {
    id: 'ISS010', category: 'electricalHazard', title: 'Dangling electric wire on Bannerghatta Road',
    description: 'Low-hanging electrical wire from a damaged pole near Meenakshi Temple. Extremely dangerous, especially during rain.',
    location: { lat: 12.8898, lng: 77.5968, address: 'Bannerghatta Road, Near Meenakshi Temple, Bangalore - 560076' },
    ward: 'Bannerghatta Road', zone: 'South', status: 'in-progress', priority: 'critical',
    reportedBy: 'user_7654321098', reporterName: 'Mohammed Rafi', anonymous: false,
    upvotes: 98, upvotedBy: [], comments: [
      { id: 'c10', user: 'Revathi N', text: 'A child almost touched this yesterday!', time: '2026-03-13T07:00:00' }
    ],
    photos: ['electric_bannerghatta.jpg'],
    timeline: [
      { status: 'reported', time: '2026-03-12T15:00:00', note: 'Reported as safety hazard' },
      { status: 'acknowledged', time: '2026-03-12T15:30:00', note: 'BESCOM emergency alert triggered' },
      { status: 'in-progress', time: '2026-03-13T08:00:00', note: 'BESCOM lineman dispatched' }
    ],
    assignedTo: 'BESCOM - South Division', createdAt: '2026-03-12T15:00:00', updatedAt: '2026-03-13T08:00:00', afterPhoto: null
  },
  // ──── Kavitha Reddy's issues (Jayanagar, Platinum user) ────
  {
    id: 'ISS011', category: 'garbage', title: 'Overflowing waste bins on 11th Main Jayanagar',
    description: 'All three community waste bins on 11th Main Road are overflowing. BBMP trucks have skipped collection for 5 days.',
    location: { lat: 12.9265, lng: 77.5821, address: '11th Main, 3rd Block, Jayanagar, Bangalore - 560011' },
    ward: 'Jayanagar', zone: 'South', status: 'resolved', priority: 'medium',
    reportedBy: 'user_6543210987', reporterName: 'Kavitha Reddy', anonymous: false,
    upvotes: 78, upvotedBy: [], comments: [
      { id: 'c11', user: 'Ramesh K', text: 'Finally resolved! Thank you Kavitha madam.', time: '2026-03-08T14:00:00' }
    ],
    photos: [], timeline: [
      { status: 'reported', time: '2026-03-03T09:00:00', note: 'Reported by ward committee member' },
      { status: 'acknowledged', time: '2026-03-03T11:00:00', note: 'BBMP Solid Waste notified' },
      { status: 'in-progress', time: '2026-03-04T07:00:00', note: 'Special collection drive initiated' },
      { status: 'resolved', time: '2026-03-05T18:00:00', note: 'All garbage collected, regular schedule resumed' }
    ],
    assignedTo: 'BBMP Solid Waste - South', createdAt: '2026-03-03T09:00:00', updatedAt: '2026-03-05T18:00:00',
    afterPhoto: 'jayanagar_clean.jpg'
  },
  {
    id: 'ISS012', category: 'streetlight', title: 'Multiple streetlights out on 4th T Block',
    description: 'At least 8 streetlights along the main road of 4th T Block are non-functional. Area is pitch dark after sunset.',
    location: { lat: 12.9230, lng: 77.5870, address: '4th T Block, Jayanagar, Bangalore - 560041' },
    ward: 'Jayanagar', zone: 'South', status: 'in-progress', priority: 'high',
    reportedBy: 'user_6543210987', reporterName: 'Kavitha Reddy', anonymous: false,
    upvotes: 67, upvotedBy: [], comments: [],
    photos: [], timeline: [
      { status: 'reported', time: '2026-03-07T19:00:00', note: 'Reported with exact pole numbers' },
      { status: 'acknowledged', time: '2026-03-08T10:00:00', note: 'BESCOM team assigned' },
      { status: 'in-progress', time: '2026-03-12T08:00:00', note: 'Repair in progress' }
    ],
    assignedTo: 'BESCOM - South', createdAt: '2026-03-07T19:00:00', updatedAt: '2026-03-12T08:00:00', afterPhoto: null
  },
  // ──── Remaining issues ────
  {
    id: 'ISS013', category: 'pothole', title: 'Multiple potholes on Outer Ring Road near Marathahalli',
    description: 'Stretch of 200 meters with dangerous potholes. Especially hazardous for two-wheelers at night.',
    location: { lat: 12.9563, lng: 77.7006, address: 'Outer Ring Road, Marathahalli, Bangalore - 560037' },
    ward: 'Marathahalli', zone: 'East', status: 'reported', priority: 'high',
    reportedBy: 'user011', reporterName: 'Vikram Joshi', anonymous: false,
    upvotes: 134, upvotedBy: [], comments: [], photos: [],
    timeline: [{ status: 'reported', time: '2026-03-13T12:00:00', note: 'Reported' }],
    assignedTo: null, createdAt: '2026-03-13T12:00:00', updatedAt: '2026-03-13T12:00:00', afterPhoto: null
  },
  {
    id: 'ISS014', category: 'garbage', title: 'Overflowing garbage bin at HSR Layout BDA Complex',
    description: 'The garbage collection point near BDA Complex has not been cleared for 4 days. Overflowing onto the road.',
    location: { lat: 12.9116, lng: 77.6389, address: 'BDA Complex, HSR Layout, Bangalore - 560102' },
    ward: 'HSR Layout', zone: 'South', status: 'acknowledged', priority: 'medium',
    reportedBy: 'user012', reporterName: 'Sneha Kulkarni', anonymous: false,
    upvotes: 56, upvotedBy: [], comments: [], photos: [],
    timeline: [
      { status: 'reported', time: '2026-03-10T08:00:00', note: 'Reported' },
      { status: 'acknowledged', time: '2026-03-11T09:00:00', note: 'Acknowledged' }
    ],
    assignedTo: 'BBMP Solid Waste - South', createdAt: '2026-03-10T08:00:00', updatedAt: '2026-03-11T09:00:00', afterPhoto: null
  },
  {
    id: 'ISS015', category: 'waterLeak', title: 'Borewell water contamination in Rajajinagar',
    description: 'Water from BWSSB supply has turned yellowish. Multiple households affected. Suspected contamination from nearby construction.',
    location: { lat: 12.9906, lng: 77.5528, address: '3rd Block, Rajajinagar, Bangalore - 560010' },
    ward: 'Rajajinagar', zone: 'West', status: 'escalated', priority: 'critical',
    reportedBy: 'user014', reporterName: 'Suresh Babu', anonymous: false,
    upvotes: 189, upvotedBy: [], comments: [], photos: [],
    timeline: [
      { status: 'reported', time: '2026-02-20T07:00:00', note: 'Health hazard reported' },
      { status: 'acknowledged', time: '2026-02-21T09:00:00', note: 'BWSSB acknowledged' },
      { status: 'escalated', time: '2026-02-27T07:00:00', note: 'Auto-escalated - unresolved 7 days' }
    ],
    assignedTo: 'BWSSB - West Zone (Escalated)', createdAt: '2026-02-20T07:00:00', updatedAt: '2026-02-27T07:00:00', afterPhoto: null
  },
  {
    id: 'ISS016', category: 'illegalDumping', title: 'Construction debris dumped near Yelahanka Lake',
    description: 'Large quantities of construction waste illegally dumped near the lake bund.',
    location: { lat: 13.1007, lng: 77.5963, address: 'Near Yelahanka Lake, Yelahanka, Bangalore - 560064' },
    ward: 'Yelahanka', zone: 'North', status: 'reported', priority: 'high',
    reportedBy: 'user015', reporterName: 'Anonymous', anonymous: true,
    upvotes: 145, upvotedBy: [], comments: [], photos: [],
    timeline: [{ status: 'reported', time: '2026-03-12T10:00:00', note: 'Reported anonymously' }],
    assignedTo: null, createdAt: '2026-03-12T10:00:00', updatedAt: '2026-03-12T10:00:00', afterPhoto: null
  },
  // ──── Bulk issues 17-50 ────
  ...([
    { id: 'ISS017', cat: 'pothole', title: 'Crater-sized pothole on Sarjapur Road', lat: 12.9103, lng: 77.6823, ward: 'Sarjapur Road', status: 'in-progress', priority: 'high', upvotes: 167 },
    { id: 'ISS018', cat: 'garbage', title: 'No garbage collection for a week in Basavanagudi', lat: 12.9416, lng: 77.5753, ward: 'Basavanagudi', status: 'resolved', priority: 'medium', upvotes: 78 },
    { id: 'ISS019', cat: 'noise', title: 'Loud construction noise at night Electronic City', lat: 12.8399, lng: 77.6770, ward: 'Electronic City', status: 'acknowledged', priority: 'medium', upvotes: 42 },
    { id: 'ISS020', cat: 'drainage', title: 'Open storm water drain without cover in KR Puram', lat: 13.0010, lng: 77.6970, ward: 'KR Puram', status: 'in-progress', priority: 'critical', upvotes: 211 },
    { id: 'ISS021', cat: 'roadDamage', title: 'Speed breaker too high on Nagarbhavi Main Road', lat: 12.9612, lng: 77.5115, ward: 'Nagarbhavi', status: 'reported', priority: 'medium', upvotes: 56 },
    { id: 'ISS022', cat: 'pothole', title: 'Potholes on Hosur Road service lane', lat: 12.9081, lng: 77.6351, ward: 'Bommanahalli', status: 'reported', priority: 'high', upvotes: 89 },
    { id: 'ISS023', cat: 'garbage', title: 'Garbage burning near Majestic bus stand', lat: 12.9770, lng: 77.5723, ward: 'Majestic', status: 'in-progress', priority: 'high', upvotes: 156 },
    { id: 'ISS024', cat: 'streetlight', title: 'Flickering streetlight Vijayanagar 2nd Stage', lat: 12.9707, lng: 77.5368, ward: 'Vijayanagar', status: 'resolved', priority: 'low', upvotes: 12 },
    { id: 'ISS025', cat: 'waterLeak', title: 'Water main leak near RR Nagar arch', lat: 12.9581, lng: 77.5119, ward: 'RR Nagar', status: 'in-progress', priority: 'high', upvotes: 78 },
    { id: 'ISS026', cat: 'sewage', title: 'Sewage overflowing on Kempegowda Road', lat: 12.9871, lng: 77.5698, ward: 'Kempegowda Nagar', status: 'escalated', priority: 'critical', upvotes: 134 },
    { id: 'ISS027', cat: 'pothole', title: 'Ring road potholes near Yeshwanthpur', lat: 13.0220, lng: 77.5500, ward: 'Malleshwaram', status: 'acknowledged', priority: 'high', upvotes: 95 },
    { id: 'ISS028', cat: 'garbage', title: 'Waste pile near Koramangala water tank', lat: 12.9310, lng: 77.6200, ward: 'Koramangala', status: 'resolved', priority: 'medium', upvotes: 34 },
    { id: 'ISS029', cat: 'encroachment', title: 'Illegal parking on footpath MG Road', lat: 12.9741, lng: 77.6152, ward: 'Shantinagar', status: 'reported', priority: 'low', upvotes: 23 },
    { id: 'ISS030', cat: 'roadDamage', title: 'Cave-in near Bommanahalli junction', lat: 12.9018, lng: 77.6175, ward: 'Bommanahalli', status: 'in-progress', priority: 'critical', upvotes: 187 },
    { id: 'ISS031', cat: 'treeFall', title: 'Dead tree about to fall on Sampige Road', lat: 12.9996, lng: 77.5696, ward: 'Malleshwaram', status: 'acknowledged', priority: 'high', upvotes: 45 },
    { id: 'ISS032', cat: 'pothole', title: 'Deep pothole near Christ University', lat: 12.9343, lng: 77.6086, ward: 'Koramangala', status: 'reported', priority: 'medium', upvotes: 67 },
    { id: 'ISS033', cat: 'drainage', title: 'Drain overflow near Agara Lake', lat: 12.9227, lng: 77.6382, ward: 'HSR Layout', status: 'in-progress', priority: 'high', upvotes: 123 },
    { id: 'ISS034', cat: 'streetlight', title: 'No lights on HAL Airport Road underpass', lat: 12.9580, lng: 77.6650, ward: 'Marathahalli', status: 'reported', priority: 'high', upvotes: 78 },
    { id: 'ISS035', cat: 'garbage', title: 'Medical waste dumped near park in BTM', lat: 12.9133, lng: 77.6100, ward: 'BTM Layout', status: 'escalated', priority: 'critical', upvotes: 201 },
    { id: 'ISS036', cat: 'waterLeak', title: 'Leaking valve near Lalbagh West Gate', lat: 12.9507, lng: 77.5803, ward: 'Basavanagudi', status: 'resolved', priority: 'medium', upvotes: 45 },
    { id: 'ISS037', cat: 'pothole', title: 'Potholes cluster near Forum Mall Koramangala', lat: 12.9345, lng: 77.6118, ward: 'Koramangala', status: 'in-progress', priority: 'high', upvotes: 112 },
    { id: 'ISS038', cat: 'electricalHazard', title: 'Exposed transformer box in HSR Sector 2', lat: 12.9144, lng: 77.6434, ward: 'HSR Layout', status: 'acknowledged', priority: 'critical', upvotes: 89 },
    { id: 'ISS039', cat: 'garbage', title: 'Overflowing dumpster on Kanakapura Road', lat: 12.8953, lng: 77.5715, ward: 'JP Nagar', status: 'reported', priority: 'medium', upvotes: 56 },
    { id: 'ISS040', cat: 'roadDamage', title: 'Unfinished road work near Silk Board', lat: 12.9195, lng: 77.6244, ward: 'BTM Layout', status: 'in-progress', priority: 'high', upvotes: 145 },
    { id: 'ISS041', cat: 'sewage', title: 'Manhole cover missing near Hebbal Lake', lat: 13.0380, lng: 77.5915, ward: 'Hebbal', status: 'in-progress', priority: 'critical', upvotes: 167 },
    { id: 'ISS042', cat: 'pothole', title: 'Series of potholes on Old Airport Road', lat: 12.9663, lng: 77.6489, ward: 'Indiranagar', status: 'reported', priority: 'high', upvotes: 98 },
    { id: 'ISS043', cat: 'noise', title: 'DJ playing late night Koramangala', lat: 12.9280, lng: 77.6320, ward: 'Koramangala', status: 'resolved', priority: 'low', upvotes: 34 },
    { id: 'ISS044', cat: 'garbage', title: 'E-waste dumped behind IT Park Whitefield', lat: 12.9750, lng: 77.7450, ward: 'Whitefield', status: 'reported', priority: 'medium', upvotes: 67 },
    { id: 'ISS045', cat: 'streetlight', title: 'LED light installed but not working Electronic City', lat: 12.8450, lng: 77.6650, ward: 'Electronic City', status: 'acknowledged', priority: 'low', upvotes: 23 },
    { id: 'ISS046', cat: 'waterLeak', title: 'Underground pipe leak flooding basement Jayanagar', lat: 12.9280, lng: 77.5800, ward: 'Jayanagar', status: 'in-progress', priority: 'high', upvotes: 89 },
    { id: 'ISS047', cat: 'encroachment', title: 'Shop extended onto public road Malleshwaram', lat: 13.0010, lng: 77.5700, ward: 'Malleshwaram', status: 'reported', priority: 'medium', upvotes: 45 },
    { id: 'ISS048', cat: 'drainage', title: 'Clogged rain gutter flooding homes Yelahanka', lat: 13.0950, lng: 77.5880, ward: 'Yelahanka', status: 'reported', priority: 'high', upvotes: 78 },
    { id: 'ISS049', cat: 'pothole', title: 'Pothole at bus stop BTM 2nd Stage', lat: 12.9170, lng: 77.6150, ward: 'BTM Layout', status: 'resolved', priority: 'medium', upvotes: 34 },
    { id: 'ISS050', cat: 'garbage', title: 'Burning plastic waste near school Rajajinagar', lat: 12.9880, lng: 77.5550, ward: 'Rajajinagar', status: 'in-progress', priority: 'critical', upvotes: 178 },
    { id: 'ISS051', cat: 'roadDamage', title: 'Sinkhole forming on Bellary Road', lat: 13.0280, lng: 77.5850, ward: 'Hebbal', status: 'acknowledged', priority: 'critical', upvotes: 234 },
  ].map(item => ({
    id: item.id, category: item.cat, title: item.title,
    description: `${item.title}. Reported by a concerned citizen in ${item.ward} ward.`,
    location: { lat: item.lat, lng: item.lng, address: `${item.ward}, Bangalore` },
    ward: item.ward, zone: 'Mixed', status: item.status, priority: item.priority,
    reportedBy: `user${item.id.slice(3)}`, reporterName: 'Citizen', anonymous: false,
    upvotes: item.upvotes, upvotedBy: [], comments: [], photos: [],
    timeline: [{ status: 'reported', time: '2026-03-10T08:00:00', note: 'Reported' }],
    assignedTo: item.status !== 'reported' ? 'BBMP Assigned Team' : null,
    createdAt: '2026-03-10T08:00:00', updatedAt: '2026-03-10T08:00:00', afterPhoto: null
  })))
];

export default mockIssues;
