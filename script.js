// Tahun otomatis di footer
document.getElementById('tahun').textContent = new Date().getFullYear();

// Tampilkan logo hanya kalau berhasil dimuat, kalau tidak tetap pakai inisial
document.querySelectorAll('.tool-logo img').forEach(img => {
  const ok = () => img.parentElement.classList.add('loaded');
  img.addEventListener('load', ok);
  if (img.complete && img.naturalWidth > 0) ok();
});

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

// menu menutup otomatis setelah salah satu link diklik
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll halus saat klik menu navigasi
document.querySelectorAll('.nav-links a').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});