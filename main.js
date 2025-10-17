
// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
body.classList.add(localStorage.getItem('pc_theme') || 'dark-mode');

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('dark-mode')) {
    body.classList.replace('dark-mode', 'light-mode');
    themeToggle.textContent = '🌙';
    localStorage.setItem('pc_theme', 'light-mode');
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    themeToggle.textContent = '☀️';
    localStorage.setItem('pc_theme', 'dark-mode');
  }
});

// Section toggle
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.app-section');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.target;

    sections.forEach(sec => sec.classList.add('d-none'));
    document.getElementById(target).classList.remove('d-none');

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
