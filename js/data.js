// ============================================================
// data.js — Mock Data Layer & localStorage Helpers
// ============================================================

const DEFAULT_USERS = [
  { id: 'u1', name: 'Admin User',      email: 'admin@college.edu',    password: 'admin123',    role: 'admin',   avatar: '' },
  { id: 'u2', name: 'Dr. Priya Sharma', email: 'priya@college.edu',   password: 'teacher123',  role: 'teacher', avatar: '', phone: '+91 9876543210', department: 'Computer Science' },
  { id: 'u3', name: 'Prof. Rahul Verma',email: 'rahul@college.edu',   password: 'teacher123',  role: 'teacher', avatar: '', phone: '+91 9876543211', department: 'Information Technology' },
  { id: 'u4', name: 'Ananya Singh',     email: 'ananya@college.edu',  password: 'student123',  role: 'student', avatar: '' },
  { id: 'u5', name: 'Rohan Mehta',      email: 'rohan@college.edu',   password: 'student123',  role: 'student', avatar: '' },
  { id: 'u6', name: 'Sneha Patel',      email: 'sneha@college.edu',   password: 'student123',  role: 'student', avatar: '' },
];



const DEFAULT_EVENTS = [
  {
    id: 'e1',
    title: 'AI & Machine Learning Summit',
    description: 'Explore the latest advances in artificial intelligence and machine learning. Industry experts share insights on neural networks, deep learning, and real-world AI applications transforming industries.',
    venue: 'LT-PCSA',
    floor: '1st Floor',
    date: '2026-03-20',
    time: '10:00 AM',
    image: 'images/event-ai.webp',
    speaker: 'Dr. Kavita Rao',
    speakerImg: '',
    speakerBio: 'AI Research Lead at TechNova Labs with 15+ years of experience in deep learning and NLP.',
    status: 'upcoming',
    category: 'Seminar',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e2',
    title: 'Hackathon: Code for Change',
    description: 'A 24-hour hackathon where teams build solutions for social impact. Prizes worth ₹2,00,000 for the winning teams. Open to all departments.',
    venue: 'VMCC',
    floor: 'Ground Floor',
    date: '2026-03-22',
    time: '09:00 AM',
    image: 'images/event-hackathon.webp',
    speaker: 'Arjun Kapoor',
    speakerImg: '',
    speakerBio: 'CTO of StartupHub India and serial hackathon mentor.',
    status: 'upcoming',
    category: 'Hackathon',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e3',
    title: 'Web3 & Blockchain Workshop',
    description: 'Hands-on workshop covering decentralized applications, smart contracts, and the future of blockchain technology in finance and beyond.',
    venue: 'LC 101',
    floor: '2nd Floor',
    date: '2026-03-25',
    time: '02:00 PM',
    image: 'images/event-blockchain.webp',
    speaker: 'Neha Gupta',
    speakerImg: '',
    speakerBio: 'Blockchain developer and Web3 evangelist at ChainSphere.',
    status: 'upcoming',
    category: 'Workshop',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e4',
    title: 'Startup Pitch Competition',
    description: 'Present your startup idea to a panel of venture capitalists and industry leaders. Get funding, mentorship, and the chance to launch your dream.',
    venue: 'OAT',
    floor: 'Ground Floor',
    date: '2026-03-28',
    time: '11:00 AM',
    image: 'images/event-startup.webp',
    speaker: 'Vikram Desai',
    speakerImg: '',
    speakerBio: 'Managing Partner at Velocity Ventures, backed 50+ startups.',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e5',
    title: 'Cybersecurity Masterclass',
    description: 'Learn ethical hacking, penetration testing, and cybersecurity best practices from industry professionals. Capture-the-flag challenge included!',
    venue: 'LC 102',
    floor: '2nd Floor',
    date: '2026-03-15',
    time: '03:00 PM',
    image: 'images/event-cyber.webp',
    speaker: 'Amit Joshi',
    speakerImg: '',
    speakerBio: 'Chief Security Officer at CyberShield and certified ethical hacker.',
    status: 'completed',
    category: 'Workshop',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e6',
    title: 'Design Thinking Bootcamp',
    description: 'Intensive bootcamp on human-centered design, prototyping, and innovation methodologies used by top product companies worldwide.',
    venue: 'LH 101',
    floor: '1st Floor',
    date: '2026-03-12',
    time: '10:00 AM',
    image: 'images/event-design.webp',
    speaker: 'Riya Menon',
    speakerImg: '',
    speakerBio: 'Head of Design at PixelCraft Studios, ex-Google UX researcher.',
    status: 'completed',
    category: 'Bootcamp',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e7',
    title: 'Cloud Computing Symposium',
    description: 'Deep dive into cloud architectures, serverless computing, and multi-cloud strategies with hands-on AWS and Azure labs.',
    venue: 'LT-PCSA',
    floor: '1st Floor',
    date: '2026-04-02',
    time: '09:30 AM',
    image: 'images/event-cloud.webp',
    speaker: 'Sanjay Kulkarni',
    speakerImg: '',
    speakerBio: 'Solutions Architect at AWS and cloud computing author.',
    status: 'upcoming',
    category: 'Seminar',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e8',
    title: 'Robotics & IoT Expo',
    description: 'Showcase of cutting-edge robotics projects and IoT innovations by students and industry partners. Live demos and competitions.',
    venue: 'VMCC',
    floor: 'Ground Floor',
    date: '2026-04-05',
    time: '10:00 AM',
    image: 'images/event-robotics.webp',
    speaker: 'Dr. Meera Iyer',
    speakerImg: '',
    speakerBio: 'Robotics researcher at IIT and founder of RoboGenesis.',
    status: 'upcoming',
    category: 'Expo',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  }
];

