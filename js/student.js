// ============================================================
// student.js — Student Dashboard Logic
// ============================================================

(function () {
  const user = requireAuth(['student']);
  if (!user) return;

  document.getElementById('studentName').textContent = `🎓 Hi, ${user.name.split(' ')[0]}`;

  window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('browseTab').classList.toggle('hidden', tab !== 'browse');
    document.getElementById('mineTab').classList.toggle('hidden', tab !== 'mine');
    document.getElementById('searchBarWrap').classList.toggle('hidden', tab !== 'browse');
    if (tab === 'mine') renderFavorites();
    else renderBrowse();
  };

  window.renderBrowse = function () {
    const events = getEvents();
    const query = (document.getElementById('searchInput').value || '').toLowerCase();

    const filtered = events.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.venue.toLowerCase().includes(query)
    );

    const listEl = document.getElementById('browseList');
    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔍</div><p class="empty-state__text">No events found</p></div>';
      return;
    }

    listEl.innerHTML = filtered.map(ev => {
      const evStatus = getEventStatus(ev.date);
      const fav = isFavorite(user.id, ev.id);
      return `
        <div class="data-item animate-fadeInUp" onclick="window.location.href='event.html?id=${ev.id}'" style="cursor: pointer;">
          <div class="data-item__header">
            <div class="data-item__title">${ev.title}</div>
            <div class="data-item__actions" style="display:flex; align-items:center; gap:6px;">
              <button class="btn btn-icon btn-ghost btn-sm" onclick="event.stopPropagation(); toggleFav('${ev.id}')" title="${fav ? 'Remove from favorites' : 'Add to favorites'}" style="font-size:1.2rem; color:${fav ? '#FFD700' : 'var(--text-secondary)'};">
                ${fav ? '★' : '☆'}
              </button>
              ${getStatusBadge(evStatus)}
            </div>
          </div>
          <div class="data-item__meta">
            📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}
          </div>
          <div class="mt-12">
            ${ev.event_registration_link
              ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openRegLink('${ev.event_registration_link}')">Register Event</button>`
              : evStatus === 'upcoming'
                ? `<span class="text-xs text-muted">Registration link not available</span>`
                : `<span class="text-xs text-muted">Event completed</span>`
            }
          </div>
        </div>
      `;
    }).join('');
  };

  function renderFavorites() {
    const favIds = getFavorites(user.id);
    const events = getEvents();
    const listEl = document.getElementById('myEventsList');

    if (!favIds.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⭐</div><p class="empty-state__text">No favorite events yet<br><span class="text-xs text-muted">Tap the ☆ star on any event to add it here</span></p></div>';
      return;
    }

    const favEvents = favIds.map(id => events.find(e => e.id === id)).filter(Boolean);
    if (!favEvents.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⭐</div><p class="empty-state__text">No favorite events found</p></div>';
      return;
    }

    listEl.innerHTML = favEvents.map(ev => {
      const evStatus = getEventStatus(ev.date);
      return `
        <div class="data-item animate-fadeInUp" onclick="window.location.href='event.html?id=${ev.id}'" style="cursor: pointer;">
          <div class="data-item__header">
            <div class="data-item__title">${ev.title}</div>
            <div class="data-item__actions" style="display:flex; align-items:center; gap:6px;">
              <button class="btn btn-icon btn-ghost btn-sm" onclick="event.stopPropagation(); toggleFav('${ev.id}')" title="Remove from favorites" style="font-size:1.2rem; color:#FFD700;">
                ★
              </button>
              ${getStatusBadge(evStatus)}
            </div>
          </div>
          <div class="data-item__meta">
            📍 ${ev.venue} · 📅 ${formatDate(ev.date)} · ${ev.time}
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleFav = function(eventId) {
    const added = toggleFavorite(user.id, eventId);
    showToast(added ? 'Added to favorites ⭐' : 'Removed from favorites', added ? 'success' : 'info');
    renderBrowse();
    // Also refresh favorites tab if visible
    const mineTab = document.getElementById('mineTab');
    if (!mineTab.classList.contains('hidden')) renderFavorites();
  };

  window.openRegLink = function(link) {
    if (link) {
      window.open(link, '_blank');
    }
  };

  renderBrowse();
  renderNotices('noticeSection');
  injectBottomNav('network');
})();
