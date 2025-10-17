
// main.js
import { renderLibrary, initLibraryEvents } from './library.js';
import { loadCapsule, renderLearnSelector } from './learn.js';
import { editingId, createFlashcardRow, createQuizRow } from './author.js';
import { $, $$ } from './utils.js';

const sections = {library:$('#library'), author:$('#author'), learn:$('#learn')};
const navLinks = $$('a.nav-link');

// SPA toggle
navLinks.forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const target = link.dataset.target;
    Object.values(sections).forEach(s=>s.classList.add('d-none'));
    sections[target].classList.remove('d-none');
    navLinks.forEach(l=>l.classList.remove('active'));
    link.classList.add('active');
    if(target==='learn') renderLearnSelector();
  });
});

// Library buttons
initLibraryEvents(
  id=>{ // Learn
    Object.values(sections).forEach(s=>s.classList.add('d-none'));
    sections.learn.classList.remove('d-none');
    document.querySelector('a[data-target="learn"]').classList.add('active');
    renderLearnSelector();
    $('#learnSelector').value=id;
    $('#learnSelector').dispatchEvent(new Event('change'));
  },
  id=>{ // Edit
    Object.values(sections).forEach(s=>s.classList.add('d-none'));
    sections.author.classList.remove('d-none');
    document.querySelector('a[data-target="author"]').classList.add('active');
    const capsule = loadFromStorage(`pc_capsule_${id}`);
    if(capsule){
      editingId = id;
      $('#titleInput').value=capsule.meta.title;
      $('#subjectInput').value=capsule.meta.subject;
      $('#levelInput').value=capsule.meta.level;
      $('#descInput').value=capsule.meta.description;
      $('#notesInput').value=capsule.notes.join('\n');
      $('#flashcardsList').innerHTML='';
      capsule.flashcards.forEach(f=>createFlashcardRow(f.front,f.back));
      $('#quizList').innerHTML='';
      capsule.quiz.forEach(q=>createQuizRow(q.question,q.choices,q.answer));
    }
  }
);

renderLibrary();
