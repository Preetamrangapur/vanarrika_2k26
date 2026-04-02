// ============================================================
// admin.js — Admin Dashboard Logic (SaaS Dashboard Layout)
// ============================================================

(function () {
  const user = requireAuth(['admin']);
  if (!user) return;

  // Set avatar + dropdown info
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.textContent = user.name.charAt(0);
  const ddName = document.getElementById('ddName');
  const ddEmail = document.getElementById('ddEmail');
  if (ddName) ddName.textContent = user.name;
  if (ddEmail) ddEmail.textContent = user.email;

  // Greeting
  const hour = new Date().getHours();
  let greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.getElementById('adminGreeting');
  if (greetEl) greetEl.textContent = greet;

  // ----- Helper: teacher names -----
  function getTeacherNames(ev) {
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    const emails = getEventTeachers(ev);
    return emails.map(email => {
      const t = teachers.find(t => t.email === email);
      return t ? t.name : email;
    });
  }

  // ----- Multi-select teacher checkboxes -----
  function teacherCheckboxes(selectedEmails = []) {
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    if (!teachers.length) return '<p class="text-xs text-muted">No teachers available</p>';
    return `<div class="teacher-checkbox-list">${teachers.map(t => `
      <label class="teacher-checkbox">
        <input type="checkbox" value="${t.email}" ${selectedEmails.includes(t.email) ? 'checked' : ''}>
        <span class="teacher-checkbox__name">${t.name}</span>
        <span class="teacher-checkbox__email">${t.email}</span>
      </label>`).join('')}</div>`;
  }
  function getSelectedTeachers() {
    return Array.from(document.querySelectorAll('.teacher-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value);
  }

  // ===== RENDER ALL =====
  function render() {
    const events = getEvents();
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');
    const pendingTeachers = getPendingTeachers().filter(t => t.status === 'pending');
    const notices = getNotices();

    // --- HOME section ---
    renderFeaturedSlider('featuredSliderContainer');
    const upcoming = events.filter(e => getEventStatus(e.date) === 'upcoming');
    const completed = events.filter(e => getEventStatus(e.date) === 'completed');
    renderScrollEvents('upcomingScroll', upcoming, 'openEventModal');
    renderScrollEvents('completedScroll', completed, 'openEventModal');
    // Notices banner
    const nb = document.getElementById('noticesBannerHome');
    if (nb && notices.length) {
      nb.innerHTML = `<div class="panel" style="border-left:3px solid var(--warning)"><div class="panel__header"><div class="panel__title">📢 Notices</div></div><div class="panel__body" style="padding:12px 22px">${notices.slice(0,3).map(n => `<div style="margin-bottom:10px"><div style="font-weight:600;font-size:.9rem">${n.title}</div><div class="text-sm text-muted">${n.message}</div></div>`).join('')}</div></div>`;
    }
    // Maps
    renderMapsGrid('mapsContainer');

    // --- Stats ---
    document.getElementById('statsRow').innerHTML = `
      <div class="stat-card"><div class="stat-card__header"><div class="stat-card__icon">🎓</div></div><div class="stat-card__value">${students.length}</div><div class="stat-card__label">Total Students</div></div>
      <div class="stat-card"><div class="stat-card__header"><div class="stat-card__icon">👨‍🏫</div></div><div class="stat-card__value">${teachers.length}</div><div class="stat-card__label">Total Teachers</div></div>
      <div class="stat-card"><div class="stat-card__header"><div class="stat-card__icon">📅</div></div><div class="stat-card__value">${events.length}</div><div class="stat-card__label">Total Events</div></div>
      <div class="stat-card"><div class="stat-card__header"><div class="stat-card__icon">📢</div></div><div class="stat-card__value">${notices.length}</div><div class="stat-card__label">Total Notices</div></div>
    `;

    // --- Recent Events (dashboard) ---
    const recentEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    document.getElementById('recentEventsList').innerHTML = recentEvents.map(ev => `
      <div class="data-item" style="cursor:pointer" onclick="openEventModal('${ev.id}')">
        <div class="data-item__header">
          <div class="data-item__title">${ev.title}</div>
          ${getStatusBadge(getEventStatus(ev.date))}
        </div>
        <div class="data-item__meta">📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}</div>
      </div>
    `).join('') || '<div class="empty-state"><p class="empty-state__text">No events yet</p></div>'; 

    // --- Activity Timeline ---
    document.getElementById('activityTimeline').innerHTML = `
      <div class="timeline">
        ${events.slice(0, 4).map(ev => `
          <div class="timeline__item">
            <div class="timeline__dot"></div>
            <div class="timeline__content"><strong>${ev.title}</strong> was created</div>
            <div class="timeline__time">${formatDate(ev.date)}</div>
          </div>
        `).join('')}
        ${pendingTeachers.length ? `<div class="timeline__item"><div class="timeline__dot" style="background:var(--warning)"></div><div class="timeline__content"><strong>${pendingTeachers.length}</strong> teacher(s) pending approval</div><div class="timeline__time">Action needed</div></div>` : ''}
        ${notices.length ? `<div class="timeline__item"><div class="timeline__dot" style="background:var(--info)"></div><div class="timeline__content"><strong>${notices.length}</strong> notice(s) published</div></div>` : ''}
      </div>
    `;

    // --- Events section ---
    document.getElementById('eventListPanel').innerHTML = events.map(ev => {
      const names = getTeacherNames(ev);
      const teacherStr = names.length ? names.join(', ') : 'Unassigned';
      return `
        <div class="data-item" style="cursor:pointer" onclick="openEventModal('${ev.id}')" title="View details">
          <div class="data-item__header">
            <div class="data-item__title">${ev.title}</div>
            <div class="data-item__actions">
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditEvent('${ev.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteEvent('${ev.id}')">🗑️</button>
            </div>
          </div>
          <div class="data-item__meta">
            📍 ${ev.venue} · 🏢 ${ev.floor || ''} · 📅 ${formatDate(ev.date)} · ${ev.time}<br>
            👨‍🏫 ${teacherStr} ${getStatusBadge(getEventStatus(ev.date))}
          </div>
        </div>`;
    }).join('') || '<div class="empty-state"><div class="empty-state__icon">📅</div><p class="empty-state__text">No events yet</p></div>'; 

    // --- Teachers section ---
    const approvalPanel = document.getElementById('approvalPanel');
    if (pendingTeachers.length > 0) {
      approvalPanel.style.display = '';
      document.getElementById('approvalList').innerHTML = pendingTeachers.map(t => `
        <div class="approval-card">
          <div class="approval-card__info">
            <div class="approval-card__name">${t.name}</div>
            <div class="approval-card__details">📧 ${t.email}${t.phone ? ' · 📞 ' + t.phone : ''}${t.employee_id ? ' · 🪪 ' + t.employee_id : ''} · 🏢 ${t.department || '—'}</div>
          </div>
          <div class="approval-card__actions">
            <button class="btn btn-success btn-sm" onclick="approveTeacher('${t.id}')">✅ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectTeacher('${t.id}')">❌ Reject</button>
          </div>
        </div>
      `).join('');
    } else {
      approvalPanel.style.display = 'none';
    }

    document.getElementById('teacherListPanel').innerHTML = teachers.map(t => `
      <div class="data-item">
        <div class="data-item__title">${t.name}</div>
        <div class="data-item__meta">📧 ${t.email}${t.department ? ' · 🏢 ' + t.department : ''}${t.phone ? ' · 📞 ' + t.phone : ''}</div>
      </div>
    `).join('') || '<div class="empty-state"><p class="empty-state__text">No teachers registered</p></div>';

    // --- Students section ---
    document.getElementById('studentListPanel').innerHTML = students.map(s => `
      <div class="data-item">
        <div class="data-item__title">${s.name}</div>
        <div class="data-item__meta">📧 ${s.email}${s.department ? ' · 🏢 ' + s.department : ''}</div>
      </div>
    `).join('') || '<div class="empty-state"><p class="empty-state__text">No students registered</p></div>';

    // --- Notices section ---
    const sortedNotices = [...notices].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById('noticesListPanel').innerHTML = sortedNotices.length ? `<div class="notice-list">${sortedNotices.map(n => `
      <div class="notice-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="notice-card__title">${n.title}</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" onclick="openEditNotice('${n.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteNotice('${n.id}')">🗑️</button>
          </div>
        </div>
        <div class="notice-card__msg">${n.message}</div>
        <div class="notice-card__date">📅 ${n.date}</div>
      </div>
    `).join('')}</div>` : '<div class="empty-state"><div class="empty-state__icon">📢</div><p class="empty-state__text">No notices yet. Click "+ Add Notice".</p></div>';

    // --- Profile section ---
    const profileEl = document.getElementById('profileContainer');
    if (profileEl) {
      profileEl.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-light));display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;margin:0 auto 16px;font-weight:700">${user.name.charAt(0)}</div>
          <h2 style="margin-bottom:4px">${user.name}</h2>
          <p class="text-muted">${user.email}</p>
          <p class="text-sm mt-8">🛡️ Administrator</p>
          <div class="mt-20">
            <button class="btn btn-danger" onclick="logout()">Sign Out</button>
          </div>
        </div>
      `;
    }
  }

  // ===== CREATE EVENT =====
  window.openCreateEvent = function () {
    showModal('Create Event', `
      <form id="eventForm">
        <div class="form-group"><label>Title</label><input class="form-input" id="evTitle" required></div>
        <div class="form-group"><label>Description</label><textarea class="form-input form-textarea" id="evDesc" required></textarea></div>
        <div class="form-group"><label>Location / Place</label><input class="form-input" id="evVenue" required placeholder="e.g. LH 101"></div>
        <div class="form-group"><label>Floor</label><input class="form-input" id="evFloor" required placeholder="e.g. 1st Floor"></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="evDate" required></div>
        <div class="form-group"><label>Time</label><input type="time" class="form-input" id="evTime" required></div>
        <div class="form-group"><label>Assign Teachers</label>${teacherCheckboxes()}</div>
        <div class="form-group"><label>Student Sheet Link</label><input class="form-input" id="evSheetLink" placeholder="https://docs.google.com/..."></div>
        <div class="form-group"><label>Registration Link</label><input class="form-input" id="evRegLink" placeholder="https://forms.google.com/..."></div>
        <input type="hidden" id="evId">
        <button type="submit" class="btn btn-primary btn-block mt-12">Save Event</button>
      </form>
    `);
    document.getElementById('eventForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const events = getEvents();
      const timeVal = document.getElementById('evTime').value;
      const [h, m] = timeVal.split(':');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const selectedTeachers = getSelectedTeachers();
      const eventData = {
        title: document.getElementById('evTitle').value,
        description: document.getElementById('evDesc').value,
        venue: document.getElementById('evVenue').value.trim(),
        floor: document.getElementById('evFloor').value.trim(),
        date: document.getElementById('evDate').value,
        time: `${h12}:${m} ${ampm}`,
        assignedTeacher: selectedTeachers[0] || '',
        assignedTeachers: selectedTeachers,
        student_sheet_link: document.getElementById('evSheetLink').value.trim(),
        event_registration_link: document.getElementById('evRegLink').value.trim(),
        image: 'images/event-default.webp',
        featured: false,
        id: generateId(),
        coordinators: []
      };
      events.push(eventData);
      saveEvents(events);
      closeModal();
      showToast('Event created successfully!');
      render();
    });
  };

  // ===== EDIT EVENT =====
  window.openEditEvent = function (id) {
    const ev = getEventById(id);
    if (!ev) return;
    const selectedEmails = getEventTeachers(ev);
    showModal('Edit Event', `
      <form id="eventForm">
        <div class="form-group"><label>Title</label><input class="form-input" id="evTitle" value="${ev.title}" required></div>
        <div class="form-group"><label>Description</label><textarea class="form-input form-textarea" id="evDesc" required>${ev.description}</textarea></div>
        <div class="form-group"><label>Location</label><input class="form-input" id="evVenue" value="${ev.venue || ''}" required></div>
        <div class="form-group"><label>Floor</label><input class="form-input" id="evFloor" value="${ev.floor || ''}" required></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="evDate" value="${ev.date}" required></div>
        <div class="form-group"><label>Time</label><input type="time" class="form-input" id="evTime" required></div>
        <div class="form-group"><label>Assign Teachers</label>${teacherCheckboxes(selectedEmails)}</div>
        <div class="form-group"><label>Sheet Link</label><input class="form-input" id="evSheetLink" value="${ev.student_sheet_link || ''}"></div>
        <div class="form-group"><label>Registration Link</label><input class="form-input" id="evRegLink" value="${ev.event_registration_link || ''}"></div>
        <button type="submit" class="btn btn-primary btn-block mt-12">Save Changes</button>
      </form>
    `);
    if (ev.time) {
      const match = ev.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        let hr = parseInt(match[1]);
        const min = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && hr !== 12) hr += 12;
        if (period === 'AM' && hr === 12) hr = 0;
        document.getElementById('evTime').value = `${hr.toString().padStart(2, '0')}:${min}`;
      }
    }
    document.getElementById('eventForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const events = getEvents();
      const timeVal = document.getElementById('evTime').value;
      const [h, m] = timeVal.split(':');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const selectedTeachers = getSelectedTeachers();
      const idx = events.findIndex(e => e.id === id);
      if (idx !== -1) {
        events[idx] = { ...events[idx],
          title: document.getElementById('evTitle').value,
          description: document.getElementById('evDesc').value,
          venue: document.getElementById('evVenue').value.trim(),
          floor: document.getElementById('evFloor').value.trim(),
          date: document.getElementById('evDate').value,
          time: `${h12}:${m} ${ampm}`,
          assignedTeacher: selectedTeachers[0] || '',
          assignedTeachers: selectedTeachers,
          student_sheet_link: document.getElementById('evSheetLink').value.trim(),
          event_registration_link: document.getElementById('evRegLink').value.trim(),
        };
      }
      saveEvents(events);
      closeModal();
      showToast('Event updated!');
      render();
    });
  };

  // ===== DELETE EVENT =====
  window.deleteEvent = function (id) {
    if (!confirm('Delete this event?')) return;
    saveEvents(getEvents().filter(e => e.id !== id));
    saveRegistrations(getRegistrations().filter(r => r.eventId !== id));
    showToast('Event deleted', 'info');
    render();
  };

  // ===== APPROVE / REJECT TEACHER =====
  window.approveTeacher = function (id) {
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;
    const teacher = pending[idx];
    pending.splice(idx, 1);
    savePendingTeachers(pending);
    const users = getUsers();
    users.push({ id: teacher.id, name: teacher.name, email: teacher.email, password: teacher.password, role: 'teacher', avatar: '', department: teacher.department || '', phone: teacher.phone || '', employee_id: teacher.employee_id || '' });
    saveUsers(users);
    showToast(`${teacher.name} approved! ✅`);
    render();
  };
  window.rejectTeacher = function (id) {
    if (!confirm('Reject this teacher?')) return;
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;
    pending.splice(idx, 1);
    savePendingTeachers(pending);
    showToast('Registration rejected', 'info');
    render();
  };

  // ===== NOTICE MANAGEMENT =====
  window.openAddNotice = function () {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    showModal('Add Notice', `<form id="addNoticeForm"><div class="form-group"><label>Title</label><input class="form-input" id="noticeTitle" required></div><div class="form-group"><label>Message</label><textarea class="form-input form-textarea" id="noticeMsg" required></textarea></div><div class="form-group"><label>Date & Time</label><input class="form-input" id="noticeDate" value="${dateStr}, ${timeStr}" required></div><button type="submit" class="btn btn-primary btn-block mt-12">📢 Publish</button></form>`);
    document.getElementById('addNoticeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const notices = getNotices();
      notices.push({ id: 'n' + Date.now().toString(36), title: document.getElementById('noticeTitle').value.trim(), message: document.getElementById('noticeMsg').value.trim(), date: document.getElementById('noticeDate').value.trim() });
      saveNotices(notices); closeModal(); showToast('Notice published! 📢'); render();
    });
  };
  window.openEditNotice = function (id) {
    const n = getNotices().find(n => n.id === id); if (!n) return;
    showModal('Edit Notice', `<form id="editNoticeForm"><div class="form-group"><label>Title</label><input class="form-input" id="noticeTitle" value="${n.title}" required></div><div class="form-group"><label>Message</label><textarea class="form-input form-textarea" id="noticeMsg" required>${n.message}</textarea></div><div class="form-group"><label>Date</label><input class="form-input" id="noticeDate" value="${n.date}" required></div><button type="submit" class="btn btn-primary btn-block mt-12">💾 Save</button></form>`);
    document.getElementById('editNoticeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const notices = getNotices(); const idx = notices.findIndex(x => x.id === id); if (idx === -1) return;
      notices[idx].title = document.getElementById('noticeTitle').value.trim();
      notices[idx].message = document.getElementById('noticeMsg').value.trim();
      notices[idx].date = document.getElementById('noticeDate').value.trim();
      saveNotices(notices); closeModal(); showToast('Notice updated! ✅'); render();
    });
  };
  window.deleteNotice = function (id) {
    if (!confirm('Delete notice?')) return;
    saveNotices(getNotices().filter(n => n.id !== id)); showToast('Notice deleted', 'info'); render();
  };

  render();
})();
