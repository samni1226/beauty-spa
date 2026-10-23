/* ============================================
   BLOOM & GLOW SPA — Shared JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Mark active nav link ---------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-menu a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Services tabs ---------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const serviceGroups = document.querySelectorAll('.service-group');
  if (tabButtons.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        serviceGroups.forEach(g => g.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  /* ---------- Gallery filter ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
        });
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt;
        lightbox.classList.add('open');
      });
    });
    const closeLightbox = () => lightbox.classList.remove('open');
    closeBtn && closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ---------- Generic form validation helper ---------- */
  function validateField(field) {
    const wrapper = field.closest('.field');
    const errorEl = wrapper.querySelector('.error-msg');
    let message = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
      message = 'This field is required.';
    } else if (field.type === 'email' && field.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value.trim())) message = 'Enter a valid email address.';
    } else if (field.type === 'tel' && field.value.trim()) {
      const phonePattern = /^[0-9+\-\s()]{7,}$/;
      if (!phonePattern.test(field.value.trim())) message = 'Enter a valid phone number.';
    }

    wrapper.classList.toggle('invalid', !!message);
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  function wireForm(form, onValidSubmit) {
    if (!form) return;
    const fields = form.querySelectorAll('[required], input[type=email], input[type=tel]');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        const wrapper = field.closest('.field');
        if (wrapper.classList.contains('invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;
      fields.forEach(field => { if (!validateField(field)) allValid = false; });
      if (allValid) onValidSubmit(form);
    });
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  wireForm(contactForm, (form) => {
    form.style.display = 'none';
    if (contactSuccess) contactSuccess.classList.add('show');
  });

  /* ---------- Booking form ---------- */
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const summaryBox = document.getElementById('bookingSummary');

  function updateSummary() {
    if (!summaryBox || !bookingForm) return;
    const service = bookingForm.querySelector('input[name="service"]:checked');
    const date = bookingForm.querySelector('#bookingDate');
    const slot = bookingForm.querySelector('input[name="slot"]:checked');
    const name = bookingForm.querySelector('#bookingName');

    const parts = [];
    parts.push(`<strong>${name && name.value ? name.value : 'Your'}</strong> booking:`);
    parts.push(service ? service.nextElementSibling.textContent : 'a treatment');
    if (date && date.value) {
      const d = new Date(date.value + 'T00:00:00');
      parts.push('on ' + d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    if (slot) parts.push('at ' + slot.nextElementSibling.textContent);

    summaryBox.innerHTML = parts.join(' ');
  }

  if (bookingForm) {
    bookingForm.addEventListener('change', updateSummary);
    bookingForm.addEventListener('input', updateSummary);
    updateSummary();

    // Set min date to today
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    wireForm(bookingForm, (form) => {
      const requiredRadios = ['service', 'slot'];
      let ok = true;
      requiredRadios.forEach(name => {
        if (!form.querySelector(`input[name="${name}"]:checked`)) ok = false;
      });
      if (!ok) {
        alert('Please choose a treatment and a time slot before confirming.');
        return;
      }
      form.style.display = 'none';
      if (bookingSuccess) bookingSuccess.classList.add('show');
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
