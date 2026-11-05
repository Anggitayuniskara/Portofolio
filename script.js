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
// Kembali ke kartu project yang terakhir dibuka, bukan ke awal daftar project
document.querySelectorAll('a.project-card, a.feat-card').forEach(function (card) {
  card.addEventListener('click', function () {
    try { sessionStorage.setItem('projectTerakhir', card.getAttribute('href')); } catch (e) {}
  });
});

(function () {
  if (location.hash !== '#proyek') return;
  var href = null;
  try { href = sessionStorage.getItem('projectTerakhir'); } catch (e) {}
  if (!href) return;
  var card = document.querySelector('a.project-card[href="' + href + '"]');
  if (!card) return;
  var ke = function () {
    var y = card.getBoundingClientRect().top + window.scrollY - (window.innerHeight - card.offsetHeight) / 2;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  };
  ke();
  window.addEventListener('load', ke);
  card.classList.add('baru-dibuka');
  setTimeout(function () { card.classList.remove('baru-dibuka'); }, 2500);
})();

// Saring daftar project dari kategori di footer
(function () {
  var line = document.getElementById('filterLine');
  var cards = Array.prototype.slice.call(document.querySelectorAll('a.project-card'));
  var proyek = document.getElementById('proyek');
  if (!line || !proyek) return;
  function tampil(k, nama) {
    var n = 0;
    cards.forEach(function (c) {
      var ok = !k || (' ' + c.dataset.cat + ' ').indexOf(' ' + k + ' ') > -1;
      c.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    if (k) {
      line.innerHTML = 'Showing ' + n + ' projects in <strong>' + nama + '</strong>. <button type="button" id="filterAll">Show all projects</button>';
      line.hidden = false;
      document.getElementById('filterAll').addEventListener('click', function () { tampil(null); });
    } else {
      line.hidden = true; line.innerHTML = '';
      document.querySelectorAll('.cat-row a').forEach(function (x) { x.classList.remove('on'); });
    }
  }
  document.querySelectorAll('[data-filter]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      tampil(a.dataset.filter, a.innerHTML);
      document.querySelectorAll('.cat-row a').forEach(function (x) { x.classList.toggle('on', x.dataset.filter === a.dataset.filter); });
      (document.getElementById('semua-project') || proyek).scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
