// ============================================================
// login.js — Login Page Interactivity
// EvonDrive — College Event Management Platform
// Handles: validation, floating labels, password toggle,
//          dark mode, remember me, toasts, loading spinner
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- DOM References ----------
  const loginForm      = document.getElementById('loginForm');
  const emailInput     = document.getElementById('email');
  const passwordInput  = document.getElementById('password');
  const loginBtn       = document.getElementById('loginBtn');
  const rememberCheck  = document.getElementById('rememberMe');
  const themeToggle    = document.getElementById('themeToggle');
  const passwordToggle = document.getElementById('passwordToggle');
  const forgotLink     = document.getElementById('forgotLink');
  const forgotModal    = document.getElementById('forgotModal');
  const closeModalBtn  = document.getElementById('closeModal');
  const toastContainer = document.getElementById('toastContainer');

  // ---------- Redirect if already logged in ----------
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    const user = getCurrentUser();
    if (user) { redirectToDashboard(user.role); }
    return;
  }

  // ---------- Floating Labels ----------
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    // Check initial value (e.g., autofill)
    if (input.value.trim() !== '') input.classList.add('has-value');

    input.addEventListener('input', () => {
      input.classList.toggle('has-value', input.value.trim() !== '');
    });

    input.addEventListener('blur', () => {
      input.classList.toggle('has-value', input.value.trim() !== '');
    });
  });

  // ---------- Show / Hide Password ----------
  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.setAttribute('aria-label',
      isPassword ? 'Hide password' : 'Show password'
    );
    // Toggle icon visibility via CSS
  });

  // ---------- Dark Mode Toggle ----------
  const savedTheme = localStorage.getItem('cem_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('cem_theme', isLight ? 'light' : 'dark');
    // Update toggle icon
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    icon.textContent = isLight ? '☀️' : '🌙';
    const label = themeToggle.querySelector('.theme-toggle__label');
    if (label) label.textContent = isLight ? 'Light' : 'Dark';
  });

  // Initialize icon based on theme
  (() => {
    const isLight = document.body.classList.contains('light-mode');
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    icon.textContent = isLight ? '☀️' : '🌙';
    const label = themeToggle.querySelector('.theme-toggle__label');
    if (label) label.textContent = isLight ? 'Light' : 'Dark';
  })();

  // ---------- Remember Me ----------
  const savedEmail = localStorage.getItem('cem_remembered_email');
  if (savedEmail) {
    emailInput.value = savedEmail;
    emailInput.classList.add('has-value');
    rememberCheck.checked = true;
  }

  // ---------- Forgot Password Modal ----------
  const resetForm       = document.getElementById('resetForm');
  const resetEmailInput = document.getElementById('resetEmail');
  const newPassInput    = document.getElementById('newPassword');
  const confirmPassInput= document.getElementById('confirmPassword');
  const resetBtn        = document.getElementById('resetBtn');

  // Wire up floating labels inside modal
  [resetEmailInput, newPassInput, confirmPassInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => input.classList.toggle('has-value', input.value.trim() !== ''));
    input.addEventListener('blur',  () => input.classList.toggle('has-value', input.value.trim() !== ''));
  });

  function openResetModal() {
    forgotModal.classList.add('active');
    // Clear previous values
    if (resetForm) resetForm.reset();
    [resetEmailInput, newPassInput, confirmPassInput].forEach(i => { if (i) i.classList.remove('has-value'); });
  }

  function closeResetModal() {
    forgotModal.classList.remove('active');
  }

  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    openResetModal();
  });

  closeModalBtn.addEventListener('click', closeResetModal);

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) closeResetModal();
  });

  // Handle password reset submission
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email      = resetEmailInput.value.trim();
      const newPass    = newPassInput.value;
      const confirmPass = confirmPassInput.value;

      // Validate fields
      if (!email) {
        showToast('Please enter your registered email', 'error');
        resetEmailInput.focus();
        return;
      }
      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        resetEmailInput.focus();
        return;
      }
      if (!newPass) {
        showToast('Please enter a new password', 'error');
        newPassInput.focus();
        return;
      }
      if (newPass.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        newPassInput.focus();
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Passwords do not match', 'error');
        confirmPassInput.focus();
        return;
      }

      // Look up user in localStorage
      if (typeof getUsers === 'function') {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) {
          showToast('No account found with this email', 'error');
          resetEmailInput.focus();
          return;
        }

        // Show spinner
        resetBtn.classList.add('btn--loading');

        setTimeout(() => {
          // Update password
          users[userIndex].password = newPass;
          localStorage.setItem('cem_users', JSON.stringify(users));

          resetBtn.classList.remove('btn--loading');
          closeResetModal();
          showToast('Password reset successful! You can now sign in.', 'success');
        }, 1200);
      } else {
        showToast('User data unavailable', 'error');
      }
    });
  }

  // ---------- Validation Helpers ----------
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      error:   '⚠️',
      success: '✅',
      info:    'ℹ️'
    };

    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Auto-remove after 3.5s
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---------- Form Submit ----------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email && !password) {
      showToast('Please enter your email and password', 'error');
      emailInput.focus();
      return;
    }

    if (!email) {
      showToast('Please enter your email address', 'error');
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      emailInput.focus();
      return;
    }

    if (!password) {
      showToast('Please enter your password', 'error');
      passwordInput.focus();
      return;
    }

    if (password.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      passwordInput.focus();
      return;
    }

    // Remember Me
    if (rememberCheck.checked) {
      localStorage.setItem('cem_remembered_email', email);
    } else {
      localStorage.removeItem('cem_remembered_email');
    }

    // Show loading spinner
    loginBtn.classList.add('btn--loading');

    // Fake loading delay then authenticate
    setTimeout(() => {
      if (typeof login === 'function') {
        const result = login(email, password);

        if (result.success) {
          showToast('Login successful! Redirecting…', 'success');
          setTimeout(() => {
            redirectToDashboard(result.user.role);
          }, 800);
        } else {
          loginBtn.classList.remove('btn--loading');
          showToast(result.message || 'Invalid email or password', 'error');
          // Shake button
          loginBtn.style.animation = 'shake 0.4s ease';
          setTimeout(() => loginBtn.style.animation = '', 400);
        }
      } else {
        // Fallback — no auth.js
        loginBtn.classList.remove('btn--loading');
        showToast('Authentication service unavailable', 'error');
      }
    }, 1500);
  });

  // ---------- Shake Keyframe (inject dynamically) ----------
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(styleSheet);
});
