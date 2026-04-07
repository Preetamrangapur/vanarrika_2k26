// ============================================================
// event-detail.js — Event Detail Page Logic
// ============================================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');
  const user = getCurrentUser();
  const ev = getEventById(eventId);

  function goToDashboard() {
    if (user && user.role) {
      redirectToDashboard(user.role);
    } else {
      window.location.href = 'login.html';
    }
  }

  window.goToDashboard = goToDashboard;

  if (!ev) {
    document.getElementById('eventContent').innerHTML = `
      <div class="container page">
        <div class="empty-state" style="padding-top: 100px;">
          <div class="empty-state__icon">😕</div>
          <p class="empty-state__text">Event not found</p>
          <button onclick="goToDashboard()" class="btn btn-primary mt-20">Go Home</button>
        </div>
      </div>
    `;
    return;
  }

  const regs = getRegistrations();
  const isRegistered = user ? regs.some(r => r.eventId === ev.id && r.userId === user.id) : false;

  // Find all assigned teachers from users list
  const allUsers = getUsers();
  const teacherEmails = getEventTeachers(ev);
  const assignedTeachers = teacherEmails.map(email =>
    allUsers.find(u => u.email === email && u.role === 'teacher')
  ).filter(Boolean);

  document.title = `${ev.title} — RANGOTSAVA`;

  // Build Teacher Information section (supports multiple teachers)
  let teacherInfoHtml = '';
  if (assignedTeachers.length) {
    teacherInfoHtml = `
      <h3 class="mb-8">👨‍🏫 Faculty Coordinator(s) (${assignedTeachers.length})</h3>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
        ${assignedTeachers.map(t => {
          const initial = t.name.charAt(0).toUpperCase();
          return `
            <div class="event-detail__speaker">
              <div class="event-detail__speaker-avatar" style="background: linear-gradient(135deg, #00C9A7, #00b894);">${initial}</div>
              <div class="event-detail__speaker-info">
                <h4>${t.name}</h4>
                ${t.phone ? `<p>📞 ${t.phone}</p>` : ''}
                ${t.department ? `<p>🏢 ${t.department}</p>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Build Student Coordinators section (from event data)
  const coords = ev.coordinators || [];
  let coordHtml = '';
  if (coords.length) {
    coordHtml = `
      <h3 class="mb-8">👥 Student Coordinators</h3>
      <div class="coordinator-cards mb-20">
        ${coords.map((c, i) => `
          <div class="coordinator-card glass-card">
            <div class="coordinator-card__badge">Coordinator ${i + 1}</div>
            <div class="coordinator-card__name">${c.name || '—'}</div>
            <div class="coordinator-card__phone">📞 ${c.phone || '—'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  document.getElementById('eventContent').innerHTML = `
    <!-- Hero -->
    <div class="event-detail__hero">
      <img src="${ev.image}" alt="${ev.title}" onerror="this.outerHTML='<div class=\\'img-placeholder\\' style=\\'height:240px\\'>🎪</div>'">
      <div class="event-detail__hero-overlay"></div>
      <a href="javascript:void(0)" onclick="goToDashboard()" class="event-detail__back btn btn-icon btn-ghost">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </a>
    </div>

    <!-- Content -->
    <div class="event-detail__content container">
      <div class="flex items-center gap-8 mb-12">
        ${getStatusBadge(getEventStatus(ev.date))}
        ${user && user.role === 'student' ? `
          <button id="favBtn" class="btn btn-ghost btn-sm" onclick="toggleFavDetail()" style="margin-left:auto; font-size:1.3rem; color:${isFavorite(user.id, ev.id) ? '#FFD700' : 'var(--text-secondary)'};">
            ${isFavorite(user.id, ev.id) ? '★ Favorited' : '☆ Favorite'}
          </button>
        ` : ''}
      </div>

      <h1 class="event-detail__title">${ev.title}</h1>

      <div class="event-detail__info">
        <div class="event-detail__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${ev.venue}${ev.floor ? ' · 🏢 ' + ev.floor : ''}</span>
        </div>
        <div class="event-detail__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${formatDate(ev.date)}</span>
        </div>
        <div class="event-detail__info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${ev.time}</span>
        </div>
      </div>

      <h3 class="mb-8">About This Event</h3>
      <p class="event-detail__description">${ev.description}</p>

      ${ev.instructions ? `
        <h3 class="mb-8">📋 Instructions</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px;">${ev.instructions}</p>
      ` : ''}

      <!-- Teacher Information -->
      ${teacherInfoHtml}

      <!-- Student Coordinators -->
      ${coordHtml}

      <!-- Actions -->
      <div class="event-detail__actions">
        ${user ? `
          ${user.role === 'student' ? `
            ${ev.event_registration_link
              ? `<button class="btn btn-primary btn-block" onclick="openRegistrationLink()">🎟️ Register Event</button>`
              : getEventStatus(ev.date) === 'upcoming'
                ? `<button class="btn btn-ghost btn-block" disabled>Registration not available</button>`
                : `<button class="btn btn-ghost btn-block" disabled>Event Completed</button>`
            }
            ${isFavorite(user.id, ev.id) ? `<button id="favBtn" class="btn btn-outline btn-block" onclick="toggleFavDetail()">★ Remove Favorite</button>` : `<button id="favBtn" class="btn btn-ghost btn-block" onclick="toggleFavDetail()">☆ Add Favorite</button>`}
          ` : `
            <button class="btn btn-primary btn-block" onclick="goToDashboard()">⚙️ Manage Event</button>
          `}
        ` : `
          <a href="login.html" class="btn btn-primary btn-block">Login to Register</a>
        `}
        <button class="btn btn-outline" onclick="notifyMe()">🔔 Notify Me</button>
      </div>
    </div>
  `;

  window.openRegistrationLink = function () {
    if (ev.event_registration_link) {
      window.open(ev.event_registration_link, '_blank');
    }
  };

  window.toggleFavDetail = function () {
    if (!user || user.role !== 'student') return;
    const added = toggleFavorite(user.id, ev.id);
    const btn = document.getElementById('favBtn');
    if (btn) {
      btn.style.color = added ? '#FFD700' : 'var(--text-secondary)';
      btn.innerHTML = added ? '★ Favorited' : '☆ Favorite';
    }
    showToast(added ? 'Added to favorites ⭐' : 'Removed from favorites', added ? 'success' : 'info');
  };

  window.notifyMe = function () {
    showToast('You will be notified about this event! 🔔', 'info');
  };

  window.goToDashboard = goToDashboard;
  injectBottomNav('');
})();
