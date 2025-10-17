// learn.js
import { $, loadFromStorage, saveToStorage } from './utils.js';

let currentIndex = 0;
let currentCapsule = null;
let knownCards = [];

const flashcardDisplay = $('#flashcardDisplay');
const learnSelector = $('#learnSelector');
const notesList = $('#notesList');

// Render capsule in Learn Mode
export const renderLearnSelector = () => {
  const index = loadFromStorage('pc_capsules_index') || [];
  learnSelector.innerHTML = '';
  index.forEach(c=>{
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.title;
    learnSelector.appendChild(option);
  });
}

// Load selected capsule
learnSelector.addEventListener('change', ()=>{
  const id = learnSelector.value;
  loadCapsule(id);
});

export const loadCapsule = (id) => {
  currentCapsule = loadFromStorage(`pc_capsule_${id}`);
  currentIndex = 0;
  knownCards = loadFromStorage(`pc_progress_${id}`)?.knownFlashcards || [];
  renderNotes();
  renderFlashcard();
}

// Notes
const renderNotes = () => {
  notesList.innerHTML = '';
  if(!currentCapsule) return;
  currentCapsule.notes.forEach(n=>{
    const li = document.createElement('li');
    li.textContent = n;
    notesList.appendChild(li);
  });
}

// Flashcards
const renderFlashcard = () => {
  if(!currentCapsule || currentCapsule.flashcards.length===0){
    flashcardDisplay.textContent = 'No flashcards';
    return;
  }
  const card = currentCapsule.flashcards[currentIndex];
  flashcardDisplay.textContent = card.front;
}

// Next / Prev / Flip
$('#nextCardBtn').addEventListener('click', ()=>{
  if(!currentCapsule) return;
  currentIndex = (currentIndex+1) % currentCapsule.flashcards.length;
  renderFlashcard();
});
$('#prevCardBtn').addEventListener('click', ()=>{
  if(!currentCapsule) return;
  currentIndex = (currentIndex-1+currentCapsule.flashcards.length) % currentCapsule.flashcards.length;
  renderFlashcard();
});
$('#flipCardBtn').addEventListener('click', ()=>{
  if(!currentCapsule) return;
  const card = currentCapsule.flashcards[currentIndex];
  flashcardDisplay.textContent = flashcardDisplay.textContent===card.front ? card.back : card.front;
});
