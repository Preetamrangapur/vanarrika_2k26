// ============================================================
// teacher.js — Teacher Dashboard Logic
// ============================================================

(function () {
  const user = requireAuth(['teacher']);
  if (!user) return;

  document.getElementById('teacherName').textContent = `👨‍🏫 Hi, ${user.name.split(' ').pop()}`;

  function render() {
    const events = getEvents().filter(e => isTeacherAssigned(e, user.email));
    const regs = getRegistrations();

    // Stats
    const myRegs = regs.filter(r => events.some(e => e.id === r.eventId));
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-card__value">${events.length}</div><div class="stat-card__label">My Events</div></div>
      <div class="stat-card"><div class="stat-card__value">${myRegs.length}</div><div class="stat-card__label">Registrations</div></div>
    `;

    // Event list
    const listEl = document.getElementById('eventList');
    if (!events.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📭</div><p class="empty-state__text">No events assigned to you yet</p></div>';
      return;
    }

    listEl.innerHTML = events.map(ev => {
      const evRegs = regs.filter(r => r.eventId === ev.id);
      const coordCount = (ev.coordinators || []).length;
      return `
        <div class="data-item animate-fadeInUp" onclick="openEventDetail('${ev.id}')" style="cursor: pointer;">
          <div class="data-item__header">
            <div class="data-item__title">${ev.title}</div>
            <div class="data-item__actions">
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openManageCoordinators('${ev.id}')">👥 Coords (${coordCount})</button>
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openEditEventTeacher('${ev.id}')">✏️ Edit</button>
            </div>
          </div>
          <div class="data-item__meta">
            📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}
          </div>
          <div class="flex items-center justify-between mt-8">
            ${getStatusBadge(getEventStatus(ev.date))}
            <span class="text-xs text-muted">👥 ${evRegs.length} registered</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---- Event Detail Modal ----
  window.openEventDetail = function (id) {
    const ev = getEventById(id);
    if (!ev || !isTeacherAssigned(ev, user.email)) return;

    const regs = getRegistrations().filter(r => r.eventId === ev.id);
    const allUsers = getUsers();

    // Build assigned teachers list
    const teacherEmails = getEventTeachers(ev);
    const teacherNames = teacherEmails.map(email => {
      const t = allUsers.find(u => u.email === email && u.role === 'teacher');
      return t ? t.name : email;
    });

    // Build coordinators HTML
    const coords = ev.coordinators || [];
    const coordHtml = coords.length ? `
      <h4 style="margin-bottom: 8px;">👥 Student Coordinators</h4>
      <div class="coordinator-cards mb-20">
        ${coords.map((c, i) => `
          <div class="coordinator-card glass-card">
            <div class="coordinator-card__badge">Coordinator ${i + 1}</div>
            <div class="coordinator-card__name">${c.name || '—'}</div>
            <div class="coordinator-card__phone">📞 ${c.phone || '—'}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    showModal(ev.title, `
      <div style="margin-bottom: 20px;">
        ${getStatusBadge(getEventStatus(ev.date))}
      </div>

      <div class="event-detail__info" style="margin-bottom: 20px;">
        <div class="event-detail__info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${ev.venue}</span>
        </div>
        <div class="event-detail__info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${formatDate(ev.date)}</span>
        </div>
        <div class="event-detail__info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${ev.time}</span>
        </div>
        <div class="event-detail__info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>Assigned: ${teacherNames.join(', ')}</span>
        </div>
      </div>

      <h4 style="margin-bottom: 8px;">Description</h4>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px;">${ev.description}</p>

      ${ev.instructions ? `
        <h4 style="margin-bottom: 8px;">📋 Instructions</h4>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px;">${ev.instructions}</p>
      ` : ''}

      ${coordHtml}

      <div class="flex flex-col gap-8">
        ${ev.event_link ? `
          <button class="btn btn-primary btn-block" onclick="openEventLink('${ev.event_link}')">
            🔗 Open Event Link
          </button>
        ` : ''}
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" style="flex:1;" onclick="event.stopPropagation(); closeModal(); openEditEventTeacher('${ev.id}')">
            ✏️ Edit Event
          </button>
          <button class="btn btn-outline" style="flex:1;" onclick="event.stopPropagation(); closeModal(); openManageCoordinators('${ev.id}')">
            👥 Coordinators
          </button>
          ${ev.student_sheet_link ? `
            <button class="btn btn-outline" style="flex:1;" onclick="openStudentSheet('${ev.student_sheet_link}')">
              📄 Student List
            </button>
          ` : ''}
        </div>
      </div>
    `);
  };

  window.openEventLink = function (link) {
    window.open(link, '_blank');
  };

  window.openStudentSheet = function (link) {
    window.open(link, '_blank');
  };

  // ---- Manage Coordinators (per event, min 2 max 4) ----
  window.openManageCoordinators = function (eventId) {
    const ev = getEventById(eventId);
    if (!ev || !isTeacherAssigned(ev, user.email)) {
      showToast('Permission denied', 'error');
      return;
    }

    const coords = ev.coordinators || [];
    // Ensure at least 2 slots
    while (coords.length < 2) coords.push({ name: '', phone: '' });

    let coordCount = coords.length;

    function renderCoordForm() {
      let formHtml = `<form id="coordForm">`;
      for (let i = 0; i < coordCount; i++) {
        const c = coords[i] || { name: '', phone: '' };
        formHtml += `
          <div class="coordinator-section">
            <div class="coordinator-section__title">👥 Coordinator ${i + 1}${i >= 2 ? ` <button type="button" class="btn btn-danger btn-sm" style="float:right; padding:4px 8px; font-size:0.7rem;" onclick="removeCoordSlot(${i})">✕ Remove</button>` : ''}</div>
            <div class="form-group">
              <label>Name</label>
              <input class="form-input" id="cName${i}" value="${c.name || ''}" required placeholder="Student name">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input class="form-input" id="cPhone${i}" value="${c.phone || ''}" required placeholder="e.g. 9876543210" pattern="[0-9]{10}" title="Enter 10-digit phone">
            </div>
          </div>
        `;
      }
      formHtml += `
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          ${coordCount < 4 ? `<button type="button" class="btn btn-outline btn-sm" onclick="addCoordSlot()">+ Add Coordinator</button>` : ''}
          <span class="text-xs text-muted" style="align-self:center;">Min: 2 · Max: 4</span>
        </div>
        <button type="submit" class="btn btn-primary btn-block">💾 Save Coordinators</button>
      </form>`;
      return formHtml;
    }

    showModal(`👥 Coordinators — ${ev.title}`, renderCoordForm());

    window.addCoordSlot = function () {
      if (coordCount >= 4) return;
      // Save current values before re-render
      for (let i = 0; i < coordCount; i++) {
        const nameEl = document.getElementById(`cName${i}`);
        const phoneEl = document.getElementById(`cPhone${i}`);
        if (nameEl && phoneEl) {
          coords[i] = { name: nameEl.value, phone: phoneEl.value };
        }
      }
      coords.push({ name: '', phone: '' });
      coordCount++;
      document.querySelector('.modal__body').innerHTML = renderCoordForm();
      attachCoordSubmit();
    };

    window.removeCoordSlot = function (idx) {
      if (coordCount <= 2) return;
      // Save current values
      for (let i = 0; i < coordCount; i++) {
        const nameEl = document.getElementById(`cName${i}`);
        const phoneEl = document.getElementById(`cPhone${i}`);
        if (nameEl && phoneEl) {
          coords[i] = { name: nameEl.value, phone: phoneEl.value };
        }
      }
      coords.splice(idx, 1);
      coordCount--;
      document.querySelector('.modal__body').innerHTML = renderCoordForm();
      attachCoordSubmit();
    };

    function attachCoordSubmit() {
      document.getElementById('coordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newCoords = [];
        for (let i = 0; i < coordCount; i++) {
          const name = document.getElementById(`cName${i}`).value.trim();
          const phone = document.getElementById(`cPhone${i}`).value.trim();
          if (!name || !phone) {
            showToast('All coordinator fields are required', 'error');
            return;
          }
          newCoords.push({ name, phone });
        }
        // Save to event
        const events = getEvents();
        const idx = events.findIndex(ev => ev.id === eventId);
        if (idx !== -1) {
          events[idx].coordinators = newCoords;
          saveEvents(events);
          closeModal();
          showToast('Coordinators saved! ✅');
          render();
        }
      });
    }

    attachCoordSubmit();
  };

  // ---- Edit Event (Teacher) ----
  window.openEditEventTeacher = function (id) {
    const ev = getEventById(id);
    if (!ev || !isTeacherAssigned(ev, user.email)) {
      showToast('You can only edit events assigned to you', 'error');
      return;
    }

    // Convert stored 12h time to 24h for input[type=time]
    let timeValue = '';
    if (ev.time) {
      const match = ev.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        let hr = parseInt(match[1]);
        const min = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && hr !== 12) hr += 12;
        if (period === 'AM' && hr === 12) hr = 0;
        timeValue = `${hr.toString().padStart(2, '0')}:${min}`;
      }
    }

    showModal('Edit Event Details', `
      <form id="teacherEditForm">
        <div class="form-group">
          <label>Title</label>
          <input class="form-input" value="${ev.title}" disabled style="opacity: 0.5;">
          <p class="text-xs text-muted mt-8">Only admins can change the event title</p>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-input form-textarea" id="teDesc" required>${ev.description}</textarea>
        </div>
        <div class="form-group">
          <label>Location / Place</label>
          <input class="form-input" id="teVenue" value="${ev.venue || ''}" required placeholder="e.g. LH 101">
        </div>
        <div class="form-group">
          <label>Floor</label>
          <input class="form-input" id="teFloor" value="${ev.floor || ''}" required placeholder="e.g. 1st Floor">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" class="form-input" id="teDate" value="${ev.date}" required>
        </div>
        <div class="form-group">
          <label>Time</label>
          <input type="time" class="form-input" id="teTime" value="${timeValue}">
        </div>
        <div class="form-group">
          <label>Event Instructions</label>
          <textarea class="form-input form-textarea" id="teInstructions" placeholder="Special instructions for attendees...">${ev.instructions || ''}</textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Save Changes</button>
      </form>
    `);

    document.getElementById('teacherEditForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const events = getEvents();
      const idx = events.findIndex(ev => ev.id === id);
      if (idx === -1) return;
      if (!isTeacherAssigned(events[idx], user.email)) {
        showToast('Permission denied', 'error');
        return;
      }

      const timeVal = document.getElementById('teTime').value;
      if (timeVal) {
        const [h, m] = timeVal.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        events[idx].time = `${h12}:${m} ${ampm}`;
      }

      events[idx].description = document.getElementById('teDesc').value;
      events[idx].venue = document.getElementById('teVenue').value.trim();
      events[idx].floor = document.getElementById('teFloor').value.trim();
      events[idx].date = document.getElementById('teDate').value;
      events[idx].instructions = document.getElementById('teInstructions').value;

      saveEvents(events);
      closeModal();
      showToast('Event updated successfully! ✅');
      render();
    });
  };

  render();
  renderNotices('noticeSection');
  injectBottomNav('network');
})();
