
// library.js
import { $, $$, loadFromStorage, saveToStorage, timeAgo, downloadJSON } from './utils.js';

const capsuleGrid = $('#capsuleGrid');

// Load all capsules
export const renderLibrary = () => {
  const index = loadFromStorage('pc_capsules_index') || [];
  capsuleGrid.innerHTML = '';

  if(index.length === 0){
    capsuleGrid.innerHTML = `<p class="text-muted">No capsules found. Create one!</p>`;
    return;
  }

  index.forEach(c => {
    const card = document.createElement('div');
    card.className = 'col-sm-6 col-md-4 col-lg-3';
    card.innerHTML = `
      <div class="capsule-card card shadow-sm p-2">
        <h5>${c.title}</h5>
        <p>${c.subject} - ${c.level}</p>
        <small class="text-muted">Updated: ${timeAgo(c.updatedAt)}</small>
        <div class="mt-2 d-flex gap-1 flex-wrap">
          <button class="btn btn-sm btn-success learnBtn" data-id="${c.id}">Learn</button>
          <button class="btn btn-sm btn-primary editBtn" data-id="${c.id}">Edit</button>
          <button class="btn btn-sm btn-outline-secondary exportBtn" data-id="${c.id}">Export</button>
          <button class="btn btn-sm btn-outline-danger deleteBtn" data-id="${c.id}">Delete</button>
        </div>
      </div>
    `;
    capsuleGrid.appendChild(card);
  });
}

// Button events delegation
export const initLibraryEvents = (onLearn, onEdit) => {
  capsuleGrid.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if(!id) return;

    if(e.target.classList.contains('learnBtn')) onLearn(id);
    if(e.target.classList.contains('editBtn')) onEdit(id);
    if(e.target.classList.contains('exportBtn')){
      const capsule = loadFromStorage(`pc_capsule_${id}`);
      downloadJSON(capsule, `${capsule.meta.title}.json`);
    }
    if(e.target.classList.contains('deleteBtn')){
      let index = loadFromStorage('pc_capsules_index') || [];
      index = index.filter(c => c.id !== id);
      saveToStorage('pc_capsules_index', index);
      localStorage.removeItem(`pc_capsule_${id}`);
      renderLibrary();
    }
  });
}
