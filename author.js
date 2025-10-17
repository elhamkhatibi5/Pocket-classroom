
// author.js
import { $, saveToStorage, loadFromStorage, generateId, renderLibrary } from './utils.js';

const metaForm = $('#metaForm');
const notesInput = $('#notesInput');
const flashcardsList = $('#flashcardsList');
const addFlashcardBtn = $('#addFlashcardBtn');
const quizList = $('#quizList');
const addQuestionBtn = $('#addQuestionBtn');
let editingId = null;

// Flashcard row
const createFlashcardRow = (front='', back='') => {
  const div = document.createElement('div');
  div.className = 'd-flex mb-2 gap-2';
  div.innerHTML = `
    <input type="text" class="form-control form-control-sm flashFront" placeholder="Front" value="${front}">
    <input type="text" class="form-control form-control-sm flashBack" placeholder="Back" value="${back}">
    <button class="btn btn-sm btn-outline-danger removeFlashcard">X</button>
  `;
  flashcardsList.appendChild(div);
}

// Quiz row
const createQuizRow = (question='', choices=['','','',''], answer=0) => {
  const div = document.createElement('div');
  div.className = 'mb-2 p-2 border rounded';
  div.innerHTML = `
    <input type="text" class="form-control form-control-sm quizQuestion mb-1" placeholder="Question" value="${question}">
    <div class="d-flex gap-1">
      ${choices.map((c,i)=>`<input type="text" class="form-control form-control-sm quizChoice" placeholder="Choice ${i+1}" value="${c}">`).join('')}
    </div>
    <select class="form-select form-select-sm mt-1 quizAnswer">
      <option value="0" ${answer===0?'selected':''}>A</option>
      <option value="1" ${answer===1?'selected':''}>B</option>
      <option value="2" ${answer===2?'selected':''}>C</option>
      <option value="3" ${answer===3?'selected':''}>D</option>
    </select>
    <button class="btn btn-sm btn-outline-danger mt-1 removeQuiz">Remove</button>
  `;
  quizList.appendChild(div);
}

// Add flashcard
addFlashcardBtn.addEventListener('click', ()=>createFlashcardRow());

// Add quiz
addQuestionBtn.addEventListener('click', ()=>createQuizRow());

// Remove delegation
flashcardsList.addEventListener('click', e=>{
  if(e.target.classList.contains('removeFlashcard')) e.target.parentElement.remove();
});
quizList.addEventListener('click', e=>{
  if(e.target.classList.contains('removeQuiz')) e.target.parentElement.remove();
});

// Save Capsule
$('#saveCapsuleBtn').addEventListener('click', ()=>{
  const meta = {
    title: $('#titleInput').value.trim(),
    subject: $('#subjectInput').value.trim(),
    level: $('#levelInput').value,
    description: $('#descInput').value.trim()
  };
  if(!meta.title){
    alert('Title is required');
    return;
  }
  const notes = notesInput.value.split('\n').filter(n=>n.trim()!=='');
  const flashcards = [...flashcardsList.querySelectorAll('.flashFront')].map((f,i)=>{
    return {front: f.value, back: flashcardsList.querySelectorAll('.flashBack')[i].value};
  }).filter(f=>f.front || f.back);
  const quiz = [...quizList.querySelectorAll('.quizQuestion')].map((q,i)=>{
    const choices = [...quizList.querySelectorAll('.quizChoice')].slice(i*4,i*4+4).map(c=>c.value);
    const answer = parseInt(quizList.querySelectorAll('.quizAnswer')[i].value);
    return {question:q.value, choices, answer};
  }).filter(q=>q.question || q.choices.some(c=>c));

  if(notes.length===0 && flashcards.length===0 && quiz.length===0){
    alert('Add at least notes, flashcards or quiz');
    return;
  }

  const id = editingId || generateId();
  const capsule = {meta, notes, flashcards, quiz, updatedAt:new Date().toISOString(), schema:'pocket-classroom/v1'};
  saveToStorage(`pc_capsule_${id}`, capsule);

  let index = loadFromStorage('pc_capsules_index') || [];
  const existIndex = index.findIndex(c=>c.id===id);
  if(existIndex>=0) index[existIndex] = {id, ...meta, updatedAt:capsule.updatedAt};
  else index.push({id, ...meta, updatedAt:capsule.updatedAt});
  saveToStorage('pc_capsules_index', index);

  renderLibrary();
  alert('Capsule saved!');
});
