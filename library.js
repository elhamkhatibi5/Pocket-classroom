
// Library view
let capsulesIndex = [];

function loadLibrary() {
  const storedIndex = localStorage.getItem('pc_capsules_index');
  capsulesIndex = storedIndex ? JSON.parse(storedIndex) : [];
  renderLibrary();
}

function renderLibrary() {
  const grid = $('#capsuleGrid');
  grid.innerHTML = '';
  if (capsulesIndex.length === 0) {
    grid.innerHTML = `<div class="empty-state">No capsules yet. Create one!</div>`;
    return;
  }
  capsulesIndex.forEach(c => {
    const div = document.createElement('div');
    div.className = 'col';
    div.innerHTML = `
      <div class="card p-3 h-100 shadow-sm">
        <h5>${escapeHTML(c.title)}</h5>
        <p>${escapeHTML(c.subject)} | <span class="badge bg-info">${c.level}</span></p>
        <small>Updated: ${timeAgo(c.updatedAt)}</small>
        <div class="mt-2 actions">
          <button class="btn btn-primary btn-sm learnBtn">Learn</button>
          <button class="btn btn-warning btn-sm editBtn">Edit</button>
          <button class="btn btn-outline-success btn-sm exportBtn">Export</button>
          <button class="btn btn-outline-danger btn-sm deleteBtn">Delete</button>
        </div>
      </div>
    `;
    grid.appendChild(div);

    // Buttons
    div.querySelector('.learnBtn').onclick = () => openLearn(c.id);
    div.querySelector('.editBtn').onclick = () => openAuthor(c.id);
    div.querySelector('.exportBtn').onclick = () => exportCapsule(c.id);
    div.querySelector('.deleteBtn').onclick = () => deleteCapsule(c.id);
  });
}

function saveLibraryIndex() {
  localStorage.setItem('pc_capsules_index', JSON.stringify(capsulesIndex));
}

function deleteCapsule(id) {
  if (!confirm('Delete this capsule?')) return;
  capsulesIndex = capsulesIndex.filter(c => c.id !== id);
  localStorage.removeItem(`pc_capsule_${id}`);
  localStorage.removeItem(`pc_progress_${id}`);
  saveLibraryIndex();
  renderLibrary();
}

function exportCapsule(id) {
  const capsule = JSON.parse(localStorage.getItem(`pc_capsule_${id}`));
  const blob = new Blob([JSON.stringify(capsule, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${capsule.title.replace(/\s/g,'_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
