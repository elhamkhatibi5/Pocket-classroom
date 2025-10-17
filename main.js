
// main.js
import { renderLibrary, initLibraryEvents } from './library.js';
import { renderLearnSelector, loadCapsule } from './learn.js';
import { $, loadFromStorage, saveToStorage } from './utils.js';
import { createFlashcardRow, createQuizRow, notesInput, flashcardsList, quizList, editingId as authorEditingId } from './author.js';

// Sections & Navbar
const sections = {
  library: $('#library'),
  author: $('#author'),
  learn: $('#learn')
};
const navLinks = document.querySelectorAll('.nav-link');

// SPA toggle: show section
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.target || link.getAttribute('href').substring(1);
    Object.values(sections).forEach(s => s.classList.add('d-none'));
    sections[target].classList.remove('d-none');
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    if (target === 'learn') renderLearnSelector();
  });
});

// Library buttons: Learn/Edit/Export/Delete
initLibraryEvents(
  (id) => {
    // Learn button clicked
    Object.values(sections).forEach(s => s.classList.add('d-none'));
    sections['learn'].classList.remove('d-none');
    document.querySelector('.nav-link[href="#learn"]').classList.add('active');

    renderLearnSelector();
    const learnSelector = $('#learnSelector');
    learnSelector.value = id;
    learnSelector.dispatchEvent(new Event('change'));
  },
  (id) => {
    // Edit button clicked
    Object.values(sections).forEach(s => s.classList.add('d-none'));
    sections['author'].classList.remove('d-none');
    document.querySelector('.nav-link[href="#author"]').classList.add('active');

    // Load capsule into Author form
    const capsule = loadFromStorage(`pc_capsule_${id}`);
    if (capsule) {
      window.editingId = id; // make editingId global for author.js
      $('#titleInput').value = capsule.meta.title;
      $('#subjectInput').value = capsule.meta.subject;
      $('#levelInput').value = capsule.meta.level;
      $('#descInput').value = capsule.meta.description;
      notesInput.value = capsule.notes.join('\n');

      // Flashcards
      flashcardsList.innerHTML = '';
      capsule.flashcards.forEach(f => createFlashcardRow(f.front, f.back));

      // Quiz
      quizList.innerHTML = '';
      capsule.quiz.forEach(q => createQuizRow(q.question, q.choices, q.answer));
    }
  }
);

// Initial render
renderLibrary();

// Theme toggle (Light/Dark)
$('#themeToggle').addEventListener('click', () => {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
  const icon = $('#themeToggle i');
  icon.classList.toggle('bi-moon-stars');
  icon.classList.toggle('bi-sun');
});
