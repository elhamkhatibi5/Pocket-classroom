
import { loadIndex, loadCapsule, deleteCapsule, saveCapsule } from './storage.js';
import { escapeHTML, timeAgo, generateId } from './utils.js';

export function renderLibrary(){
  const container = document.getElementById('library');
  const index = loadIndex();

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3 top-controls">
      <div>
        <h3 class="mb-0"><i class="bi bi-card-list"></i> Library</h3>
        <div class="small-muted">Your saved learning capsules</div>
      </div>
      <div>
        <button id="btn-new" class="btn btn-success me-2"><i class="bi bi-plus-lg"></i> New Capsule</button>
        <button id="btn-import" class="btn btn-primary me-2"><i class="bi bi-upload"></i> Import</button>
        <input id="import-file" type="file" accept=".json" class="d-none" />
      </div>
    </div>
  `;

  if(index.length === 0){
    html += `
      <div class="card p-4 text-center">
        <h5>No capsules yet</h5>
        <p class="text-muted">Create your first capsule with the Author tab or import a sample JSON.</p>
        <div class="mt-3"><button id="empty-new" class="btn btn-success"><i class="bi bi-plus-lg"></i> New Capsule</button></div>
      </div>
    `;
    container.innerHTML = html;
  } else {
    html += `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">`;
    for(const item of index){
      html += `
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="card-title mb-1">${escapeHTML(item.title)}</h5>
                  <div class="small-muted">${escapeHTML(item.subject)}</div>
                </div>
                <div class="text-end">
                  <span class="badge bg-info">${escapeHTML(item.level)}</span>
                  <div class="small-muted mt-1">${timeAgo(item.updatedAt)}</div>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex gap-2 justify-content-between">
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" data-action="learn" data-id="${item.id}" title="Learn"><i class="bi bi-book"></i></button>
                <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${item.id}" title="Edit"><i class="bi bi-pencil"></i></button>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-success" data-action="export" data-id="${item.id}" title="Export"><i class="bi bi-download"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}" title="Delete"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    html += `</div>`;
    container.innerHTML = html;
  }

  // events
  const btnNew = document.getElementById('btn-new');
  if(btnNew) btnNew.addEventListener('click', ()=> window.dispatchEvent(new CustomEvent('pc:openAuthor',{detail:{id:null}})));
  const emptyNew = document.getElementById('empty-new');
  if(emptyNew) emptyNew.addEventListener('click', ()=> window.dispatchEvent(new CustomEvent('pc:openAuthor',{detail:{id:null}})));
  const btnImport = document.getElementById('btn-import');
  const importFile = document.getElementById('import-file');
  if(btnImport) btnImport.addEventListener('click', ()=> importFile.click());
  if(importFile) importFile.addEventListener('change', handleImport);

  container.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action === 'learn') window.dispatchEvent(new CustomEvent('pc:openLearn',{detail:{id}}));
      if(action === 'edit') window.dispatchEvent(new CustomEvent('pc:openAuthor',{detail:{id}}));
      if(action === 'delete') {
        if(confirm('Delete this capsule?')){ deleteCapsule(id); renderLibrary(); }
      }
      if(action === 'export') {
        const capsule = loadCapsule(id);
        if(!capsule){ alert('Capsule not found'); return; }
        const blob = new Blob([JSON.stringify(capsule,null,2)], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (capsule.meta && capsule.meta.title ? capsule.meta.title.replace(/\s+/g,'_') : 'capsule') + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    });
  });

  function handleImport(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{
        const json = JSON.parse(ev.target.result);
        if(!json.schema) json.schema = 'pocket-classroom/v1';
        // basic validation
        if(!json.meta || !json.meta.title) throw new Error('Missing meta.title');
        // ensure id uniqueness
        const id = generateId();
        json.id = id;
        saveCapsule(json);
        alert('Imported: ' + json.meta.title);
        renderLibrary();
      }catch(err){
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
}
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
      try{
        const json = JSON.parse(ev.target.result);
        if(!json.schema) json.schema = 'pocket-classroom/v1';
        // basic validation
        if(!json.meta || !json.meta.title) throw new Error('Missing meta.title');
        // ensure id uniqueness
        const id = generateId();
        json.id = id;
        saveCapsule(json);
        alert('Imported: ' + json.meta.title);
        renderLibrary();
      }catch(err){
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
}
