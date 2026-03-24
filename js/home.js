// ============================================================
// home.js — Home Page Logic
// ============================================================

(function () {
  // Greeting
  const user = getCurrentUser();
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  document.getElementById('greetingTime').textContent = greeting;
  document.getElementById('greetingName').textContent = user ? `Hi, ${user.name.split(' ')[0]}!` : 'Welcome, Guest!';

  const events = getEvents();

  // Featured Slider
  const featured = events.filter(e => e.featured);
  const sliderEl = document.getElementById('featuredSlider');
  featured.forEach(ev => {
    sliderEl.innerHTML += `
      <div class="swiper-slide">
        <a href="event.html?id=${ev.id}" class="slider-card">
          <img src="${ev.image}" alt="${ev.title}" class="slider-card__img"
               onerror="this.style.display='none'; this.parentElement.querySelector('.img-placeholder').style.display='flex';">
          <div class="img-placeholder" style="display:none; position:absolute; inset:0;">🎯</div>
          <div class="slider-card__overlay">
            <h3>${ev.title}</h3>
            <p>📍 ${ev.venue} · 📅 ${formatDate(ev.date)}</p>
          </div>
        </a>
      </div>
    `;
  });

  new Swiper('.featured-swiper', {
    slidesPerView: 1.1,
    spaceBetween: 12,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: { delay: 4000, disableOnInteraction: false },
  });

  // Render events (uses dynamic status based on date)
  function renderEvents() {
    const upcoming = events.filter(e => getEventStatus(e.date) === 'upcoming');
    const completed = events.filter(e => getEventStatus(e.date) === 'completed');

    document.getElementById('upcomingEvents').innerHTML = upcoming.length
      ? upcoming.map(e => eventCardHTML(e)).join('')
      : '<div class="empty-state"><p class="empty-state__text">No upcoming events</p></div>';

    document.getElementById('completedEvents').innerHTML = completed.length
      ? completed.map(e => eventCardHTML(e)).join('')
      : '<div class="empty-state"><p class="empty-state__text">No completed events</p></div>';
  }

  function eventCardHTML(ev) {
    return `
      <a href="event.html?id=${ev.id}" class="event-card event-card--horizontal">
        <img src="${ev.image}" alt="${ev.title}" class="event-card__image"
             onerror="this.outerHTML='<div class=\\'event-card__image img-placeholder\\'>🎪</div>'">
        <div class="event-card__body">
          <div class="event-card__title">${ev.title}</div>
          <div class="event-card__meta">
            <span>📍 ${ev.venue}${ev.floor ? ' · 🏢 ' + ev.floor : ''}</span>
            <span>📅 ${formatDate(ev.date)} · ${ev.time}</span>
          </div>
          <div class="event-card__footer">
            ${getStatusBadge(getEventStatus(ev.date))}
          </div>
        </div>
      </a>
    `;
  }

  renderEvents();
  renderNotices('noticeSection');
  injectBottomNav('home');
})();
