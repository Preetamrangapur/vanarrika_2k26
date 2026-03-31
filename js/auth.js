// ============================================================
// auth.js — Authentication & Role-Based Access Control
// ============================================================

function login(email, password) {
  // Check if teacher is pending approval
  const pending = getPendingTeachers();
  const pendingUser = pending.find(u => u.email === email && u.password === password);
  if (pendingUser) {
    if (pendingUser.status === 'rejected') {
      return { success: false, message: 'Your teacher registration was rejected by the admin.' };
    }
    return { success: false, message: 'Your teacher account is pending admin approval. Please wait for the admin to approve your registration.' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('cem_session', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: 'Invalid email or password' };
}

function logout() {
  localStorage.removeItem('cem_session');
  window.location.href = 'login.html';
}

function getCurrentUser() {
  const session = localStorage.getItem('cem_session');
  if (!session) return null;
  try { return JSON.parse(session); } catch { return null; }
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function requireAuth(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    redirectToDashboard(user.role);
    return null;
  }
  return user;
}

function redirectToDashboard(role) {
  switch (role) {
    case 'admin':   window.location.href = 'admin.html';   break;
    case 'teacher': window.location.href = 'teacher.html'; break;
    case 'student': window.location.href = 'student.html'; break;
    default:        window.location.href = 'student.html'; break;
  }
}

function getRoleBadgeColor(role) {
  switch (role) {
    case 'admin':   return '#FFD400';
    case 'teacher': return '#00C9A7';
    case 'student': return '#6C63FF';
    default:        return '#888';
  }
}
