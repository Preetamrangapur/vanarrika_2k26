// ============================================================
// student.js — Student Dashboard Logic (SaaS Layout)
// ============================================================

(function () {
  const user = requireAuth(['student']);
  if (!user) return;

  // Set user info
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.textContent = user.name.charAt(0);
  document.getElementById('ddName').textContent = user.name;
  document.getElementById('ddEmail').textContent = user.email;
  document.getElementById('studentGreeting').textContent = `Welcome back, ${user.name.split(' ')[0]} 👋`;

  // --- Section switching for student (sidebar + bottom nav) ---
  window.switchStudentSection = function (sectionId) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    // Update sidebar active
    document.querySelectorAll('.sidebar__item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });
    // Update bottom nav active
    document.querySelectorAll('.student-bottom-nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });
    closeSidebar();
    // Render section content on switch
    if (sectionId === 'sec-home') renderHome();
    if (sectionId === 'sec-favorites') renderFavorites();
    if (sectionId === 'sec-maps') renderMapsGrid('mapsContainer');
    if (sectionId === 'sec-gallery') renderGallery('galleryContainer');
    if (sectionId === 'sec-profile') renderProfile();
  };

  // ===== HOME =====
  window.renderHome = function () {
    const events = getEvents();

    // Featured slider
    renderFeaturedSlider('featuredSliderContainer');

    // Upcoming & Completed scroll rows (same as admin)
    const upcoming = events.filter(e => getEventStatus(e.date) === 'upcoming');
    const completed = events.filter(e => getEventStatus(e.date) === 'completed');
    renderScrollEvents('upcomingScroll', upcoming, 'openStudentEventDetail');
    renderScrollEvents('completedScroll', completed, 'openStudentEventDetail');

    // Notices banner
    const notices = getNotices().sort((a, b) => new Date(b.date) - new Date(a.date));
    const bannerEl = document.getElementById('noticesBannerHome');
    if (bannerEl && notices.length) {
      bannerEl.innerHTML = `
        <div class="panel" style="border-left:3px solid var(--warning)">
          <div class="panel__header"><div class="panel__title">📢 Notices</div></div>
          <div class="panel__body" style="padding:12px 22px">
            ${notices.slice(0, 3).map(n => `
              <div style="margin-bottom:10px">
                <div style="font-weight:600;font-size:.9rem">${n.title}</div>
                <div class="text-sm text-muted">${n.message}</div>
                <div class="text-xs text-muted mt-8">${n.date}</div>
              </div>
            `).join('')}
          </div>
        </div>`;
    } else if (bannerEl) {
      bannerEl.innerHTML = '';
    }
  };

  // ===== EVENT DETAIL =====
  window.openStudentEventDetail = function (id) {
    const ev = getEventById(id);
    if (!ev) return;
    const allUsers = getUsers();
    const teacherEmails = getEventTeachers(ev);
    const teacherDetails = teacherEmails.map(email => {
      const t = allUsers.find(u => u.email === email && u.role === 'teacher');
      return t || { name: email, email: email, phone: '', department: '' };
    });
    const fav = isFavorite(user.id, ev.id);

    showModal(ev.title, `
      <div class="mb-12">${getStatusBadge(getEventStatus(ev.date))}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        <div class="flex items-center gap-8 text-sm">📍 ${ev.venue}</div>
        <div class="flex items-center gap-8 text-sm">🏢 ${ev.floor || 'N/A'}</div>
        <div class="flex items-center gap-8 text-sm">📅 ${formatDate(ev.date)} · ${ev.time}</div>
      </div>
      <h4 style="margin-bottom:6px">About this Event</h4>
      <p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.description}</p>
      ${ev.instructions ? `<h4 style="margin-bottom:6px">📋 Instructions</h4><p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.instructions}</p>` : ''}
      <h4 style="margin-bottom:10px">👨‍🏫 Teachers</h4>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
        ${teacherDetails.map(t => `
          <div class="glass-card" style="padding:14px;border:1px solid var(--border)">
            <div style="font-weight:600">${t.name}</div>
            <div class="text-sm text-muted">${t.department ? '🏢 ' + t.department : ''}</div>
            <div class="text-sm text-muted">${t.phone ? '📞 ' + t.phone : ''}</div>
          </div>
        `).join('')}
      </div>
      <div class="flex gap-8">
        ${ev.event_registration_link ? `<button class="btn btn-primary" style="flex:1" onclick="window.open('${ev.event_registration_link}','_blank')">📝 Register</button>` : ''}
        <button class="btn btn-outline" style="flex:1" onclick="toggleFav('${ev.id}');closeModal()">
          ${fav ? '💔 Remove Favorite' : '❤️ Add Favorite'}
        </button>
      </div>
    `);
  };

  // ===== FAVORITES =====
  function renderFavorites() {
    const favIds = getFavorites(user.id);
    const events = getEvents();
    const container = document.getElementById('favoritesContainer');

    if (!favIds.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⭐</div><p class="empty-state__text">No favorite events yet<br><span class="text-xs text-muted">Tap the ☆ star on any event</span></p></div>';
      return;
    }

    const favEvents = favIds.map(id => events.find(e => e.id === id)).filter(Boolean);
    if (!favEvents.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⭐</div><p class="empty-state__text">No favorite events found</p></div>';
      return;
    }

    container.innerHTML = `<div class="event-grid">${favEvents.map(ev => {
      const evStatus = getEventStatus(ev.date);
      return `
        <div class="event-card" onclick="openStudentEventDetail('${ev.id}')">
          <div class="event-card__body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div class="event-card__title" style="margin-bottom:0;flex:1">${ev.title}</div>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();toggleFav('${ev.id}')" style="font-size:1.2rem;color:#FDCB6E;padding:4px 8px;height:auto">★</button>
            </div>
            <div class="event-card__meta">
              <div class="event-card__meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${ev.venue}</span>
              </div>
              <div class="event-card__meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                <span>${formatDate(ev.date)} · ${ev.time}</span>
              </div>
            </div>
            <div class="event-card__footer">${getStatusBadge(evStatus)}</div>
          </div>
        </div>`;
    }).join('')}</div>`;
  }

  // ===== PROFILE =====
  function renderProfile() {
    document.getElementById('profileContainer').innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-light));display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;margin:0 auto 16px;font-weight:700">${user.name.charAt(0)}</div>
        <h2 style="margin-bottom:4px">${user.name}</h2>
        <p class="text-muted">${user.email}</p>
        ${user.department ? `<p class="text-sm mt-8">🏢 ${user.department}</p>` : ''}
        <p class="text-sm mt-8">🎓 Student</p>
        <div class="mt-20">
          <button class="btn btn-danger" onclick="logout()">Sign Out</button>
        </div>
      </div>
    `;
  }

  // ===== TOGGLE FAVORITE =====
  window.toggleFav = function (eventId) {
    const added = toggleFavorite(user.id, eventId);
    showToast(added ? 'Added to favorites ⭐' : 'Removed from favorites', added ? 'success' : 'info');
    renderHome();
    renderFavorites();
  };

  // Initial render
  renderHome();
})();
