// ============================================================
// teacher.js — Teacher Dashboard Logic (SaaS Layout)
// ============================================================

(function () {
  const user = requireAuth(['teacher']);
  if (!user) return;

  // Set user info
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.textContent = user.name.charAt(0);
  document.getElementById('ddName').textContent = user.name;
  document.getElementById('ddEmail').textContent = user.email;
  document.getElementById('teacherGreeting').textContent = `Welcome, ${user.name.split(' ').pop()} 👋`;

  function getMyEvents() {
    return getEvents().filter(e => isTeacherAssigned(e, user.email));
  }

  function render() {
    const events = getMyEvents();
    const regs = getRegistrations();
    const allUsers = getUsers();

    // --- HOME: Featured slider + Notices + Scroll events (same as admin) ---
    renderFeaturedSlider('featuredSliderContainer');
    const allEventsForHome = getEvents();
    const upcoming = allEventsForHome.filter(e => getEventStatus(e.date) === 'upcoming');
    const completed = allEventsForHome.filter(e => getEventStatus(e.date) === 'completed');
    renderScrollEvents('upcomingScroll', upcoming, 'switchSection');
    renderScrollEvents('completedScroll', completed, 'switchSection');
    // Notices banner
    const notices = getNotices();
    const nb = document.getElementById('noticesBannerHome');
    if (nb && notices.length) {
      nb.innerHTML = `<div class="panel" style="border-left:3px solid var(--warning)"><div class="panel__header"><div class="panel__title">📢 Notices</div></div><div class="panel__body" style="padding:12px 22px">${notices.slice(0,3).map(n => `<div style="margin-bottom:10px"><div style="font-weight:600;font-size:.9rem">${n.title}</div><div class="text-sm text-muted">${n.message}</div></div>`).join('')}</div></div>`;
    } else if (nb) { nb.innerHTML = ''; }

    if (!events.length) {
      document.getElementById('eventCardsContainer').innerHTML = '<div class="empty-state"><div class="empty-state__icon">📭</div><p class="empty-state__text">No events assigned to you yet</p></div>';
    } else {
      document.getElementById('eventCardsContainer').innerHTML = `<div class="event-grid">${events.map(ev => {
        const teacherEmails = getEventTeachers(ev);
        const teacherNames = teacherEmails.map(email => { const t = allUsers.find(u => u.email === email && u.role === 'teacher'); return t ? t.name : email; });
        const coordCount = (ev.coordinators || []).length;
        return `
          <div class="event-card" onclick="openEventDetail('${ev.id}')">
            <div class="event-card__body">
              <div class="event-card__title">${ev.title}</div>
              <div class="event-card__meta">
                <div class="event-card__meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${ev.venue}</span></div>
                <div class="event-card__meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg><span>${formatDate(ev.date)} · ${ev.time}</span></div>
                <div class="event-card__meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="9" cy="7" r="4"/></svg><span>🏢 ${ev.floor || 'N/A'}</span></div>
              </div>
              <div class="event-card__footer">
                ${getStatusBadge(getEventStatus(ev.date))}
                <div class="event-card__teachers">👨‍🏫 ${teacherNames.length} teacher(s) · 👥 ${coordCount} coord(s)</div>
              </div>
            </div>
          </div>`;
      }).join('')}</div>`;
    }

    // --- Coordinators section ---
    renderCoordinatorsSection(events);

    // --- Maps ---
    renderMapsGrid('mapsContainer');

    // --- Profile ---
    document.getElementById('profileContainer').innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-light));display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;margin:0 auto 16px;font-weight:700">${user.name.charAt(0)}</div>
        <h2 style="margin-bottom:4px">${user.name}</h2>
        <p class="text-muted">${user.email}</p>
        ${user.department ? `<p class="text-sm mt-8">🏢 ${user.department}</p>` : ''}
        ${user.phone ? `<p class="text-sm">📞 ${user.phone}</p>` : ''}
        <p class="text-sm mt-8">👨‍🏫 Teacher</p>
        <div class="mt-20">
          <button class="btn btn-danger" onclick="logout()">Sign Out</button>
        </div>
      </div>
    `;
  }

  function renderEventList(containerId, events, allUsers, regs) {
    const el = document.getElementById(containerId);
    if (!events.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📭</div><p class="empty-state__text">No events assigned</p></div>'; return; }
    el.innerHTML = events.map(ev => `
      <div class="data-item" style="cursor:pointer" onclick="openEventDetail('${ev.id}')">
        <div class="data-item__header">
          <div class="data-item__title">${ev.title}</div>
          <div class="data-item__actions">
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openManageCoordinators('${ev.id}')">👥</button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditEventTeacher('${ev.id}')">✏️</button>
          </div>
        </div>
        <div class="data-item__meta">📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time} ${getStatusBadge(getEventStatus(ev.date))}</div>
      </div>
    `).join('');
  }

  function renderCoordinatorsSection(events) {
    const container = document.getElementById('coordinatorsContainer');
    if (!events.length) { container.innerHTML = '<div class="empty-state"><p class="empty-state__text">No events to show coordinators for</p></div>'; return; }
    container.innerHTML = events.map(ev => {
      const coords = ev.coordinators || [];
      return `
        <div class="panel mb-20" style="border:1px solid var(--border)">
          <div class="panel__header">
            <div class="panel__title" style="font-size:.9rem">${ev.title}</div>
            <button class="btn btn-outline btn-sm" onclick="openManageCoordinators('${ev.id}')">Edit Coordinators</button>
          </div>
          <div class="panel__body">
            ${coords.length ? `<div class="coordinator-cards">${coords.map((c, i) => `
              <div class="glass-card" style="padding:14px">
                <div style="font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--accent);margin-bottom:6px">Coordinator ${i + 1}</div>
                <div style="font-weight:600">${c.name || '—'}</div>
                <div class="text-sm text-muted">📞 ${c.phone || '—'}</div>
              </div>
            `).join('')}</div>` : '<p class="text-sm text-muted">No coordinators assigned. Click "Edit Coordinators" to add.</p>'}
          </div>
        </div>`;
    }).join('');
  }

  // ---- Event Detail ----
  window.openEventDetail = function (id) {
    const ev = getEventById(id);
    if (!ev || !isTeacherAssigned(ev, user.email)) return;
    const allUsers = getUsers();
    const teacherEmails = getEventTeachers(ev);
    const teacherNames = teacherEmails.map(email => { const t = allUsers.find(u => u.email === email && u.role === 'teacher'); return t ? t.name : email; });
    const coords = ev.coordinators || [];
    showModal(ev.title, `
      <div class="mb-12">${getStatusBadge(getEventStatus(ev.date))}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        <div class="flex items-center gap-8 text-sm"><span>📍 ${ev.venue}</span></div>
        <div class="flex items-center gap-8 text-sm"><span>🏢 ${ev.floor || 'N/A'}</span></div>
        <div class="flex items-center gap-8 text-sm"><span>📅 ${formatDate(ev.date)} · ${ev.time}</span></div>
        <div class="flex items-center gap-8 text-sm"><span>👨‍🏫 ${teacherNames.join(', ')}</span></div>
      </div>
      <h4 style="margin-bottom:6px">Description</h4>
      <p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.description}</p>
      ${ev.instructions ? `<h4 style="margin-bottom:6px">📋 Instructions</h4><p class="text-sm text-muted" style="line-height:1.7;margin-bottom:20px">${ev.instructions}</p>` : ''}
      ${coords.length ? `<h4 style="margin-bottom:8px">👥 Coordinators</h4><div class="coordinator-cards mb-20">${coords.map((c, i) => `<div class="glass-card" style="padding:14px"><div style="font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--accent);margin-bottom:4px">Coordinator ${i + 1}</div><div style="font-weight:600">${c.name || '—'}</div><div class="text-sm text-muted">📞 ${c.phone || '—'}</div></div>`).join('')}</div>` : ''}
      <div class="flex gap-8">
        <button class="btn btn-outline" style="flex:1" onclick="closeModal();openEditEventTeacher('${ev.id}')">✏️ Edit</button>
        <button class="btn btn-outline" style="flex:1" onclick="closeModal();openManageCoordinators('${ev.id}')">👥 Coordinators</button>
        ${ev.student_sheet_link ? `<button class="btn btn-outline" style="flex:1" onclick="window.open('${ev.student_sheet_link}','_blank')">📄 Students</button>` : ''}
      </div>
    `);
  };

  // ---- Manage Coordinators ----
  window.openManageCoordinators = function (eventId) {
    const ev = getEventById(eventId);
    if (!ev || !isTeacherAssigned(ev, user.email)) { showToast('Permission denied', 'error'); return; }
    const coords = ev.coordinators || [];
    while (coords.length < 2) coords.push({ name: '', phone: '' });
    let coordCount = coords.length;

    function renderCoordForm() {
      let html = '<form id="coordForm">';
      for (let i = 0; i < coordCount; i++) {
        const c = coords[i] || { name: '', phone: '' };
        html += `<div class="coordinator-section"><div class="coordinator-section__title">👥 Coordinator ${i + 1}${i >= 2 ? ` <button type="button" class="btn btn-danger btn-sm" style="float:right;padding:4px 8px;font-size:.7rem" onclick="removeCoordSlot(${i})">✕</button>` : ''}</div><div class="form-group"><label>Name</label><input class="form-input" id="cName${i}" value="${c.name || ''}" required></div><div class="form-group"><label>Phone</label><input class="form-input" id="cPhone${i}" value="${c.phone || ''}" required pattern="[0-9]{10}" title="10-digit phone"></div></div>`;
      }
      html += `<div class="flex gap-8 mb-16">${coordCount < 4 ? '<button type="button" class="btn btn-outline btn-sm" onclick="addCoordSlot()">+ Add</button>' : ''}<span class="text-xs text-muted" style="align-self:center">Min: 2 · Max: 4</span></div><button type="submit" class="btn btn-primary btn-block">💾 Save</button></form>`;
      return html;
    }
    showModal(`👥 Coordinators — ${ev.title}`, renderCoordForm());

    window.addCoordSlot = function () {
      if (coordCount >= 4) return;
      for (let i = 0; i < coordCount; i++) { coords[i] = { name: document.getElementById(`cName${i}`).value, phone: document.getElementById(`cPhone${i}`).value }; }
      coords.push({ name: '', phone: '' }); coordCount++;
      document.querySelector('.modal__body').innerHTML = renderCoordForm(); attachCoordSubmit();
    };
    window.removeCoordSlot = function (idx) {
      if (coordCount <= 2) return;
      for (let i = 0; i < coordCount; i++) { coords[i] = { name: document.getElementById(`cName${i}`).value, phone: document.getElementById(`cPhone${i}`).value }; }
      coords.splice(idx, 1); coordCount--;
      document.querySelector('.modal__body').innerHTML = renderCoordForm(); attachCoordSubmit();
    };
    function attachCoordSubmit() {
      document.getElementById('coordForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const newCoords = [];
        for (let i = 0; i < coordCount; i++) {
          const name = document.getElementById(`cName${i}`).value.trim();
          const phone = document.getElementById(`cPhone${i}`).value.trim();
          if (!name || !phone) { showToast('All fields required', 'error'); return; }
          newCoords.push({ name, phone });
        }
        const events = getEvents();
        const idx = events.findIndex(ev => ev.id === eventId);
        if (idx !== -1) { events[idx].coordinators = newCoords; saveEvents(events); closeModal(); showToast('Coordinators saved! ✅'); render(); }
      });
    }
    attachCoordSubmit();
  };

  // ---- Edit Event ----
  window.openEditEventTeacher = function (id) {
    const ev = getEventById(id);
    if (!ev || !isTeacherAssigned(ev, user.email)) { showToast('Permission denied', 'error'); return; }
    let timeValue = '';
    if (ev.time) {
      const match = ev.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) { let hr = parseInt(match[1]); const min = match[2]; const period = match[3].toUpperCase(); if (period === 'PM' && hr !== 12) hr += 12; if (period === 'AM' && hr === 12) hr = 0; timeValue = `${hr.toString().padStart(2, '0')}:${min}`; }
    }
    showModal('Edit Event', `
      <form id="teacherEditForm">
        <div class="form-group"><label>Title</label><input class="form-input" value="${ev.title}" disabled style="opacity:.5"><p class="text-xs text-muted mt-8">Only admin can change title</p></div>
        <div class="form-group"><label>Description</label><textarea class="form-input form-textarea" id="teDesc" required>${ev.description}</textarea></div>
        <div class="form-group"><label>Location</label><input class="form-input" id="teVenue" value="${ev.venue || ''}" required></div>
        <div class="form-group"><label>Floor</label><input class="form-input" id="teFloor" value="${ev.floor || ''}" required></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="teDate" value="${ev.date}" required></div>
        <div class="form-group"><label>Time</label><input type="time" class="form-input" id="teTime" value="${timeValue}"></div>
        <div class="form-group"><label>Instructions</label><textarea class="form-input form-textarea" id="teInstructions">${ev.instructions || ''}</textarea></div>
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Save</button>
      </form>
    `);
    document.getElementById('teacherEditForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const events = getEvents(); const idx = events.findIndex(ev => ev.id === id); if (idx === -1) return;
      const timeVal = document.getElementById('teTime').value;
      if (timeVal) { const [h, m] = timeVal.split(':'); const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12; events[idx].time = `${h12}:${m} ${ampm}`; }
      events[idx].description = document.getElementById('teDesc').value;
      events[idx].venue = document.getElementById('teVenue').value.trim();
      events[idx].floor = document.getElementById('teFloor').value.trim();
      events[idx].date = document.getElementById('teDate').value;
      events[idx].instructions = document.getElementById('teInstructions').value;
      saveEvents(events); closeModal(); showToast('Event updated! ✅'); render();
    });
  };

  render();
})();
