// ============================================================
// faq.js — FAQ Page Accordion Logic (Admin-editable)
// ============================================================

(function () {
  const faqs = getFaqs();

  const accordionEl = document.getElementById('faqAccordion');

  if (!faqs.length) {
    accordionEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">❓</div><p class="empty-state__text">No FAQs available yet</p></div>';
  } else {
    accordionEl.innerHTML = faqs.map((faq, i) => `
      <div class="accordion-item animate-fadeInUp" style="animation-delay: ${i * 0.05}s;">
        <div class="accordion-header" onclick="toggleAccordion(${i})">
          <span>${faq.question}</span>
          <span class="icon">+</span>
        </div>
        <div class="accordion-body" id="accBody_${i}">
          <div class="accordion-body__inner"><p>${faq.answer.replace(/\n/g, '<br>')}</p></div>
        </div>
      </div>
    `).join('');
  }

  window.toggleAccordion = function (index) {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach((item, i) => {
      const body = document.getElementById('accBody_' + i);
      if (i === index) {
        item.classList.toggle('active');
        if (item.classList.contains('active')) {
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          body.style.maxHeight = '0';
        }
      } else {
        item.classList.remove('active');
        body.style.maxHeight = '0';
      }
    });
  };

  injectBottomNav('more');
})();
