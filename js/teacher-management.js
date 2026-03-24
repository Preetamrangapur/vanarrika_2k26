// ============================================================
// teacher-management.js — Admin Teacher Management Logic
// ============================================================

(function () {
  const user = requireAuth(['admin']);
  if (!user) return;

  let currentFilter = 'all';

  window.switchTeacherTab = function (tab) {
    currentFilter = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    renderTeachers();
  };

  function getAllTeachers() {
    const approvedTeachers = getUsers().filter(u => u.role === 'teacher');
    const pendingTeachers = getPendingTeachers();
    const list = [];

    pendingTeachers.forEach(t => {
      list.push({
        id: t.id, name: t.name, email: t.email, password: t.password,
        department: t.department || '', status: t.status || 'pending',
        requestedAt: t.requestedAt || '', source: 'pending',
        phone: t.phone || '', employee_id: t.employee_id || '',
        coordinators: t.coordinators || []
      });
    });

    approvedTeachers.forEach(t => {
      list.push({
        id: t.id, name: t.name, email: t.email, password: t.password,
        department: t.department || '', status: 'approved',
        requestedAt: '', source: 'approved',
        phone: t.phone || '', employee_id: t.employee_id || '',
        coordinators: t.coordinators || []
      });
    });

    return list;
  }

  function renderTeachers() {
    const all = getAllTeachers();
    const pending = all.filter(t => t.status === 'pending');
    const approved = all.filter(t => t.status === 'approved');
    const rejected = all.filter(t => t.status === 'rejected');

    document.getElementById('teacherStats').innerHTML = `
      <div class="stat-card"><div class="stat-card__value">${all.length}</div><div class="stat-card__label">Total</div></div>
      <div class="stat-card"><div class="stat-card__value">${pending.length}</div><div class="stat-card__label">Pending</div></div>
      <div class="stat-card"><div class="stat-card__value">${approved.length}</div><div class="stat-card__label">Approved</div></div>
      <div class="stat-card"><div class="stat-card__value">${rejected.length}</div><div class="stat-card__label">Rejected</div></div>
    `;

    let filtered = all;
    if (currentFilter === 'pending') filtered = pending;
    else if (currentFilter === 'approved') filtered = approved;

    const listEl = document.getElementById('teacherList');
    if (!filtered.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">👨‍🏫</div>
          <p class="empty-state__text">No ${currentFilter === 'all' ? '' : currentFilter + ' '}teachers found</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(t => {
      return `
        <div class="data-item animate-fadeInUp" style="border-left: 3px solid ${getStatusColor(t.status)}; cursor: pointer;" onclick="openTeacherDetail('${t.id}', '${t.source}')">
          <div class="data-item__header">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: ${getAvatarBg(t.status)}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #000; flex-shrink: 0;">
                ${t.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="data-item__title" style="margin-bottom: 2px;">${t.name}</div>
                <div class="text-xs text-muted">📧 ${t.email}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getTeacherStatusBadge(t.status)}
              ${t.status === 'approved' ? `<button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteTeacher('${t.id}')">🗑️</button>` : ''}
              ${t.status === 'rejected' ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); removePendingTeacher('${t.id}')">🗑️</button>` : ''}
            </div>
          </div>
          <div class="data-item__meta mt-8">
            🏢 Department: ${t.department || '—'}
            ${t.phone ? '<br>📞 ' + t.phone : ''}${t.employee_id ? ' · 🪪 ' + t.employee_id : ''}
            ${t.requestedAt ? '<br>📅 Requested: ' + formatDate(t.requestedAt) : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ---- Teacher Detail / Edit Modal ----
  window.openTeacherDetail = function (id, source) {
    let teacher, isPending;

    if (source === 'pending') {
      const pending = getPendingTeachers();
      teacher = pending.find(t => t.id === id);
      isPending = true;
    } else {
      const users = getUsers();
      teacher = users.find(u => u.id === id);
      isPending = false;
    }

    if (!teacher) return;

    const status = isPending ? (teacher.status || 'pending') : 'approved';
    const statusOpts = ['pending', 'approved', 'rejected'].map(s =>
      `<option value="${s}" ${s === status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
    ).join('');



    showModal('Teacher Details', `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: ${getAvatarBg(status)}; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; color: #000; margin: 0 auto 12px;">
          ${teacher.name.charAt(0).toUpperCase()}
        </div>
        ${getTeacherStatusBadge(status)}
      </div>

      <form id="editTeacherForm">
        <div class="form-group">
          <label>Teacher Name</label>
          <input class="form-input" id="etName" value="${teacher.name}" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input class="form-input" id="etPhone" value="${teacher.phone || ''}" placeholder="e.g. 9876543210">
        </div>
        <div class="form-group">
          <label>USN / Employee ID</label>
          <input class="form-input" id="etEmpId" value="${teacher.employee_id || ''}" placeholder="e.g. T101">
        </div>
        <div class="form-group">
          <label>Department</label>
          <input class="form-input" id="etDept" value="${teacher.department || ''}" placeholder="e.g. Computer Science">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-input" value="${teacher.email}" disabled style="opacity: 0.5;">
          <p class="text-xs text-muted mt-8">Email cannot be changed</p>
        </div>


        ${isPending ? `
          <div class="form-group">
            <label>Status</label>
            <select class="form-input form-select" id="etStatus">${statusOpts}</select>
          </div>
        ` : ''}
        <button type="submit" class="btn btn-primary btn-block mt-12">💾 Save Changes</button>
      </form>

      ${isPending && status === 'pending' ? `
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn btn-success" style="flex:1;" onclick="closeModal(); approveTeacher('${id}')">✅ Approve</button>
          <button class="btn btn-danger" style="flex:1;" onclick="closeModal(); rejectTeacher('${id}')">❌ Reject</button>
        </div>
      ` : ''}
    `);

    document.getElementById('editTeacherForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const newName = document.getElementById('etName').value.trim();
      const newPhone = document.getElementById('etPhone').value.trim();
      const newEmpId = document.getElementById('etEmpId').value.trim();
      const newDept = document.getElementById('etDept').value.trim();

      const statusEl = document.getElementById('etStatus');
      const newStatus = statusEl ? statusEl.value : null;

      if (!newName) return;

      if (isPending) {
        const pending = getPendingTeachers();
        const idx = pending.findIndex(t => t.id === id);
        if (idx === -1) return;

        pending[idx].name = newName;
        pending[idx].phone = newPhone;
        pending[idx].employee_id = newEmpId;
        pending[idx].department = newDept;


        if (newStatus && newStatus !== pending[idx].status) {
          if (newStatus === 'approved') {
            pending.splice(idx, 1);
            savePendingTeachers(pending);
            const users = getUsers();
            users.push({
              id: teacher.id, name: newName, email: teacher.email,
              password: teacher.password, role: 'teacher',
              department: newDept, avatar: '',
              phone: newPhone, employee_id: newEmpId,

            });
            saveUsers(users);
            closeModal();
            showToast(`${newName} approved as Teacher! ✅`);
            renderTeachers();
            return;
          } else {
            pending[idx].status = newStatus;
          }
        }
        savePendingTeachers(pending);
      } else {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return;
        users[idx].name = newName;
        users[idx].phone = newPhone;
        users[idx].employee_id = newEmpId;
        users[idx].department = newDept;

        saveUsers(users);
      }

      closeModal();
      showToast('Teacher details updated ✅');
      renderTeachers();
    });
  };

  // ---- Helper Functions ----
  function getTeacherStatusBadge(status) {
    switch (status) {
      case 'pending':  return '<span class="badge" style="background: rgba(255,165,2,0.2); color: #FFA502;">⏳ PENDING</span>';
      case 'approved': return '<span class="badge" style="background: rgba(0,201,167,0.2); color: #00C9A7;">✅ APPROVED</span>';
      case 'rejected': return '<span class="badge" style="background: rgba(255,71,87,0.2); color: #FF4757;">❌ REJECTED</span>';
      default:         return '';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending':  return 'var(--warning)';
      case 'approved': return 'var(--success)';
      case 'rejected': return 'var(--danger)';
      default:         return 'var(--border-glass)';
    }
  }

  function getAvatarBg(status) {
    switch (status) {
      case 'pending':  return 'rgba(255,165,2,0.7)';
      case 'approved': return 'rgba(0,201,167,0.7)';
      case 'rejected': return 'rgba(255,71,87,0.7)';
      default:         return 'rgba(255,255,255,0.2)';
    }
  }

  // ---- Actions ----
  window.approveTeacher = function (id) {
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;

    const teacher = pending[idx];
    pending.splice(idx, 1);
    savePendingTeachers(pending);

    const users = getUsers();
    users.push({
      id: teacher.id, name: teacher.name, email: teacher.email,
      password: teacher.password, role: 'teacher',
      department: teacher.department || '', avatar: '',
      phone: teacher.phone || '', employee_id: teacher.employee_id || '',
      coordinators: teacher.coordinators || []
    });
    saveUsers(users);
    showToast(`${teacher.name} approved as Teacher! ✅`);
    renderTeachers();
  };

  window.rejectTeacher = function (id) {
    if (!confirm('Are you sure you want to reject this teacher registration?')) return;
    const pending = getPendingTeachers();
    const idx = pending.findIndex(t => t.id === id);
    if (idx === -1) return;
    pending[idx].status = 'rejected';
    savePendingTeachers(pending);
    showToast(`${pending[idx].name}'s registration rejected`, 'info');
    renderTeachers();
  };

  window.removePendingTeacher = function (id) {
    const pending = getPendingTeachers().filter(t => t.id !== id);
    savePendingTeachers(pending);
    showToast('Teacher record removed');
    renderTeachers();
  };

  window.deleteTeacher = function (id) {
    if (!confirm('Are you sure you want to delete this teacher account?')) return;
    const users = getUsers();
    const teacher = users.find(u => u.id === id);
    if (!teacher) return;

    const updated = users.filter(u => u.id !== id);
    saveUsers(updated);

    const events = getEvents();
    events.forEach(ev => {
      if (ev.assignedTeacher === teacher.email) ev.assignedTeacher = '';
    });
    saveEvents(events);

    showToast(`${teacher.name} deleted`, 'info');
    renderTeachers();
  };

  renderTeachers();
  injectBottomNav('network');
})();
