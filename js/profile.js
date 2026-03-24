// ============================================================
// profile.js — Profile Page Logic
// ============================================================

(function () {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const initial = user.name.charAt(0).toUpperCase();
  const regs = getRegistrations().filter(r => r.userId === user.id);
  const roleBadge = `<span class="badge badge--${user.role}" style="margin-left: 8px;">${user.role.toUpperCase()}</span>`;

  // Profile Header
  document.getElementById('profileHeader').innerHTML = `
    <div class="profile-avatar">${initial}</div>
    <div class="profile-name">${user.name} ${roleBadge}</div>
    <div class="profile-email">${user.email}</div>
    <p class="text-sm text-muted mt-8">${regs.length} event registration${regs.length !== 1 ? 's' : ''}</p>
  `;



  // Actions
  document.getElementById('profileActions').innerHTML = `
    <div class="profile-action" onclick="showEditProfile()">
      <div class="profile-action__icon" style="background: rgba(0,201,167,0.15); color: var(--success);">✏️</div>
      <div class="profile-action__text"><h4>Edit Profile</h4><p>Update your information</p></div>
      <div class="profile-action__arrow">›</div>
    </div>
    <a href="faq.html" class="profile-action">
      <div class="profile-action__icon" style="background: rgba(255,165,2,0.15); color: var(--warning);">❓</div>
      <div class="profile-action__text"><h4>FAQ & Help</h4><p>Frequently asked questions</p></div>
      <div class="profile-action__arrow">›</div>
    </a>
    <div class="profile-action" onclick="logout()" style="border-color: rgba(255,71,87,0.3);">
      <div class="profile-action__icon" style="background: rgba(255,71,87,0.15); color: var(--danger);">🚪</div>
      <div class="profile-action__text"><h4>Logout</h4><p>Sign out of your account</p></div>
      <div class="profile-action__arrow">›</div>
    </div>
  `;


  window.showEditProfile = function () {
    showModal('Edit Profile', `
      <form onsubmit="saveProfile(event)">
        <div class="form-group">
          <label>Name</label>
          <input class="form-input" id="editName" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-input" value="${user.email}" disabled style="opacity: 0.5;">
        </div>
        <button type="submit" class="btn btn-primary btn-block mt-12">Save Changes</button>
      </form>
    `);
  };

  window.saveProfile = function (e) {
    e.preventDefault();
    const newName = document.getElementById('editName').value.trim();
    if (!newName) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].name = newName;
      saveUsers(users);
      // Update session
      const session = getCurrentUser();
      session.name = newName;
      localStorage.setItem('cem_session', JSON.stringify(session));
    }
    closeModal();
    showToast('Profile updated!');
    setTimeout(() => location.reload(), 500);
  };


  injectBottomNav('more');
})();
