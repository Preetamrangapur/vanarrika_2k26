// ============================================================
// venues.js — Event Locations Page Logic (auto-generated from events)
// ============================================================

(function () {
  const listEl = document.getElementById('locationList');

  // Building SVG icon
  const buildingIcon = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="8" width="40" height="52" rx="4" fill="rgba(255,212,0,0.12)" stroke="#FFD400" stroke-width="2"/>
    <rect x="20" y="16" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="36" y="16" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="20" y="28" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="36" y="28" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="20" y="40" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="36" y="40" width="8" height="6" rx="1" fill="#FFD400" opacity="0.6"/>
    <rect x="26" y="50" width="12" height="10" rx="2" fill="#FFD400" opacity="0.8"/>
  </svg>`;

  function renderLocations() {
    const events = getEvents();

    if (!events.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📍</div><p class="empty-state__text">No events added yet — locations will appear here automatically</p></div>';
      return;
    }

    listEl.innerHTML = events.map((ev, i) => {
      return `
        <div class="loc-card animate-fadeInUp" style="animation-delay: ${i * 0.06}s;">
          <div class="loc-card__icon">
            ${buildingIcon}
          </div>
          <div class="loc-card__place">${ev.venue || 'No Location'}</div>
          <div class="loc-card__event">${ev.title}</div>
          <div class="loc-card__details">
            <div class="loc-card__detail">
              <span class="loc-card__label">Floor</span>
              <span class="loc-card__value">${ev.floor || '—'}</span>
            </div>
            <div class="loc-card__detail">
              <span class="loc-card__label">Date</span>
              <span class="loc-card__value">${formatDate(ev.date)}</span>
            </div>
            <div class="loc-card__detail">
              <span class="loc-card__label">Time</span>
              <span class="loc-card__value">${ev.time}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderLocations();
  injectBottomNav('maps');
})();
