
import { loadCapsule, saveCapsule } from './storage.js';
import { escapeHTML, generateId } from './utils.js';

export function renderAuthor(id=null){
  const container = document.getElementById('author');
  let capsule = null;
  if(id){
    capsule = loadCapsule(id);
  }
  if(!capsule){
    capsule = {
      id: generateId(),
      schema: 'pocket-classroom/v1',
      meta: { title:'', subject:'', level:'Beginner', description:'' },
      notes: [], flashcards: [], quiz: [], updatedAt: new Date().toISOString()
    };
  }

  container.innerHTML = `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4><i class="bi bi-pencil-square"></i> ${id ? 'Edit Capsule' : 'New Capsule'}</h4>
        <div class="small-muted">ID: ${capsule.id}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Title *</label>
        <input id="cap-title" class="form-control" value="${escapeHTML(capsule.meta.title)}" />
      </div>
      <div class="row gx-2 mb-3">
        <div class="col-6"><label class="form-label">Subject</label><input id="cap-subject" class="form-control" value="${escapeHTML(capsule.meta.subject)}" /></div>
        <div class="col-6"><label class="form-label">Level</label><select id="cap-level" class="form-select"><option ${capsule.meta.level==='Beginner'?'selected':''}>Beginner</option><option ${capsule.meta.level==='Intermediate'?'selected':''}>Intermediate</option><option ${capsule.meta.level==='Advanced'?'selected':''}>Advanced</option></select></div>
      </div>
      <div class="mb-3"><label class="form-label">Description</label><textarea id="cap-desc" class="form-control" rows="2">${escapeHTML(capsule.meta.description)}</textarea></div>

      <hr />
      <h5>Notes</h5>
      <textarea id="cap-notes" class="form-control mb-3" rows="4">${escapeHTML((capsule.notes||[]).join('\n'))}</textarea>

      <h5>Flashcards <button id="add-fc" class="btn btn-sm btn-success ms-2"><i class="bi bi-plus-lg"></i></button></h5>
      <div id="flashcards" class="mb-3"></div>

      <h5>Quiz <button id="add-q" class="btn btn-sm btn-success ms-2"><i class="bi bi-plus-lg"></i></button></h5>
      <div id="quiz" class="mb-3"></div>

      <div class="d-flex gap-2 mt-3">
        <button id="save-cap" class="btn btn-primary"><i class="bi bi-save"></i> Save Capsule</button>
        <button id="cancel-cap" class="btn btn-outline-secondary">Cancel</button>
      </div>
    </div>
  `;

  const fcContainer = container.querySelector('#flashcards');
  const qContainer = container.querySelector('#quiz');

  // helpers to add rows
  function addFlashcard(front='', back=''){
    const div = document.createElement('div');
    div.className = 'd-flex gap-2 mb-2 flashcard-row';
    div.innerHTML = `<input class="form-control fc-front" placeholder="Front" value="${escapeHTML(front)}" /><input class="form-control fc-back" placeholder="Back" value="${escapeHTML(back)}" /><button class="btn btn-danger btn-sm fc-remove"><i class="bi bi-trash"></i></button>`;
    div.querySelector('.fc-remove').addEventListener('click', ()=>div.remove());
    fcContainer.appendChild(div);
  }

  function addQuizItem(question='', choices=['','','',''], answer=0, explanation=''){
    const item = document.createElement('div');
    item.className = 'card p-2 mb-2';
    item.innerHTML = `
      <input class="form-control q-question mb-1" placeholder="Question" value="${escapeHTML(question)}" />
      <div class="mb-1">
        ${choices.map((c,i)=>`<input class="form-control q-choice mb-1" placeholder="Choice ${i+1}" value="${escapeHTML(c)}" />`).join('')}
      </div>
      <div class="d-flex gap-2 align-items-center mb-1"><label class="mb-0">Correct index (0-3)</label><input type="number" min="0" max="3" class="form-control q-answer" style="width:80px;" value="${answer}" /></div>
      <input class="form-control q-explain mb-1" placeholder="Explanation (optional)" value="${escapeHTML(explanation)}" />
      <div class="text-end"><button class="btn btn-danger btn-sm q-remove"><i class="bi bi-trash"></i> Remove</button></div>
    `;
    item.querySelector('.q-remove').addEventListener('click', ()=>item.remove());
    qContainer.appendChild(item);
  }

  // load existing
  (capsule.flashcards||[]).forEach(f=>addFlashcard(f.front, f.back));
  (capsule.quiz||[]).forEach(q=>addQuizItem(q.question, q.choices || ['','','',''], q.answer||0, q.explanation||''));

  // events
  container.querySelector('#add-fc').addEventListener('click', ()=>addFlashcard());
  container.querySelector('#add-q').addEventListener('click', ()=>addQuizItem());

  container.querySelector('#cancel-cap').addEventListener('click', ()=>{
    window.dispatchEvent(new CustomEvent('pc:showLibrary'));
  });

  container.querySelector('#save-cap').addEventListener('click', ()=>{
    const title = container.querySelector('#cap-title').value.trim();
    if(!title){ alert('Title is required'); return; }
    const subject = container.querySelector('#cap-subject').value.trim();
    const level = container.querySelector('#cap-level').value;
    const description = container.querySelector('#cap-desc').value.trim();
    const notes = container.querySelector('#cap-notes').value.split('\n').map(s=>s.trim()).filter(Boolean);
    const flashcards = Array.from(container.querySelectorAll('.flashcard-row')).map(r=>({ front: r.querySelector('.fc-front').value.trim(), back: r.querySelector('.fc-back').value.trim() })).filter(f=>f.front || f.back);
    const quiz = Array.from(container.querySelectorAll('#quiz .card')).map(card => {
      const question = card.querySelector('.q-question').value.trim();
      const choices = Array.from(card.querySelectorAll('.q-choice')).map(i=>i.value.trim());
      const answer = parseInt(card.querySelector('.q-answer').value) || 0;
      const explanation = card.querySelector('.q-explain').value.trim();
      return { question, choices, answer, explanation };
    }).filter(q=>q.question && q.choices.length === 4);

    capsule.meta = { title, subject, level, description };
    capsule.notes = notes;
    capsule.flashcards = flashcards;
    capsule.quiz = quiz;
    capsule.updatedAt = new Date().toISOString();

    saveCapsule(capsule);
    alert('Saved!');
    window.dispatchEvent(new CustomEvent('pc:saved',{detail:{id: capsule.id}}));
  });
}
