// ============================================================
// gallery.js — Gallery Page Logic
// ============================================================

(function () {
  // Gallery image data — captions + paths
  // Top 10 are used for the highlight carousel, all are shown in the grid
  const galleryImages = [
    { src: 'images/gallery/gallery-1.png', caption: 'Award Ceremony — Kishkinda University' },
    { src: 'images/gallery/gallery-2.png', caption: 'Faculty Group Photo' },
    { src: 'images/gallery/gallery-3.png', caption: 'Cultural Fest — Traditional Wear' },
    { src: 'images/gallery/gallery-4.png', caption: 'Food Competition — Student Projects' },
    { src: 'images/gallery/gallery-5.png', caption: 'Culinary Arts Showcase' },
    { src: 'images/gallery/gallery-6.png', caption: 'Pot Painting Competition' },
    { src: 'images/gallery/gallery-7.png', caption: 'Mehendi Art Design' },
    { src: 'images/gallery/gallery-8.png', caption: 'Face Painting Workshop' },
    { src: 'images/gallery/gallery-9.png', caption: 'Mehendi Art — Detailed Design' },
    { src: 'images/gallery/gallery-10.png', caption: 'Peacock Craft Art' },
    { src: 'images/gallery/gallery-11.png', caption: 'Speech Competition' },
    { src: 'images/gallery/gallery-12.png', caption: 'Backstage Moments' },
    { src: 'images/gallery/gallery-13.png', caption: 'Dance Performance — Stage Show' },
    { src: 'images/gallery/gallery-14.png', caption: 'Comedy Skit — Stage Performance' },
    { src: 'images/gallery/gallery-15.png', caption: 'Dance Duo Performance' },
    { src: 'images/gallery/gallery-16.png', caption: 'Certificate Distribution' },
    { src: 'images/gallery/gallery-17.png', caption: 'Written Exam Session' },
    { src: 'images/gallery/gallery-18.png', caption: 'Closing Ceremony — Group Photo' },
    { src: 'images/gallery/gallery-19.png', caption: 'Faculty Team on Stage' },
    { src: 'images/gallery/gallery-20.png', caption: 'Cultural Fest Highlights' },
    { src: 'images/gallery/gallery-21.png', caption: 'Craft Exhibition' },
    { src: 'images/gallery/gallery-22.png', caption: 'Event Highlights' },
    { src: 'images/gallery/gallery-23.png', caption: 'Campus Life' },
    { src: 'images/gallery/gallery-24.png', caption: 'Student Activities' },
    { src: 'images/gallery/gallery-25.png', caption: 'Workshop Session' },
    { src: 'images/gallery/gallery-26.png', caption: 'Team Building Event' },
    { src: 'images/gallery/gallery-27.png', caption: 'Stage Performance' },
    { src: 'images/gallery/gallery-28.png', caption: 'Group Memories' },
    { src: 'images/gallery/gallery-29.png', caption: 'Event Ceremony' },
    { src: 'images/gallery/gallery-30.png', caption: 'Campus Fest Moments' },
    { src: 'images/gallery/gallery-31.png', caption: 'College Memories' },
  ];

  // Highlight = top 10 images
  const highlights = galleryImages.slice(0, 10);
  let currentLightboxIdx = 0;

  // Render highlight carousel
  const sliderEl = document.getElementById('gallerySlider');
  document.getElementById('highlightCount').textContent = `${highlights.length} photos`;

  highlights.forEach((img, i) => {
    sliderEl.innerHTML += `
      <div class="swiper-slide">
        <div class="gallery-slide" onclick="openLightbox(${i})">
          <img src="${img.src}" alt="${img.caption}" class="gallery-slide__img"
               onerror="this.parentElement.innerHTML='<div class=\\'gallery-slide__placeholder\\'>📷</div>'">
          <div class="gallery-slide__overlay">
            <p>${img.caption}</p>
          </div>
        </div>
      </div>
    `;
  });

  // Initialize Swiper
  new Swiper('.gallery-swiper', {
    slidesPerView: 1.15,
    spaceBetween: 12,
    centeredSlides: false,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: { delay: 3000, disableOnInteraction: false },
    loop: highlights.length > 3,
  });

  // Render all images grid
  const gridEl = document.getElementById('galleryGrid');
  document.getElementById('photoCount').textContent = `${galleryImages.length} photos`;

  gridEl.innerHTML = galleryImages.map((img, i) => `
    <div class="gallery-item animate-fadeInUp" style="animation-delay: ${i * 0.04}s" onclick="openLightbox(${i})">
      <img src="${img.src}" alt="${img.caption}" loading="lazy"
           onerror="this.parentElement.innerHTML='<div class=\\'gallery-item__placeholder\\'>📷<br><span>${img.caption}</span></div>'">
      <div class="gallery-item__overlay">
        <span>${img.caption}</span>
      </div>
    </div>
  `).join('');

  // Lightbox functions
  window.openLightbox = function (idx) {
    currentLightboxIdx = idx;
    const lb = document.getElementById('galleryLightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    img.src = galleryImages[idx].src;
    cap.textContent = galleryImages[idx].caption;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    document.getElementById('galleryLightbox').classList.remove('active');
    document.body.style.overflow = '';
  };

  window.nextImage = function () {
    currentLightboxIdx = (currentLightboxIdx + 1) % galleryImages.length;
    window.openLightbox(currentLightboxIdx);
  };

  window.prevImage = function () {
    currentLightboxIdx = (currentLightboxIdx - 1 + galleryImages.length) % galleryImages.length;
    window.openLightbox(currentLightboxIdx);
  };

  // Close lightbox on Escape key
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('galleryLightbox').classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  injectBottomNav('gallery');
})();
