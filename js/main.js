/* ===== Momidev Coffee House — minimal main.js (no enquiry, no feedback) ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for internal hash links like <a href="#section-id">
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
