

import { loadCapsule, loadProgress, saveProgress } from './storage.js';
import { escapeHTML } from './utils.js';

export function renderLearn(id){
  const container = document.getElementById('learn');
  const capsule = loadCapsule(id);
  if(!capsule){ container.innerHTML = '<div class="alert alert-danger">Capsule not found</div>'; return; }

  container.innerHTML = `
    <div class="mb-3 d-flex justify-content-between align-items-start">
      <div>
        <h3 class="mb-0"><i class="bi bi-book-half"></i> ${escapeHTML(capsule.meta.title)}</h3>
        <div class="small-muted">${escapeHTML(capsule.meta.subject)} • <span class="badge bg-info">${escapeHTML(capsule.meta.level)}</span></div>
      </div>
      <div class="text-end small-muted">Updated: ${escapeHTML(capsule.updatedAt||'')}</div>
    </div>

    <div class="btn-group mb-3" role="group">
      <button class="btn btn-outline-primary active" data-mode="notes">Notes</button>
      <button class="btn btn-outline-primary" data-mode="flashcards">Flashcards</button>
      <button class="btn btn-outline-primary" data-mode="quiz">Quiz</button>
    </div>

    <div id="learn-body"></div>
  `;

  const body = container.querySelector('#learn-body');
  let mode = 'notes';
  showNotes();

  container.querySelectorAll('[data-mode]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      container.querySelectorAll('[data-mode]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      if(mode==='notes') showNotes();
      if(mode==='flashcards') showFlashcards();
      if(mode==='quiz') showQuiz();
    });
  });

  // NOTES
  function showNotes(){
    if(!capsule.notes || capsule.notes.length === 0){ body.innerHTML = '<p>No notes available.</p>'; return; }
    body.innerHTML = `
      <input id="note-search" class="form-control mb-2" placeholder="Search notes...">
      <ul class="list-group" id="note-list">
        ${capsule.notes.map(n=>`<li class="list-group-item">${escapeHTML(n)}</li>`).join('')}
      </ul>
    `;
    body.querySelector('#note-search').addEventListener('input', e=>{
      const q = e.target.value.toLowerCase();
      body.querySelectorAll('#note-list li').forEach(li=> li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none');
    });
  }

  // FLASHCARDS
  function showFlashcards(){
    if(!capsule.flashcards || capsule.flashcards.length === 0){ body.innerHTML = '<p>No flashcards available.</p>'; return; }
    let idx = 0;
    const progress = loadProgress(capsule.id) || {};
    const knownSet = new Set(progress.knownCards || []);

    renderCard();

    function renderCard(){
      const fc = capsule.flashcards[idx];
      body.innerHTML = `
        <div class="card p-3 text-center">
          <div id="flashcard" class="flashcard mb-3">
            <div class="flashcard-inner ${knownSet.has(idx)?'known':''}">
              <div class="flashcard-face card flashcard-front">${escapeHTML(fc.front)}</div>
              <div class="flashcard-face card flashcard-back">${escapeHTML(fc.back)}</div>
            </div>
          </div>
          <div class="d-flex justify-content-center gap-2">
            <button id="prev" class="btn btn-outline-secondary btn-sm"><i class="bi bi-skip-start"></i></button>
            <button id="flip" class="btn btn-outline-primary btn-sm"><i class="bi bi-arrow-repeat"></i> Flip</button>
            <button id="next" class="btn btn-outline-secondary btn-sm"><i class="bi bi-skip-end"></i></button>
          </div>
          <div class="mt-2 d-flex justify-content-center gap-2">
            <button id="mark-known" class="btn btn-success btn-sm"><i class="bi bi-check-circle"></i> Known</button>
            <button id="mark-unknown" class="btn btn-warning btn-sm"><i class="bi bi-x-circle"></i> Unknown</button>
          </div>
          <p class="mt-2 small-muted">Card ${idx+1} of ${capsule.flashcards.length}</p>
        </div>
      `;

      const flash = body.querySelector('#flashcard');
      const inner = flash.querySelector('.flashcard-inner');
      flash.querySelector('#flip').addEventListener('click', ()=> inner.classList.toggle('flipped'));
      flash.addEventListener('click', ()=> inner.classList.toggle('flipped'));

      body.querySelector('#prev').addEventListener('click', ()=> {
        idx = (idx - 1 + capsule.flashcards.length) % capsule.flashcards.length;
        renderCard();
      });
      body.querySelector('#next').addEventListener('click', ()=> {
        idx = (idx + 1) % capsule.flashcards.length;
        renderCard();
      });
      body.querySelector('#mark-known').addEventListener('click', ()=>{
        knownSet.add(idx);
        saveProgress(capsule.id, { ...(progress||{}), knownCards: Array.from(knownSet) });
        renderCard();
      });
      body.querySelector('#mark-unknown').addEventListener('click', ()=>{
        knownSet.delete(idx);
        saveProgress(capsule.id, { ...(progress||{}), knownCards: Array.from(knownSet) });
        renderCard();
      });
      // keyboard: space to flip
      document.onkeydown = (e)=>{ if(e.code === 'Space' && mode === 'flashcards'){ e.preventDefault(); inner.classList.toggle('flipped'); } };
    }
  }

  // QUIZ
  function showQuiz(){
    if(!capsule.quiz || capsule.quiz.length === 0){ body.innerHTML = '<p>No quiz available.</p>'; return; }
    let idx = 0, score = 0;
    const progress = loadProgress(capsule.id) || {};

    renderQuestion();

    function renderQuestion(){
      const q = capsule.quiz[idx];
      body.innerHTML = `
        <div class="card p-3">
          <h5>${escapeHTML(q.question)}</h5>
          <div class="list-group mb-2">
            ${q.choices.map((c,i)=>`<button class="list-group-item list-group-item-action q-choice" data-idx="${i}">${escapeHTML(c)}</button>`).join('')}
          </div>
          <div id="feedback" class="mb-2"></div>
          <p class="small-muted">Question ${idx+1} of ${capsule.quiz.length}</p>
        </div>
      `;
      body.querySelectorAll('.q-choice').forEach(btn=> btn.addEventListener('click', ()=>{
        const chosen = parseInt(btn.dataset.idx);
        const correct = q.answer;
        const feedback = body.querySelector('#feedback');
        if(chosen === correct){ score++; feedback.innerHTML = '<div class="text-success">Correct!</div>'; }
        else { feedback.innerHTML = '<div class="text-danger">Wrong. Correct: ' + escapeHTML(q.choices[correct]) + '</div>'; }
        setTimeout(()=>{
          idx++;
          if(idx >= capsule.quiz.length){
            const percent = Math.round((score / capsule.quiz.length) * 100);
            const prevBest = progress.bestScore || 0;
            if(percent > prevBest) { saveProgress(capsule.id, { ...progress, bestScore: percent }); }
            body.innerHTML = '<div class="alert alert-info">Quiz finished! Score: ' + score + ' / ' + capsule.quiz.length + ' (' + percent + '%)</div>';
            return;
          }
          renderQuestion();
        }, 1000);
      }));
    }
  }
}