const DEFAULT_VENUES = [
  { id: 'v1', name: 'LT-PCSA',  building: 'Lecture Theatre Complex',    capacity: 500, icon: '🏛️' },
  { id: 'v2', name: 'LC 101',   building: 'Lecture Centre',             capacity: 200, icon: '📚' },
  { id: 'v3', name: 'LC 102',   building: 'Lecture Centre',             capacity: 200, icon: '📚' },
  { id: 'v4', name: 'LH 101',   building: 'Lecture Hall',               capacity: 150, icon: '🎓' },
  { id: 'v5', name: 'OAT',      building: 'Open Air Theatre',           capacity: 1000,icon: '🎭' },
  { id: 'v6', name: 'VMCC',     building: 'Victor Menezes Convention Centre', capacity: 800, icon: '🏢' },
];

const DEFAULT_REGISTRATIONS = [];

// ============================================================
// localStorage Helpers
// ============================================================

function seedData() {
  let usersStr = localStorage.getItem('cem_users');
  if (!usersStr || !usersStr.includes('department')) {
    localStorage.setItem('cem_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('cem_events')) {
    localStorage.setItem('cem_events', JSON.stringify(DEFAULT_EVENTS));
  }
  if (!localStorage.getItem('cem_venues')) {
    localStorage.setItem('cem_venues', JSON.stringify(DEFAULT_VENUES));
  }
  if (!localStorage.getItem('cem_registrations')) {
    localStorage.setItem('cem_registrations', JSON.stringify(DEFAULT_REGISTRATIONS));
  }
  if (!localStorage.getItem('cem_pending_teachers')) {
    localStorage.setItem('cem_pending_teachers', JSON.stringify([]));
  }
  if (!localStorage.getItem('cem_locations')) {
    localStorage.setItem('cem_locations', JSON.stringify([
      { id: 'loc1', event_id: 'e1', place: 'LT-PCSA', floor: '1st Floor' },
      { id: 'loc2', event_id: 'e2', place: 'Lab 4 – CS Block', floor: '2nd Floor' },
      { id: 'loc3', event_id: 'e3', place: 'Innovation Hub', floor: 'Ground Floor' },
      { id: 'loc4', event_id: 'e4', place: 'Seminar Hall – Main Block', floor: '3rd Floor' }
    ]));
  }
}

function getUsers()          { return JSON.parse(localStorage.getItem('cem_users') || '[]'); }
function getEvents()         { return JSON.parse(localStorage.getItem('cem_events') || '[]'); }
function getVenues()         { return JSON.parse(localStorage.getItem('cem_venues') || '[]'); }
function getRegistrations()  { return JSON.parse(localStorage.getItem('cem_registrations') || '[]'); }

function saveUsers(users)              { localStorage.setItem('cem_users', JSON.stringify(users)); }
function saveEvents(events)            { localStorage.setItem('cem_events', JSON.stringify(events)); }
function saveRegistrations(regs)       { localStorage.setItem('cem_registrations', JSON.stringify(regs)); }

function getPendingTeachers()           { return JSON.parse(localStorage.getItem('cem_pending_teachers') || '[]'); }
function savePendingTeachers(list)      { localStorage.setItem('cem_pending_teachers', JSON.stringify(list)); }

function getLocations()                 { return JSON.parse(localStorage.getItem('cem_locations') || '[]'); }
function saveLocations(locs)            { localStorage.setItem('cem_locations', JSON.stringify(locs)); }

function getNotices()                    { return JSON.parse(localStorage.getItem('cem_notices') || '[]'); }
function saveNotices(notices)            { localStorage.setItem('cem_notices', JSON.stringify(notices)); }

function getEventById(id)   { return getEvents().find(e => e.id === id); }
function getVenueByName(n)  { return getVenues().find(v => v.name === n); }

// Helper: get assigned teachers array (backward compat with old assignedTeacher field)
function getEventTeachers(ev) {
  if (ev.assignedTeachers && ev.assignedTeachers.length) return ev.assignedTeachers;
  if (ev.assignedTeacher) return [ev.assignedTeacher];
  return [];
}
function isTeacherAssigned(ev, email) {
  return getEventTeachers(ev).includes(email);
}

function generateId() { return 'e' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

// Automatic event status based on date + 6 PM cutoff
function getEventStatus(eventDate) {
  const now = new Date();
  const eventDay = new Date(eventDate);
  const completionTime = new Date(eventDay);
  completionTime.setHours(18, 0, 0, 0); // 6:00 PM
  return now >= completionTime ? 'completed' : 'upcoming';
}

// ---- Favorites (per-user) ----
function getFavorites(userId) {
  const all = JSON.parse(localStorage.getItem('cem_favorites') || '{}');
  return all[userId] || [];
}
function saveFavorites(userId, eventIds) {
  const all = JSON.parse(localStorage.getItem('cem_favorites') || '{}');
  all[userId] = eventIds;
  localStorage.setItem('cem_favorites', JSON.stringify(all));
}
function toggleFavorite(userId, eventId) {
  const favs = getFavorites(userId);
  const idx = favs.indexOf(eventId);
  if (idx === -1) { favs.push(eventId); } else { favs.splice(idx, 1); }
  saveFavorites(userId, favs);
  return idx === -1; // true = added, false = removed
}
function isFavorite(userId, eventId) {
  return getFavorites(userId).includes(eventId);
}

// Initialize data on load
seedData();
