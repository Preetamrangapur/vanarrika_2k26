// ============================================================
// dashboard-nav.js — Sidebar, Navbar, Dark/Light, Section Nav
// ============================================================

// --- Theme ---
function initTheme() {
  const saved = localStorage.getItem('cem_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cem_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  btn.innerHTML = theme === 'dark'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// --- Sidebar toggle ---
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}
function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

// --- Section switching (SPA) ---
function switchSection(sectionId) {
  document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  // Update sidebar active
  document.querySelectorAll('.sidebar__item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });
  closeSidebar();
}

// --- Profile dropdown ---
function toggleProfileDropdown() {
  const dd = document.getElementById('profileDropdown');
  if (dd) dd.classList.toggle('show');
}
// Close on outside click
document.addEventListener('click', (e) => {
  const dd = document.getElementById('profileDropdown');
  if (dd && !e.target.closest('.navbar__profile')) {
    dd.classList.remove('show');
  }
});

// --- Toast ---
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="toast__close">&times;</button>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// --- Modal ---
function showModal(title, bodyHTML, footerHTML = '') {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3>${title}</h3>
        <button class="modal__close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal__body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal__footer">${footerHTML}</div>` : ''}
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
}

// --- Event Detail Modal (hero banner style, no header) ---
function showEventDetailModal(title, bodyHTML) {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal event-detail-modal">
      <button class="event-detail-modal__close" onclick="closeModal()">&times;</button>
      <div class="modal__body" style="padding:0">${bodyHTML}</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}

// --- Helpers ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function getStatusBadge(status) {
  if (status === 'upcoming') return '<span class="badge badge--upcoming">Upcoming</span>';
  if (status === 'completed') return '<span class="badge badge--completed">Completed</span>';
  if (status === 'live') return '<span class="badge badge--live">🔴 Live</span>';
  return '<span class="badge">' + status + '</span>';
}
function renderNotices(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const notices = getNotices().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!notices.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📢</div><p class="empty-state__text">No notices yet</p></div>'; return; }
  el.innerHTML = notices.map(n => `
    <div class="notice-card">
      <div class="notice-card__title">${n.title}</div>
      <div class="notice-card__msg">${n.message}</div>
      <div class="notice-card__date">${n.date}</div>
    </div>
  `).join('');
}

// --- Gallery Image Data ---
const galleryImages = [
  { src: 'images/gallery/gallery-13.png' },
  { src: 'images/gallery/gallery-14.png' },
  { src: 'images/gallery/gallery-15.png' },
  { src: 'images/gallery/gallery-16.png' },
  { src: 'images/gallery/gallery-17.png' },
  { src: 'images/gallery/gallery-18.png' },
  { src: 'images/gallery/gallery-19.png' },
  { src: 'images/gallery/gallery-20.png' },
  { src: 'images/gallery/gallery-21.png' },
  { src: 'images/gallery/gallery-22.png' },
  { src: 'images/gallery/gallery-23.png' },
  { src: 'images/gallery/gallery-24.png' },
  { src: 'images/gallery/gallery-25.png' },
  { src: 'images/gallery/gallery-26.png' },
  { src: 'images/gallery/gallery-27.png' },
  { src: 'images/gallery/gallery-28.png' },
  { src: 'images/gallery/gallery-29.png' },
  { src: 'images/gallery/gallery-30.png' },
];

// --- Featured Event Slider ---
let _sliderInterval = null;
let _sliderIdx = 0;
function renderFeaturedSlider(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const events = getEvents();
  const upcoming = events.filter(e => getEventStatus(e.date) === 'upcoming');
  if (!upcoming.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📅</div><p class="empty-state__text">No upcoming events</p></div>'; return; }
  _sliderIdx = 0;
  el.innerHTML = `
    <div class="featured-slider">
      <div class="featured-slider__track" id="sliderTrack">
        ${upcoming.map(ev => `
          <div class="featured-slide" onclick="openEventDetailModal('${ev.id}')" style="cursor:pointer">
            <img src="${ev.image}" alt="${ev.title}" onerror="this.outerHTML='<div class=\\'featured-slide__placeholder\\'>🎪</div>'">
            <div class="featured-slide__overlay">
              <h3>${ev.title}</h3>
              <p>📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="slider-dots" id="sliderDots">
      ${upcoming.map((_, i) => `<button class="slider-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"></button>`).join('')}
    </div>`;
  if (_sliderInterval) clearInterval(_sliderInterval);
  _sliderInterval = setInterval(() => goToSlide((_sliderIdx + 1) % upcoming.length), 4000);
}
window.goToSlide = function (idx) {
  const track = document.getElementById('sliderTrack');
  const dots = document.querySelectorAll('#sliderDots .slider-dot');
  if (!track) return;
  _sliderIdx = idx;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
};

// --- Shared Event Detail Modal (used by scroll cards in all dashboards) ---
function openEventDetailModal(id) {
  const ev = getEventById(id);
  if (!ev) return;
  const allUsers = getUsers();
  const teacherEmails = getEventTeachers(ev);
  const teacherDetails = teacherEmails.map(email => {
    const t = allUsers.find(u => u.email === email && u.role === 'teacher');
    return t || { name: email, email: email, phone: '', department: '' };
  });
  const evStatus = getEventStatus(ev.date);

  showModal(ev.title, `
    <div class="mb-12">${getStatusBadge(evStatus)}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
      <div class="flex items-center gap-8 text-sm">📍 ${ev.venue}</div>
      <div class="flex items-center gap-8 text-sm">🏢 ${ev.floor || 'N/A'}</div>
      <div class="flex items-center gap-8 text-sm">📅 ${formatDate(ev.date)} · ${ev.time}</div>
    </div>
    <h4 style="margin-bottom:6px">About this Event</h4>
    <p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.description}</p>
    ${ev.instructions ? `<h4 style="margin-bottom:6px">📋 Instructions</h4><p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.instructions}</p>` : ''}
    <h4 style="margin-bottom:10px">👨‍🏫 Faculty Coordinator</h4>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
      ${teacherDetails.length ? teacherDetails.map(t => `
        <div class="glass-card" style="padding:14px;border:1px solid var(--border)">
          <div style="font-weight:600">${t.name}</div>
          <div class="text-sm text-muted">${t.department ? '🏢 ' + t.department : ''}</div>
          <div class="text-sm text-muted">${t.phone ? '📞 ' + t.phone : ''}</div>
        </div>
      `).join('') : '<p class="text-sm text-muted">No teachers assigned</p>'}
    </div>
    ${(ev.coordinators && ev.coordinators.length) ? `
      <h4 style="margin-bottom:10px">👥 Student Coordinators</h4>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
        ${ev.coordinators.map((c, i) => `
          <div class="glass-card" style="padding:14px;border:1px solid var(--border)">
            <div style="font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--accent);margin-bottom:4px">Coordinator ${i + 1}</div>
            <div style="font-weight:600">${c.name || '—'}</div>
            <div class="text-sm text-muted">📞 ${c.phone || '—'}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    ${(() => {
      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      return (user && user.role === 'student' && ev.event_registration_link) ? `<button class="btn btn-primary btn-block" onclick="window.open('${ev.event_registration_link}','_blank')">📝 Register Now</button>` : '';
    })()}
  `);
}

// --- Upcoming / Completed Events (horizontal scroll) ---
function renderScrollEvents(containerId, events, onClickFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!events.length) { el.innerHTML = '<p class="text-sm text-muted" style="padding:8px">No events</p>'; return; }
  const handler = onClickFn || 'openEventDetailModal';
  el.innerHTML = events.map(ev => `
    <div class="scroll-card" onclick="${handler}('${ev.id}')">
      <img src="${ev.image}" alt="${ev.title}" class="scroll-card__img" onerror="this.outerHTML='<div class=\\'scroll-card__img featured-slide__placeholder\\'>🎪</div>'">
      <div class="scroll-card__body">
        <div class="scroll-card__title">${ev.title}</div>
        <div class="scroll-card__meta">📍 ${ev.venue} · 📅 ${formatDate(ev.date)}</div>
      </div>
    </div>
  `).join('');
}

// --- Gallery Photo Slider ---
let _gallerySliderInterval = null;
let _gallerySliderIdx = 0;

// --- Gallery Grid + Lightbox ---
let _lightboxIdx = 0;
function renderGallery(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // Pick all images for the slider
  const sliderPhotos = galleryImages;

  el.innerHTML = `
    <div class="gallery-slider-wrapper mb-20">
      <div class="featured-slider gallery-photo-slider">
        <div class="featured-slider__track" id="gallerySliderTrack">
          ${sliderPhotos.map((img, i) => `
            <div class="featured-slide" onclick="openLightbox(${i})" style="cursor:pointer">
              <img src="${img.src}" alt="Photo ${i + 1}" onerror="this.outerHTML='<div class=\\'featured-slide__placeholder\\'>📷</div>'">
            </div>
          `).join('')}
        </div>
      </div>
      <div class="slider-dots" id="gallerySliderDots">
        ${sliderPhotos.map((_, i) => `<button class="slider-dot${i === 0 ? ' active' : ''}" onclick="goToGallerySlide(${i})"></button>`).join('')}
      </div>
    </div>
    <div class="section-title">📸 All Photos</div>
    <div class="gallery-grid">
      ${galleryImages.map((img, i) => `
        <div class="gallery-item" onclick="openLightbox(${i})">
          <img src="${img.src}" alt="Photo ${i + 1}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'gallery-item__placeholder\\'>📷<span></span></div>'">
          <div class="gallery-item__overlay"></div>
        </div>
      `).join('')}
    </div>
    <div class="lightbox" id="lightbox">
      <button class="lightbox__close" onclick="closeLightbox()">&times;</button>
      <button class="lightbox__prev" onclick="prevImage()">‹</button>
      <img class="lightbox__img" id="lightboxImg" src="" alt="">
      <button class="lightbox__next" onclick="nextImage()">›</button>
      <div class="lightbox__caption" id="lightboxCaption"></div>
    </div>`;

  // Start gallery slider autoplay
  if (_gallerySliderInterval) clearInterval(_gallerySliderInterval);
  _gallerySliderIdx = 0;
  _gallerySliderInterval = setInterval(() => goToGallerySlide((_gallerySliderIdx + 1) % sliderPhotos.length), 3500);
}
window.goToGallerySlide = function (idx) {
  const track = document.getElementById('gallerySliderTrack');
  const dots = document.querySelectorAll('#gallerySliderDots .slider-dot');
  if (!track) return;
  _gallerySliderIdx = idx;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
};
window.openLightbox = function (idx) {
  _lightboxIdx = idx;
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = galleryImages[idx].src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};
window.closeLightbox = function () {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
};
window.nextImage = function () { _lightboxIdx = (_lightboxIdx + 1) % galleryImages.length; openLightbox(_lightboxIdx); };
window.prevImage = function () { _lightboxIdx = (_lightboxIdx - 1 + galleryImages.length) % galleryImages.length; openLightbox(_lightboxIdx); };
document.addEventListener('keydown', function (e) {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});

// --- Maps / Locations ---
function renderMapsGrid(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const events = getEvents();
  if (!events.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📍</div><p class="empty-state__text">No event locations</p></div>'; return; }
  el.innerHTML = `<div class="loc-grid">${events.map(ev => `
    <div class="loc-card">
      <div class="loc-card__icon">🏢</div>
      <div class="loc-card__place">${ev.venue || 'No Location'}</div>
      <div class="loc-card__event">${ev.title}</div>
      <div class="loc-card__details">
        <div class="loc-card__detail"><span class="loc-card__label">Floor</span><span class="loc-card__value">${ev.floor || '—'}</span></div>
        <div class="loc-card__detail"><span class="loc-card__label">Date</span><span class="loc-card__value">${formatDate(ev.date)}</span></div>
        <div class="loc-card__detail"><span class="loc-card__label">Time</span><span class="loc-card__value">${ev.time}</span></div>
      </div>
    </div>
  `).join('')}</div>`;
}

// --- Settings: apply theme from settings page ---
window.applySettingsTheme = function (theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cem_theme', theme);
  updateThemeIcon(theme);
  showToast(theme === 'dark' ? '🌙 Dark mode activated' : '☀️ Light mode activated');
};

// --- Navigate to full event page (for admin/teacher) ---
window.openEvent = function (id) {
  window.location.href = 'event.html?id=' + encodeURIComponent(id);
};

// ===== SHARED EVENT MODAL (Role-aware) - Replaces openEventDetailModal =====
window.openEventModal = function (id) {
  const ev = getEventById(id);
  if (!ev) { showToast('Event not found', 'error'); return; }

  const user = getCurrentUser();
  if (!user) { showToast('Please login', 'error'); return; }

  const allUsers = getUsers();
  const teacherEmails = getEventTeachers(ev);
  const teacherDetails = teacherEmails.map(email => {
    const t = allUsers.find(u => u.email === email && u.role === 'teacher');
    return t || { name: email };
  });

  const coords = ev.coordinators || [];
  const evStatus = getEventStatus(ev.date);

  let actionButtons = '';

  // Role-specific actions
  if (user.role === 'admin') {
    actionButtons = `
      <div class="event-modal-actions">
        <button class="btn btn-primary btn-sm" onclick="closeModal(); openEditEvent('${id}')">✏️ Edit Event</button>
        <button class="btn btn-danger btn-sm" onclick="closeModal(); deleteEvent('${id}')">🗑️ Delete</button>
        <button class="btn btn-ghost btn-sm" onclick="closeModal(); openCreateEvent()">➕ New Event</button>
      </div>`;
  } else if (user.role === 'teacher') {
    if (isTeacherAssigned(ev, user.email)) {
      actionButtons = `
        <div class="event-modal-actions">
          <button class="btn btn-primary btn-sm" onclick="closeModal(); openEditEventTeacher('${id}')">✏️ Edit</button>
          <button class="btn btn-outline btn-sm" onclick="closeModal(); openManageCoordinators('${id}')">👥 Coordinators</button>
          ${ev.student_sheet_link ? `<button class="btn btn-ghost btn-sm" onclick="window.open('${ev.student_sheet_link}', '_blank')">📄 Students</button>` : ''}
        </div>`;
    } else {
      actionButtons = '<p class="text-sm text-muted">Not assigned to this event</p>';
    }
  } else if (user.role === 'student') {
    const isFav = isFavorite(user.id, ev.id);
    actionButtons = `
      <div class="event-modal-actions">
        ${ev.event_registration_link ? `<button class="btn btn-primary btn-sm" onclick="window.open('${ev.event_registration_link}', '_blank')">🎟️ Register</button>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="toggleFavorite('${user.id}', '${id}'); closeModal()" style="font-size:1.2rem; color:${isFav ? '#FFD700' : ''}">
          ${isFav ? '★ Remove Favorite' : '☆ Add Favorite'}
        </button>
      </div>`;
  }

  showModal(ev.title, `
    <div class="mb-12">${getStatusBadge(evStatus)}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;font-size:.95rem">
      <div><strong>📍 Location:</strong> ${ev.venue}${ev.floor ? ' · 🏢 ' + ev.floor : ''}</div>
      <div><strong>📅 When:</strong> ${formatDate(ev.date)} · ${ev.time}</div>

    </div>
    <h4 style="margin-bottom:6px">About</h4>
    <p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.description}</p>
    ${ev.instructions ? `<h4 style="margin-bottom:6px">📋 Instructions</h4><p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.instructions}</p>` : ''}
    
    ${teacherDetails.length ? `
      <h4 style="margin-bottom:10px">👨‍🏫 Faculty Coordinator (${teacherDetails.length})</h4>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${teacherDetails.map((t, i) => `
          <div class="glass-card" style="padding:12px;font-size:.9rem">
            <div style="font-size:.7rem;font-weight:600;color:var(--accent);">Faculty ${i + 1}</div>
            <div style="font-weight:600">${t.name || '—'}</div>
            <div class="text-muted" style="margin-bottom:2px">${t.phone || '—'}</div>
            <div class="text-muted">${t.department ? t.department : ''}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${coords.length ? `
      <h4 style="margin-bottom:10px">👥 Coordinators (${coords.length})</h4>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${coords.map((c, i) => `
          <div class="glass-card" style="padding:12px;font-size:.9rem">
            <div style="font-size:.7rem;font-weight:600;color:var(--accent);">Coord ${i + 1}</div>
            <div style="font-weight:600">${c.name || '—'}</div>
            <div class="text-muted">${c.phone || '—'}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${actionButtons}
  `);
};

// --- Init on load ---
initTheme();
