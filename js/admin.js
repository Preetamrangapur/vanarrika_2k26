// ============================================================
// admin.js — Admin Dashboard Logic
// ============================================================

(function () {
  const user = requireAuth(['admin']);
  if (!user) return;

  // Helper: resolve teacher names from emails array
  function getTeacherNames(ev) {
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    const emails = getEventTeachers(ev);
    return emails.map(email => {
      const t = teachers.find(t => t.email === email);
      return t ? t.name : email;
    });
  }

  function render() {
    const events = getEvents();
    const users = getUsers();
    const regs = getRegistrations();
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');
    const pendingTeachers = getPendingTeachers().filter(t => t.status === 'pending');

    // Stats
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-card__value">${events.length}</div><div class="stat-card__label">Events</div></div>
      <div class="stat-card"><div class="stat-card__value">${teachers.length}</div><div class="stat-card__label">Teachers</div></div>
      <div class="stat-card"><div class="stat-card__value">${students.length}</div><div class="stat-card__label">Students</div></div>
      <div class="stat-card"><div class="stat-card__value">${pendingTeachers.length}</div><div class="stat-card__label">Pending</div></div>
    `;

    // Teacher Approval Requests
    const approvalEl = document.getElementById('approvalSection');
    if (pendingTeachers.length > 0) {
      approvalEl.innerHTML = `
        <div class="section-title mt-20"><span>⏳ Teacher Approval Requests (${pendingTeachers.length})</span></div>
        <div class="data-list mb-20">
          ${pendingTeachers.map(t => {
            return `
            <div class="data-item animate-fadeInUp" style="border-left: 3px solid var(--warning);">
              <div class="data-item__header">
                <div class="data-item__title">${t.name}</div>
                <div class="data-item__actions">
                  <button class="btn btn-success btn-sm" onclick="approveTeacher('${t.id}')">✅ Approve</button>
                  <button class="btn btn-danger btn-sm" onclick="rejectTeacher('${t.id}')">❌ Reject</button>
                </div>
              </div>
              <div class="data-item__meta">
                📧 ${t.email}${t.phone ? ' · 📞 ' + t.phone : ''}${t.employee_id ? ' · 🪪 ' + t.employee_id : ''}<br>
                🏢 ${t.department || '—'}<br>
                📅 Requested: ${formatDate(t.requestedAt)}
              </div>
            </div>
          `}).join('')}
        </div>
      `;
    } else {
      approvalEl.innerHTML = '';
    }

    // Event list
    const listEl = document.getElementById('eventList');
    listEl.innerHTML = events.map(ev => {
      const names = getTeacherNames(ev);
      const teacherStr = names.length ? names.join(', ') : 'Unassigned';
      return `
        <div class="data-item animate-fadeInUp">
          <div class="data-item__header">
            <div class="data-item__title">${ev.title}</div>
            <div class="data-item__actions">
              <button class="btn btn-ghost btn-sm" onclick="openEditEvent('${ev.id}')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteEvent('${ev.id}')">🗑️</button>
            </div>
          </div>
          <div class="data-item__meta">
            📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}<br>
            👨‍🏫 ${teacherStr}
            ${getStatusBadge(getEventStatus(ev.date))}
          </div>
        </div>
      `;
    }).join('');
  }

  // Multi-select teacher checkboxes HTML
  function teacherCheckboxes(selectedEmails = []) {
    const users = getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    if (!teachers.length) return '<p class="text-xs text-muted">No teachers available</p>';
    return `<div class="teacher-checkbox-list">
      ${teachers.map(t => `
        <label class="teacher-checkbox">
          <input type="checkbox" value="${t.email}" ${selectedEmails.includes(t.email) ? 'checked' : ''}>
          <span class="teacher-checkbox__name">${t.name}</span>
          <span class="teacher-checkbox__email">${t.email}</span>
        </label>
      `).join('')}
    </div>`;
  }

  function getSelectedTeachers() {
    const checkboxes = document.querySelectorAll('.teacher-checkbox-list input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  window.openCreateEvent = function() {
    showModal('Create Event', `
      <form id="eventForm">
        <div class="form-group"><label>Title</label><input class="form-input" id="evTitle" required></div>
        <div class="form-group"><label>Description</label><textarea class="form-input form-textarea" id="evDesc" required></textarea></div>
        <div class="form-group"><label>Location / Place</label><input class="form-input" id="evVenue" required placeholder="e.g. LH 101"></div>
        <div class="form-group"><label>Floor</label><input class="form-input" id="evFloor" required placeholder="e.g. 1st Floor"></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="evDate" required></div>
        <div class="form-group"><label>Time</label><input type="time" class="form-input" id="evTime" required></div>
        <div class="form-group"><label>Assign Teachers</label>${teacherCheckboxes()}</div>
        <div class="form-group"><label>Student Sheet Link</label><input class="form-input" id="evSheetLink" placeholder="https://docs.google.com/spreadsheets/d/..."></div>
        <div class="form-group"><label>Event Registration Link</label><input class="form-input" id="evRegLink" placeholder="https://forms.google.com/... or event registration URL"></div>
        <input type="hidden" id="evId">
        <button type="submit" class="btn btn-primary btn-block mt-12">Save Event</button>
      </form>
    `);

    document.getElementById('eventForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const events = getEvents();
      const evId = document.getElementById('evId').value;
      const timeVal = document.getElementById('evTime').value;
      const [h, m] = timeVal.split(':');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const timeFormatted = `${h12}:${m} ${ampm}`;

      const selectedTeachers = getSelectedTeachers();

      const eventData = {
        title: document.getElementById('evTitle').value,
        description: document.getElementById('evDesc').value,
        venue: document.getElementById('evVenue').value.trim(),
        floor: document.getElementById('evFloor').value.trim(),
        date: document.getElementById('evDate').value,
        time: timeFormatted,
        assignedTeacher: selectedTeachers[0] || '',
        assignedTeachers: selectedTeachers,
        student_sheet_link: document.getElementById('evSheetLink').value.trim(),
        event_registration_link: document.getElementById('evRegLink').value.trim(),
        image: 'images/event-default.webp',
        featured: false,
      };

      if (evId) {
        const idx = events.findIndex(e => e.id === evId);
        if (idx !== -1) {
          // Preserve coordinators when editing
          eventData.coordinators = events[idx].coordinators || [];
          events[idx] = { ...events[idx], ...eventData };
        }
        showToast('Event updated successfully!');
      } else {
        eventData.id = generateId();
        eventData.coordinators = [];
        events.push(eventData);
        showToast('Event created successfully!');
      }

      saveEvents(events);
      closeModal();
      render();
    });
  };

  window.openEditEvent = function(id) {
    const ev = getEventById(id);
    if (!ev) return;

    const selectedEmails = getEventTeachers(ev);
    showModal('Edit Event', `
      <form id="eventForm">
        <div class="form-group"><label>Title</label><input class="form-input" id="evTitle" value="${ev.title}" required></div>
        <div class="form-group"><label>Description</label><textarea class="form-input form-textarea" id="evDesc" required>${ev.description}</textarea></div>
        <div class="form-group"><label>Location / Place</label><input class="form-input" id="evVenue" value="${ev.venue || ''}" required placeholder="e.g. LH 101"></div>
        <div class="form-group"><label>Floor</label><input class="form-input" id="evFloor" value="${ev.floor || ''}" required placeholder="e.g. 1st Floor"></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="evDate" value="${ev.date}" required></div>
        <div class="form-group"><label>Time</label><input type="time" class="form-input" id="evTime" required></div>
        <div class="form-group"><label>Assign Teachers</label>${teacherCheckboxes(selectedEmails)}</div>
        <div class="form-group"><label>Student Sheet Link</label><input class="form-input" id="evSheetLink" value="${ev.student_sheet_link || ''}" placeholder="https://docs.google.com/spreadsheets/d/..."></div>
        <div class="form-group"><label>Event Registration Link</label><input class="form-input" id="evRegLink" value="${ev.event_registration_link || ''}" placeholder="https://forms.google.com/... or event registration URL"></div>
        <input type="hidden" id="evId" value="${ev.id}">
        <button type="submit" class="btn btn-primary btn-block mt-12">Save Event</button>
      </form>
    `);

    // Set time
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

    document.getElementById('eventForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const events = getEvents();
      const timeVal = document.getElementById('evTime').value;
      const [h, m] = timeVal.split(':');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const timeFormatted = `${h12}:${m} ${ampm}`;
      const selectedTeachers = getSelectedTeachers();

      const idx = events.findIndex(e => e.id === id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          title: document.getElementById('evTitle').value,
          description: document.getElementById('evDesc').value,
          venue: document.getElementById('evVenue').value.trim(),
          floor: document.getElementById('evFloor').value.trim(),
          date: document.getElementById('evDate').value,
          time: timeFormatted,
          assignedTeacher: selectedTeachers[0] || '',
          assignedTeachers: selectedTeachers,
          student_sheet_link: document.getElementById('evSheetLink').value.trim(),
          event_registration_link: document.getElementById('evRegLink').value.trim(),
        };
        showToast('Event updated successfully!');
      }

      saveEvents(events);
      closeModal();
      render();
    });
  };

  window.deleteEvent = function(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const events = getEvents().filter(e => e.id !== id);
    const regs = getRegistrations().filter(r => r.eventId !== id);
    saveEvents(events);
    saveRegistrations(regs);
    showToast('Event deleted', 'info');
    render();
  };

  window.removeStudent = function(eventId, userId) {
    const regs = getRegistrations().filter(r => !(r.eventId === eventId && r.userId === userId));
    saveRegistrations(regs);
    showToast('Student removed');
    render();
  };

  window.approveTeacher = function(id) {
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;

    const teacher = pending[idx];
    pending.splice(idx, 1);
    savePendingTeachers(pending);

    const users = getUsers();
    users.push({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      password: teacher.password,
      role: 'teacher',
      avatar: '',
      department: teacher.department || '',
      phone: teacher.phone || '',
      employee_id: teacher.employee_id || '',
    });
    saveUsers(users);

    showToast(`${teacher.name} approved as Teacher! ✅`);
    render();
  };

  window.rejectTeacher = function(id) {
    if (!confirm('Are you sure you want to reject this teacher registration?')) return;
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;

    const teacher = pending[idx];
    pending.splice(idx, 1);
    savePendingTeachers(pending);

    showToast(`${teacher.name}'s registration rejected`, 'info');
    render();
  };

  // ---- FAQ Management ----
  window.openFaqManagement = function () {
    const faqs = getFaqs();
    showModal('❓ FAQ Management', `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-primary btn-sm" onclick="openAddFaq()">+ Add FAQ</button>
      </div>
      <div class="data-list">
        ${faqs.length ? faqs.map((faq, i) => `
          <div class="data-item" style="margin-bottom: 8px;">
            <div class="data-item__header">
              <div class="data-item__title" style="font-size: 0.9rem;">${faq.question}</div>
              <div class="data-item__actions" style="display:flex; gap:4px;">
                <button class="btn btn-ghost btn-sm" onclick="openEditFaq('${faq.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteFaq('${faq.id}')">🗑️</button>
              </div>
            </div>
            <div class="data-item__meta" style="font-size: 0.8rem;">${faq.answer.substring(0, 80)}${faq.answer.length > 80 ? '...' : ''}</div>
          </div>
        `).join('') : '<p class="text-xs text-muted">No FAQs yet. Click "+ Add FAQ" to create one.</p>'}
      </div>
    `);
  };

  window.openAddFaq = function () {
    showModal('Add New FAQ', `
      <form id="addFaqForm">
        <div class="form-group">
          <label>Question</label>
          <input class="form-input" id="faqQuestion" placeholder="Enter the question..." required>
        </div>
        <div class="form-group">
          <label>Answer</label>
          <textarea class="form-input form-textarea" id="faqAnswer" placeholder="Enter the answer..." required style="min-height: 100px;"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Add FAQ</button>
      </form>
    `);

    document.getElementById('addFaqForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const faqs = getFaqs();
      faqs.push({
        id: 'fq' + Date.now().toString(36),
        question: document.getElementById('faqQuestion').value.trim(),
        answer: document.getElementById('faqAnswer').value.trim()
      });
      saveFaqs(faqs);
      closeModal();
      showToast('FAQ added successfully! ✅');
      setTimeout(() => openFaqManagement(), 350);
    });
  };

  window.openEditFaq = function (id) {
    const faqs = getFaqs();
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    showModal('Edit FAQ', `
      <form id="editFaqForm">
        <div class="form-group">
          <label>Question</label>
          <input class="form-input" id="faqQuestion" value="${faq.question}" required>
        </div>
        <div class="form-group">
          <label>Answer</label>
          <textarea class="form-input form-textarea" id="faqAnswer" required style="min-height: 100px;">${faq.answer}</textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Save Changes</button>
      </form>
    `);

    document.getElementById('editFaqForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const faqs = getFaqs();
      const idx = faqs.findIndex(f => f.id === id);
      if (idx === -1) return;
      faqs[idx].question = document.getElementById('faqQuestion').value.trim();
      faqs[idx].answer = document.getElementById('faqAnswer').value.trim();
      saveFaqs(faqs);
      closeModal();
      showToast('FAQ updated! ✅');
      setTimeout(() => openFaqManagement(), 350);
    });
  };

  window.deleteFaq = function (id) {
    if (!confirm('Delete this FAQ?')) return;
    const faqs = getFaqs().filter(f => f.id !== id);
    saveFaqs(faqs);
    showToast('FAQ deleted', 'info');
    openFaqManagement();
  };

  // ---- Notice Management ----
  window.openNoticeManagement = function () {
    const notices = getNotices().sort((a, b) => new Date(b.date) - new Date(a.date));
    showModal('📢 Immediate Notices', `
      <div style="margin-bottom: 16px;">
        <button class="btn btn-primary btn-sm" onclick="openAddNotice()">+ Add Notice</button>
      </div>
      <div class="data-list">
        ${notices.length ? notices.map(n => `
          <div class="data-item" style="margin-bottom: 8px; border-left: 3px solid var(--warning);">
            <div class="data-item__header">
              <div class="data-item__title" style="font-size: 0.9rem;">${n.title}</div>
              <div class="data-item__actions" style="display:flex; gap:4px;">
                <button class="btn btn-ghost btn-sm" onclick="openEditNotice('${n.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteNotice('${n.id}')">🗑️</button>
              </div>
            </div>
            <div class="data-item__meta" style="font-size: 0.8rem;">${n.message.substring(0, 80)}${n.message.length > 80 ? '...' : ''}</div>
            <div class="data-item__meta text-xs text-muted mt-8">📅 ${n.date}</div>
          </div>
        `).join('') : '<p class="text-xs text-muted">No notices yet. Click "+ Add Notice" to create one.</p>'}
      </div>
    `);
  };

  window.openAddNotice = function () {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const defaultDate = `${dateStr}, ${timeStr}`;

    showModal('Add New Notice', `
      <form id="addNoticeForm">
        <div class="form-group">
          <label>Title</label>
          <input class="form-input" id="noticeTitle" placeholder="e.g. Event Postponed" required>
        </div>
        <div class="form-group">
          <label>Message / Description</label>
          <textarea class="form-input form-textarea" id="noticeMsg" placeholder="e.g. AI Workshop is postponed to 3 PM" required style="min-height: 80px;"></textarea>
        </div>
        <div class="form-group">
          <label>Date & Time</label>
          <input class="form-input" id="noticeDate" value="${defaultDate}" required>
          <p class="text-xs text-muted mt-8">Auto-filled with current date/time. You can change it.</p>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">📢 Publish Notice</button>
      </form>
    `);

    document.getElementById('addNoticeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const notices = getNotices();
      notices.push({
        id: 'n' + Date.now().toString(36),
        title: document.getElementById('noticeTitle').value.trim(),
        message: document.getElementById('noticeMsg').value.trim(),
        date: document.getElementById('noticeDate').value.trim()
      });
      saveNotices(notices);
      closeModal();
      showToast('Notice published! 📢');
      renderNotices('noticeSection');
      setTimeout(() => openNoticeManagement(), 350);
    });
  };

  window.openEditNotice = function (id) {
    const notices = getNotices();
    const n = notices.find(n => n.id === id);
    if (!n) return;

    showModal('Edit Notice', `
      <form id="editNoticeForm">
        <div class="form-group">
          <label>Title</label>
          <input class="form-input" id="noticeTitle" value="${n.title}" required>
        </div>
        <div class="form-group">
          <label>Message / Description</label>
          <textarea class="form-input form-textarea" id="noticeMsg" required style="min-height: 80px;">${n.message}</textarea>
        </div>
        <div class="form-group">
          <label>Date & Time</label>
          <input class="form-input" id="noticeDate" value="${n.date}" required>
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Save Changes</button>
      </form>
    `);

    document.getElementById('editNoticeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const notices = getNotices();
      const idx = notices.findIndex(n => n.id === id);
      if (idx === -1) return;
      notices[idx].title = document.getElementById('noticeTitle').value.trim();
      notices[idx].message = document.getElementById('noticeMsg').value.trim();
      notices[idx].date = document.getElementById('noticeDate').value.trim();
      saveNotices(notices);
      closeModal();
      showToast('Notice updated! ✅');
      renderNotices('noticeSection');
      setTimeout(() => openNoticeManagement(), 350);
    });
  };

  window.deleteNotice = function (id) {
    if (!confirm('Delete this notice?')) return;
    const notices = getNotices().filter(n => n.id !== id);
    saveNotices(notices);
    showToast('Notice deleted', 'info');
    renderNotices('noticeSection');
    openNoticeManagement();
  };

  render();
  renderNotices('noticeSection');
  injectBottomNav('network');
})();
