// ============================================================
// data.js — Mock Data Layer & localStorage Helpers
// ============================================================

const DEFAULT_USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@college.edu', password: 'admin123', role: 'admin', avatar: '' },
  { id: 'u2', name: 'Dr. Priya Sharma', email: 'priya@college.edu', password: 'teacher123', role: 'teacher', avatar: '', phone: '+91 9876543210', department: 'Computer Science' },
  { id: 'u3', name: 'Prof. Rahul Verma', email: 'rahul@college.edu', password: 'teacher123', role: 'teacher', avatar: '', phone: '+91 9876543211', department: 'Information Technology' },
  { id: 'u4', name: 'Ananya Singh', email: 'ananya@college.edu', password: 'student123', role: 'student', avatar: '' },
  { id: 'u5', name: 'Rohan Mehta', email: 'rohan@college.edu', password: 'student123', role: 'student', avatar: '' },
  { id: 'u6', name: 'Sneha Patel', email: 'sneha@college.edu', password: 'student123', role: 'student', avatar: '' },
];



const DEFAULT_EVENTS = [
  {
    id: 'e9',
    title: 'Lengacy Lekhan (Essay Writing)',
    description: 'Showcase your writing skills in our annual essay writing competition. Express your thoughts, structure your arguments, and win exciting prizes!',
    venue: 'LC 101',
    floor: '2nd Floor',
    date: '2026-04-10',
    time: '11:00 AM',
    image: 'images/event-essay.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e10',
    title: 'Chitron (Drawing)',
    description: 'Let your imagination flow on the canvas in the Chitron Drawing contest. Use any medium to capture your creativity and win exciting prizes!',
    venue: 'LH 101',
    floor: '1st Floor',
    date: '2026-04-11',
    time: '02:00 PM',
    image: 'images/event-drawing.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e11',
    title: 'Henora (Mehendi)',
    description: 'Showcase your intricate mehendi designs in the Henora Mehendi competition. Bring your creativity and adorn hands with beautiful, traditional, and contemporary patterns.',
    venue: 'OAT',
    floor: 'Ground Floor',
    date: '2026-04-12',
    time: '10:00 AM',
    image: 'images/event-mehendi.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e12',
    title: 'AlgoCrown (Coding)',
    description: 'Battle it out in AlgoCrown, the ultimate coding competition. Solve complex algorithmic challenges, optimize your logic, and claim the coding crown!',
    venue: 'LC 102',
    floor: '2nd Floor',
    date: '2026-04-15',
    time: '09:00 AM',
    image: 'images/event-coding.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e13',
    title: 'Rang Gala (Rangoli)',
    description: 'Bring colors to life in the Rang Gala competition! Show off your artistic skills with vibrant rangoli designs. A festival of colors, creativity, and culture.',
    venue: 'VMCC',
    floor: 'Ground Floor',
    date: '2026-04-18',
    time: '09:00 AM',
    image: 'images/event-rangoli.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e14',
    title: 'Kala Capture (Photography)',
    description: 'Capture the essence of life and culture through your lens in the Kala Capture contest! Show us your best perspective and tell a story without words.',
    venue: 'OAT',
    floor: 'Ground Floor',
    date: '2026-04-20',
    time: '11:00 AM',
    image: 'images/event-photography.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e15',
    title: 'Matki Mystique (Pot Painting)',
    description: 'Breathe new life into earthenware in the Matki Mystique pot painting competition. Unleash your creativity, blend colors, and create traditional or contemporary masterpieces.',
    venue: 'LH 101',
    floor: '1st Floor',
    date: '2026-04-22',
    time: '12:00 PM',
    image: 'images/event-potpainting.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e16',
    title: 'Chitra Mukhi (Face Painting)',
    description: 'Transform faces into living canvases! Join the Chitra Mukhi face painting competition to showcase your blend of vibrant colors, storytelling, and artistic flair.',
    venue: 'OAT',
    floor: 'Ground Floor',
    date: '2026-04-24',
    time: '02:30 PM',
    image: 'images/event-facepainting.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
  {
    id: 'e17',
    title: 'Chromatic Dots (Spot Painting)',
    description: 'Showcase your creativity using vibrant colors and techniques in the Chromatic Dots spot painting competition. Turn a blank canvas into a masterpiece of color and pattern!',
    venue: 'LH 101',
    floor: '1st Floor',
    date: '2026-04-25',
    time: '10:00 AM',
    image: 'images/event-spotpainting.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'priya@college.edu',
    assignedTeachers: ['priya@college.edu'],
    coordinators: [],
    featured: false
  },
  {
    id: 'e18',
    title: 'Crafted Chaos (Collage)',
    description: 'Assemble your imagination in the Crafted Chaos collage competition. Combine different textures, colors, and media to tell a compelling story through your art!',
    venue: 'LH 101',
    floor: '1st Floor',
    date: '2026-04-26',
    time: '11:00 AM',
    image: 'images/event-collage.png',
    speaker: '',
    speakerImg: '',
    speakerBio: '',
    status: 'upcoming',
    category: 'Competition',
    assignedTeacher: 'rahul@college.edu',
    assignedTeachers: ['rahul@college.edu'],
    coordinators: [],
    featured: true
  },
];

const DEFAULT_VENUES = [
  { id: 'v1', name: 'LT-PCSA', building: 'Lecture Theatre Complex', capacity: 500, icon: '🏛️' },
  { id: 'v2', name: 'LC 101', building: 'Lecture Centre', capacity: 200, icon: '📚' },
  { id: 'v3', name: 'LC 102', building: 'Lecture Centre', capacity: 200, icon: '📚' },
  { id: 'v4', name: 'LH 101', building: 'Lecture Hall', capacity: 150, icon: '🎓' },
  { id: 'v5', name: 'OAT', building: 'Open Air Theatre', capacity: 1000, icon: '🎭' },
  { id: 'v6', name: 'VMCC', building: 'Victor Menezes Convention Centre', capacity: 800, icon: '🏢' },
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
  const existingEventsStr = localStorage.getItem('cem_events');
  if (!existingEventsStr) {
    localStorage.setItem('cem_events', JSON.stringify(DEFAULT_EVENTS));
  } else {
    const existingEvents = JSON.parse(existingEventsStr);
    let updated = false;

    // Purge old mock events e1-e8 and deleted events e19-e28
    const oldIds = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
                    'e19', 'e20', 'e21', 'e22', 'e23', 'e24', 'e25', 'e26', 'e27', 'e28'];
    const originalLength = existingEvents.length;
    const filteredEvents = existingEvents.filter(e => !oldIds.includes(e.id));
    if (filteredEvents.length !== originalLength) {
      existingEvents.length = 0;
      existingEvents.push(...filteredEvents);
      updated = true;
    }

    DEFAULT_EVENTS.forEach(defaultEv => {
      if (!existingEvents.find(e => e.id === defaultEv.id)) {
        existingEvents.push(defaultEv);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('cem_events', JSON.stringify(existingEvents));
    }
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

function getUsers() { return JSON.parse(localStorage.getItem('cem_users') || '[]'); }
function getEvents() { return JSON.parse(localStorage.getItem('cem_events') || '[]'); }
function getVenues() { return JSON.parse(localStorage.getItem('cem_venues') || '[]'); }
function getRegistrations() { return JSON.parse(localStorage.getItem('cem_registrations') || '[]'); }

function saveUsers(users) { localStorage.setItem('cem_users', JSON.stringify(users)); }
function saveEvents(events) { localStorage.setItem('cem_events', JSON.stringify(events)); }
function saveRegistrations(regs) { localStorage.setItem('cem_registrations', JSON.stringify(regs)); }

function getPendingTeachers() { return JSON.parse(localStorage.getItem('cem_pending_teachers') || '[]'); }
function savePendingTeachers(list) { localStorage.setItem('cem_pending_teachers', JSON.stringify(list)); }

function getLocations() { return JSON.parse(localStorage.getItem('cem_locations') || '[]'); }
function saveLocations(locs) { localStorage.setItem('cem_locations', JSON.stringify(locs)); }

function getNotices() { return JSON.parse(localStorage.getItem('cem_notices') || '[]'); }
function saveNotices(notices) { localStorage.setItem('cem_notices', JSON.stringify(notices)); }

function getEventById(id) { return getEvents().find(e => e.id === id); }
function getVenueByName(n) { return getVenues().find(v => v.name === n); }

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
