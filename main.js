
import { $, $$, loadJSON, saveJSON, slugify, timeAgo } from './utils.js';

const navLinks = $$('nav .nav-link');
const sections = $$('.app-section');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.target;
    sections.forEach(s => s.classList.add('d-none'));
    $(`#${target}`).classList.remove('d-none');
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Theme toggle
const themeBtn = $('#theme-toggle');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

// Library grid render
export function renderLibrary() {
  const grid = $('#capsules-grid');
  const index = loadJSON('pc_capsules_index', []);
  grid.innerHTML = '';
  if (!index.length) {
    grid.innerHTML = `<p class="text-muted">No capsules found. Create a new one!</p>`;
    return;
  }
  index.forEach(c => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card capsule-card p-3">
        <h5>${c.title}</h5>
        <p>${c.subject || ''} <span class="badge badge-level">${c.level}</span></p>
        <small class="text-muted">Updated: ${timeAgo(c.updatedAt)}</small>
        <div class="mt-2 d-flex justify-content-between">
          <button class="btn btn-sm btn-primary learn-btn" data-id="${c.id}">Learn</button>
          <button class="btn btn-sm btn-warning edit-btn" data-id="${c.id}">Edit</button>
          <button class="btn btn-sm btn-info export-btn" data-id="${c.id}">Export</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${c.id}">Delete</button>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

// Load library on start
document.addEventListener('DOMContentLoaded', renderLibrary);
