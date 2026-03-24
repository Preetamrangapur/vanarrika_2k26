// ============================================================
// nav.js — Bottom Navigation Bar Component
// ============================================================

function injectBottomNav(activePage) {
  const user = getCurrentUser();
  const role = user ? user.role : 'guest';

  // Decide "Network" link based on role
  let networkHref = 'student.html';
  let networkLabel = 'Dashboard';
  if (role === 'admin')   networkHref = 'admin.html';
  if (role === 'teacher') networkHref = 'teacher.html';

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <a href="index.html" class="bottom-nav__item ${activePage === 'home' ? 'active' : ''}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </a>
    <a href="${networkHref}" class="bottom-nav__item ${activePage === 'network' ? 'active' : ''}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span>${networkLabel}</span>
    </a>
    <a href="venues.html" class="bottom-nav__item ${activePage === 'maps' ? 'active' : ''}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>Maps</span>
    </a>
    <a href="gallery.html" class="bottom-nav__item ${activePage === 'gallery' ? 'active' : ''}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>Gallery</span>
    </a>
    <a href="profile.html" class="bottom-nav__item ${activePage === 'more' ? 'active' : ''}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      <span>More</span>
    </a>
  `;
  document.body.appendChild(nav);
}

// Toast notification helper
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="toast__close">&times;</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Modal helper
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
    </div>
  `;
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

// Format date helper
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

// Shared notice banner renderer — call from any page
function renderNotices(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const notices = getNotices().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!notices.length) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="notice-banner">
      <div class="notice-banner__header">
        <span>📢 Immediate Notices</span>
        <span class="notice-banner__count">${notices.length}</span>
      </div>
      ${notices.map(n => `
        <div class="notice-card">
          <div class="notice-card__title">${n.title}</div>
          <div class="notice-card__msg">${n.message}</div>
          <div class="notice-card__date">${n.date}</div>
        </div>
      `).join('')}
    </div>
  `;
}
